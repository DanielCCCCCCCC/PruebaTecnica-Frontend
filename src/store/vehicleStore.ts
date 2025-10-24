// src/store/vehicleStore.ts
import { create } from 'zustand';
import api from '../services/api';
import type { IVehicle } from '../interfaces/Vehicle';

interface VehicleState {
  vehicles: IVehicle[];
  loading: boolean;
  fetchVehicles: () => Promise<void>;
  addVehicle: (data: Omit<IVehicle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<IVehicle>;
  updateVehicle: (id: string, data: Partial<IVehicle>) => Promise<IVehicle>;
  deleteVehicle: (id: string) => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useVehicleStore = create<VehicleState>((set, _get) => ({
  vehicles: [],
  loading: false,

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

  addVehicle: async (data) => {
    try {
      const response = await api.post<IVehicle>('/vehicles', data);
      const newVehicle = response.data;
      set((state) => ({
        vehicles: [...state.vehicles, newVehicle],
      }));
      return newVehicle;
    } catch (error) {
      console.error("Error al crear vehículo:", error);
      throw error;
    }
  },

  updateVehicle: async (id, data) => {
    try {
      const response = await api.put<IVehicle>(`/vehicles/${id}`, data);
      const updatedVehicle = response.data;
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

  deleteVehicle: async (id) => {
    try {
      await api.delete(`/vehicles/${id}`);
      set((state) => ({
        vehicles: state.vehicles.filter((v) => v.id !== id),
      }));
    } catch (error) {
      console.error("Error al eliminar vehículo:", error);
      throw error;
    }
  },
}));