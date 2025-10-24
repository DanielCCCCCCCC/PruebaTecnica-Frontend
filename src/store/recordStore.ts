// src/store/recordStore.ts
import { create } from 'zustand';
import api from '../services/api';
import type { IRecord, IFilterOptions, RecordState } from '../interfaces/IRecord';
import { isAxiosError } from 'axios';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useRecordStore = create<RecordState>((set, _get) => ({
  records: [],
  filterOptions: { vehicles: [], drivers: [] },
  loading: false,
  loadingFilters: false,
  error: null,


  fetchRecords: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get<IRecord[]>('/records', {
        params: filters,
      });
      console.log("[DEBUG REGISTROS]", response.data);
      set({ records: response.data, loading: false });
    } catch (error) {
      console.error('Error al cargar registros:', error);
      set({ 
        loading: false, 
        error: (error as Error).message 
      });
    }
  },

  /**
   * ACCIÓN: Obtener las opciones para los combos de filtro
   */
  fetchFilterOptions: async () => {
    set({ loadingFilters: true, error: null });
    try {
      const response = await api.get<IFilterOptions>('/records/filters');
      console.log("[DEBUG TIPO] desde la store", response.data);
      set({ filterOptions: response.data, loadingFilters: false });
    } catch (error) {
      console.error('Error al cargar opciones de filtro:', error);
      set({ 
        filterOptions: { vehicles: [], drivers: [] }, 
        loadingFilters: false,
        error: (error as Error).message 
      });
    }
  },

  /**
   * ACCIÓN: Añadir un nuevo registro
   */
  addRecord: async (data) => {
  console.group('🟢 addRecord Debug');
  console.log('➡️ Datos enviados al endpoint /records:', data);

  try {
    const response = await api.post<IRecord>('/records', data);
    console.log('✅ Respuesta completa del servidor:', response);

    const newRecord = response.data;
    console.log('🆕 Nuevo registro recibido:', newRecord);

    // Añade el nuevo registro al inicio de la lista (para coincidir con el DESC)
    set((state) => {
      const updatedRecords = [newRecord, ...state.records];
      console.log('📋 Lista actualizada de registros:', updatedRecords);
      return { records: updatedRecords };
    });

    console.groupEnd();
    return newRecord;

  } catch (error: unknown) {
    console.error('❌ Error al crear registro:');

    // Verificamos si es un error de Axios
    if (isAxiosError(error)) {
      console.error('📡 Axios Error:', error.message);
      if (error.response) {
        console.error('📩 Respuesta del servidor:', error.response.data);
        console.error('📊 Código de estado:', error.response.status);
      } else if (error.request) {
        console.error('📭 No hubo respuesta del servidor:', error.request);
      }
    } else if (error instanceof Error) {
      // Cualquier otro tipo de error
      console.error('⚙️ Error genérico:', error.message);
    } else {
      console.error('❓ Error desconocido:', error);
    }

    console.groupEnd();
    throw error; // Re-lanza el error para que el modal/formulario lo maneje
  }
},


  /**
   * ACCIÓN: Actualizar un registro
   */
  updateRecord: async (id, data) => {
    try {
      const response = await api.put<IRecord>(`/records/${id}`, data);
      const updatedRecord = response.data;
      // Actualiza la lista de registros en el estado
      set((state) => ({
        records: state.records.map((r) =>
          r.id === id ? updatedRecord : r
        ),
      }));
      return updatedRecord;
    } catch (error) {
      console.error('Error al actualizar registro:', error);
      throw error;
    }
  },

  /**
   * ACCIÓN: Eliminar un registro
   */
  deleteRecord: async (id) => {
    try {
      await api.delete(`/records/${id}`);
      // Elimina el registro del estado
      set((state) => ({
        records: state.records.filter((r) => r.id !== id),
      }));
    } catch (error) {
      console.error('Error al eliminar registro:', error);
      throw error;
    }
  },
}));