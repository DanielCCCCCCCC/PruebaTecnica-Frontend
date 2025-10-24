// src/interfaces/Vehicle.ts
export interface IVehicle {
  id: string;
  marca: string;
  modelo: string;
  placa: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFormData {
  marca: string;
  modelo: string;
  placa: string;
}

// Las props (propiedades) para el componente del modal
export interface VehicleModalProps {
  visible: boolean;
  onHide: () => void;
  vehicleToEdit: IVehicle | null;
  onSave: (data: VehicleFormData) => Promise<void>;
  isSaving: boolean;
}