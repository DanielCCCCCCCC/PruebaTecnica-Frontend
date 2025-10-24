// src/store/vehicleStore.ts
import { create } from 'zustand';
import api from '../services/api';
import type { IVehicle } from '../interfaces/Vehicle';

// Define la "forma" de tu estado y sus acciones
interface VehicleState {
  vehicles: IVehicle[];
  loading: boolean;
  fetchVehicles: () => Promise<void>;
  addVehicle: (data: Omit<IVehicle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<IVehicle>;
  updateVehicle: (id: string, data: Partial<IVehicle>) => Promise<IVehicle>;
  deleteVehicle: (id: string) => Promise<void>;
}

// Crea el store (la lógica)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useVehicleStore = create<VehicleState>((set, _get) => ({
  vehicles: [],
  loading: false,

  // --- ACCIÓN: Buscar todos los vehículos ---
  fetchVehicles: async () => {
    set({ loading: true });
    try {
      const response = await api.get<IVehicle[]>('/vehicles');
      console.log("[DEBUG VEHICLE] Vehiculos cargados: ", response)
      set({ vehicles: response.data, loading: false });
    } catch (error) {
      console.error("Error al cargar vehículos:", error);
      set({ loading: false });
    }
  },

  // --- ACCIÓN: Añadir un nuevo vehículo ---
  addVehicle: async (data) => {
    try {
      const response = await api.post<IVehicle>('/vehicles', data);
      const newVehicle = response.data;
      // Añade el nuevo vehículo al estado (actualización "optimista" instantánea)
      set((state) => ({
        vehicles: [...state.vehicles, newVehicle],
      }));
      return newVehicle;
    } catch (error) {
      console.error("Error al crear vehículo:", error);
      throw error; // Lanza el error para que el modal lo maneje
    }
  },

  // --- ACCIÓN: Actualizar un vehículo ---
  updateVehicle: async (id, data) => {
    try {
      const response = await api.put<IVehicle>(`/vehicles/${id}`, data);
      const updatedVehicle = response.data;
      // Actualiza la lista de vehículos en el estado
      set((state) => ({
        vehicles: state.vehicles.map((v) =>
          v.id === id ? updatedVehicle : v
        ),
      }));
      return updatedVehicle;
    } catch (error) {
      console.error("Error al actualizar vehículo:", error);
      throw error;
    }
  },

  // --- ACCIÓN: Eliminar un vehículo ---
  deleteVehicle: async (id) => {
    try {
      await api.delete(`/vehicles/${id}`);
      // Elimina el vehículo del estado
      set((state) => ({
        vehicles: state.vehicles.filter((v) => v.id !== id),
      }));
    } catch (error) {
      console.error("Error al eliminar vehículo:", error);
      throw error;
    }
  },
}));