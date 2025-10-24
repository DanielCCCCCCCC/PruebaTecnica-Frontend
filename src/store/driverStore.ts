import { create } from 'zustand';
import api from '../services/api';

export interface IDriver {
  id: string;
  nombre: string;
  licencia: string;
  telefono: string | null;
  email: string | null;
  activo: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ICreateDriver {
  nombre: string;
  licencia: string;
  telefono?: string;
  email?: string;
}

export interface IUpdateDriver extends Partial<ICreateDriver> {
  activo?: boolean;
}

export interface IFilterDrivers {
  nombre?: string;
  licencia?: string;
  activo?: boolean;
}

interface DriverState {
  drivers: IDriver[];
  activeDrivers: IDriver[];
  loading: boolean;
  fetchDrivers: (filters?: IFilterDrivers) => Promise<void>;
  fetchActiveDrivers: () => Promise<void>;
  addDriver: (data: ICreateDriver) => Promise<IDriver>;
  updateDriver: (id: string, data: IUpdateDriver) => Promise<IDriver>;
  deleteDriver: (id: string) => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useDriverStore = create<DriverState>((set, _get) => ({
  drivers: [],
  activeDrivers: [],
  loading: false,

  fetchDrivers: async (filters = {}) => {
    set({ loading: true });
    try {
      const response = await api.get<IDriver[]>('/drivers', {
        params: filters,
      });
      set({ drivers: response.data, loading: false });
    } catch (error) {
      console.error('Error al cargar motoristas:', error);
      set({ loading: false });
    }
  },

  fetchActiveDrivers: async () => {
    try {
      const response = await api.get<IDriver[]>('/drivers/active');
      set({ activeDrivers: response.data });
    } catch (error) {
      console.error('Error al cargar motoristas activos:', error);
    }
  },

  addDriver: async (data) => {
    try {
      const response = await api.post<IDriver>('/drivers', data);
      const newDriver = response.data;
      set((state) => ({
        drivers: [...state.drivers, newDriver],
      }));
      return newDriver;
    } catch (error) {
      console.error('Error al crear motorista:', error);
      throw error;
    }
  },

  updateDriver: async (id, data) => {
    try {
      const response = await api.put<IDriver>(`/drivers/${id}`, data);
      const updatedDriver = response.data;
      set((state) => ({
        drivers: state.drivers.map((d) =>
          d.id === id ? updatedDriver : d
        ),
      }));
      return updatedDriver;
    } catch (error) {
      console.error('Error al actualizar motorista:', error);
      throw error;
    }
  },

  deleteDriver: async (id) => {
    try {
      await api.delete(`/drivers/${id}`);
      set((state) => ({
        drivers: state.drivers.filter((d) => d.id !== id),
      }));
    } catch (error) {
      console.error('Error al eliminar motorista:', error);
      throw error;
    }
  },
}));