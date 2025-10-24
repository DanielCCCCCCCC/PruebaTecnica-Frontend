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

  addRecord: async (data) => {
    console.group('🟢 addRecord Debug');
    console.log('➡️ Datos enviados al endpoint /records:', data);

    try {
      const response = await api.post<IRecord>('/records', data);
      console.log('✅ Respuesta completa del servidor:', response);

      const newRecord = response.data;
      console.log('🆕 Nuevo registro recibido:', newRecord);

      set((state) => {
        const updatedRecords = [newRecord, ...state.records];
        console.log('📋 Lista actualizada de registros:', updatedRecords);
        return { records: updatedRecords };
      });

      console.groupEnd();
      return newRecord;

    } catch (error: unknown) {
      console.error('❌ Error al crear registro:');

      if (isAxiosError(error)) {
        console.error('📡 Axios Error:', error.message);
        if (error.response) {
          console.error('📩 Respuesta del servidor:', error.response.data);
          console.error('📊 Código de estado:', error.response.status);
        } else if (error.request) {
          console.error('📭 No hubo respuesta del servidor:', error.request);
        }
      } else if (error instanceof Error) {
        console.error('⚙️ Error genérico:', error.message);
      } else {
        console.error('❓ Error desconocido:', error);
      }

      console.groupEnd();
      throw error;
    }
  },

  updateRecord: async (id, data) => {
    try {
      const response = await api.put<IRecord>(`/records/${id}`, data);
      const updatedRecord = response.data;
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

  deleteRecord: async (id) => {
    try {
      await api.delete(`/records/${id}`);
      set((state) => ({
        records: state.records.filter((r) => r.id !== id),
      }));
    } catch (error) {
      console.error('Error al eliminar registro:', error);
      throw error;
    }
  },
}));