// src/interfaces/IRecord.ts
import type { IDriver } from '../store/driverStore'; 

export interface IRecord {
  id: string;
  vehicleId: string;
  driverId: string | null; 
  fecha: Date | string; 
  hora: string;
  kilometraje: number;
  tipo: string; 
  createdAt: Date | string;
  vehicle: {
    id: string;
    placa: string;
    marca: string;
    modelo: string;
  };
  driver: IDriver | null; 
}

export interface ICreateRecord {
  vehicleId: string;
  driverId: string; // <-- CAMBIADO
  fecha: Date;
  hora: string;
  kilometraje: number;
  tipo: string; 
}
export type IUpdateRecord = Partial<ICreateRecord>;

export interface IFilterRecords {
  fecha?: Date;
  vehicleId?: string;
  driverId?: string;
  tipo?: string; // <-- AÑADIDO (puede ser string o RecordType si lo compartes)
  startDate?: Date;
  endDate?: Date;
}

export interface IFilterOptions {
  vehicles: {
    id: string;
    placa: string;
    marca: string;
    modelo: string;
  }[];
  drivers: { 
    id: string;
    nombre: string;
    licencia: string;

  }[]; 
}
export interface RecordState {
  records: IRecord[];
  filterOptions: IFilterOptions;
  loading: boolean;
  loadingFilters: boolean;
  error: string | null; // AÑADIR esta propiedad
  fetchRecords: (filters?: IFilterRecords) => Promise<void>;
  fetchFilterOptions: () => Promise<void>;
  addRecord: (data: ICreateRecord) => Promise<IRecord>;
  updateRecord: (id: string, data: IUpdateRecord) => Promise<IRecord>;
  deleteRecord: (id: string) => Promise<void>;
}