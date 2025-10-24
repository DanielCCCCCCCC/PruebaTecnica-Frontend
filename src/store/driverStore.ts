import { create } from 'zustand';
import api from '../services/api';

// --- Interfaces (Basadas en tu backend) ---

// Coincide con tu driver.entity.ts
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

// Coincide con tu create-driver.dto.ts
export interface ICreateDriver {
  nombre: string;
  licencia: string;
  telefono?: string;
  email?: string;
}

// Coincide con tu update-driver.dto.ts
export interface IUpdateDriver extends Partial<ICreateDriver> {
  activo?: boolean;
}

// Coincide con tu filter-drivers.dto.ts
export interface IFilterDrivers {
  nombre?: string;
  licencia?: string;
  activo?: boolean;
}

// --- Definición del Store ---
interface DriverState {
  drivers: IDriver[];
  activeDrivers: IDriver[]; // Lista separada para combos
  loading: boolean;
  fetchDrivers: (filters?: IFilterDrivers) => Promise<void>;
  fetchActiveDrivers: () => Promise<void>;
  addDriver: (data: ICreateDriver) => Promise<IDriver>;
  updateDriver: (id: string, data: IUpdateDriver) => Promise<IDriver>;
  deleteDriver: (id: string) => Promise<void>;
}

// --- Creación del Store ---
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useDriverStore = create<DriverState>((set, _get) => ({
  drivers: [],
  activeDrivers: [],
  loading: false,

  /**
   * ACCIÓN: Buscar todos los motoristas, aplicando filtros
   */
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

  /**
   * ACCIÓN: Buscar solo motoristas activos (para combos)
   */
  fetchActiveDrivers: async () => {
    try {
      const response = await api.get<IDriver[]>('/drivers/active');
      set({ activeDrivers: response.data });
    } catch (error) {
      console.error('Error al cargar motoristas activos:', error);
    }
  },

  /**
   * ACCIÓN: Añadir un nuevo motorista
   */
  addDriver: async (data) => {
    try {
      const response = await api.post<IDriver>('/drivers', data);
      const newDriver = response.data;
      // Añade al estado (ordenado por ASC, así que lo añadimos al final)
      set((state) => ({
        drivers: [...state.drivers, newDriver],
      }));
      return newDriver;
    } catch (error) {
      console.error('Error al crear motorista:', error);
      throw error; // Lanza el error para que el modal lo maneje
    }
  },

  /**
   * ACCIÓN: Actualizar un motorista
   */
  updateDriver: async (id, data) => {
    try {
      const response = await api.put<IDriver>(`/drivers/${id}`, data);
      const updatedDriver = response.data;
      // Actualiza la lista
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

  /**
   * ACCIÓN: Eliminar un motorista
   */
  deleteDriver: async (id) => {
    try {
      await api.delete(`/drivers/${id}`);
      // Elimina del estado
      set((state) => ({
        drivers: state.drivers.filter((d) => d.id !== id),
      }));
    } catch (error) {
      console.error('Error al eliminar motorista:', error);
      throw error;
    }
  },
}));