import { useEffect, Fragment } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, Transition } from '@headlessui/react';
// Asumo que estas interfaces ahora usarán driverId
import type { IRecord, ICreateRecord } from '../../interfaces/IRecord';
import { useDriverStore } from '../../store/driverStore'; // <--- 1. IMPORTAR

// --- Interfaces ---

// Los datos que maneja el formulario (strings de inputs)
export interface RecordFormData {
  vehicleId: string;
  driverId: string; // <--- 2. CAMBIADO (de motorista a driverId)
  fecha: string; // Formato YYYY-MM-DD
  hora: string; // Formato HH:MM
  kilometraje: number;
  tipo: string;
}

// Las opciones del combo de vehículos
interface VehicleOption {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
}

// Props del modal
// export interface RecordModalProps {
//   visible: boolean;
//   onHide: () => void;
//   recordToEdit: IRecord | null;
//   onSave: (data: ICreateRecord) => Promise<void>;
//   isSaving: boolean;
//   vehicles: VehicleOption[]; // Lista de vehículos para el <select>
// }
export interface RecordModalProps {
  visible: boolean;
  onHide: () => void;
  recordToEdit: IRecord | null;
  onSave: (data: ICreateRecord) => Promise<void>;
  isSaving: boolean;
  vehicles: VehicleOption[]; // Lista de vehículos para el <select>
  
  // 👇 AÑADE ESTA LÍNEA:
  drivers: {
    id: string;
    nombre: string;
    licencia: string;
  }[];
}
// Icono para cerrar
const XMarkIcon = ({ className = 'w-6 h-6' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// ... (helpers toISODateString y toHHMMString sin cambios) ...
const toISODateString = (date: Date | string | undefined | null) => {
  if (!date) return new Date().toISOString().split('T')[0];
  return new Date(date).toISOString().split('T')[0];
};
const toHHMMString = (time: string | undefined | null) => {
  if (!time) return '08:00';
  return time.substring(0, 5);
};

export function RecordFormModal({
  visible,
  onHide,
  recordToEdit,
  onSave,
  isSaving,
  vehicles,
}: RecordModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecordFormData>();
  const isEditMode = !!recordToEdit;

  // --- 1. OBTENER MOTORISTAS ---
  const { activeDrivers, fetchActiveDrivers } = useDriverStore();

  // Cargar motoristas activos cuando el modal se hace visible
  useEffect(() => {
    if (visible) {
      fetchActiveDrivers();
    }
  }, [visible, fetchActiveDrivers]);
  // --- FIN OBTENER MOTORISTAS ---

  useEffect(() => {
    if (visible) {
      if (isEditMode && recordToEdit) {
        // Modo Edición: Cargar datos existentes
        reset({
          vehicleId: recordToEdit.vehicleId,
          // 2. CAMBIADO (asumiendo que IRecord ahora tiene driverId)
          driverId: recordToEdit.driverId ?? '',
          fecha: toISODateString(recordToEdit.fecha),
          hora: toHHMMString(recordToEdit.hora),
          kilometraje: Number(recordToEdit.kilometraje),
          tipo: recordToEdit.tipo,
        });
      } else {
        // Modo Creación: Valores por defecto
        reset({
          vehicleId: '',
          driverId: '', // 2. CAMBIADO
          fecha: toISODateString(new Date()),
          hora: '08:00',
          kilometraje: 0,
          tipo: 'SALIDA', // Valor por defecto
        });
      }
    }
    // Asegúrate de que IRecord tenga driverId, si no, usa recordToEdit.driver.id
  }, [recordToEdit, visible, reset, isEditMode]);

  /**
   * Transforma los datos del formulario (strings) al DTO
   * que espera la API (con Date object, etc.)
   */
  const onSubmit = (data: RecordFormData) => {
    const localDate = new Date(data.fecha + 'T00:00:00');

    // 2. CAMBIADO (Asumiendo que ICreateRecord espera driverId)
    const dataToSave: ICreateRecord = {
      vehicleId: data.vehicleId,
      driverId: data.driverId,
      fecha: localDate,
      hora: data.hora,
      kilometraje: Number(data.kilometraje), // Aseguramos que sea número
      tipo: data.tipo.toLowerCase() as 'entrada' | 'salida',
    };
    console.log("DEBUG dataToSave:" , dataToSave)
    onSave(dataToSave);
  };

  // --- Clases de Tailwind (sin cambios) ---
  const inputClass = (hasError: boolean) =>
    `mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors
    ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`;

  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300';
  const errorClass = 'mt-1 text-sm text-red-600';
  const buttonBaseClass =
    'inline-flex justify-center rounded-lg border border-transparent px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 transition-colors';
  const primaryButtonClass = `${buttonBaseClass} bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 disabled:bg-blue-300`;
  const secondaryButtonClass = `${buttonBaseClass} bg-gray-100 text-gray-700 hover:bg-gray-200 focus-visible:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600`;

  return (
    <Transition appear show={visible} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onHide}>
        {/* ... (Fondo oscuro y transiciones sin cambios) ... */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
                {/* ... (Cabecera del Modal sin cambios) ... */}
                <div className="flex justify-between items-center">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-bold leading-6 text-gray-900 dark:text-white"
                  >
                    {isEditMode ? 'Editar Registro' : 'Nuevo Registro'}
                  </Dialog.Title>
                  <button
                    onClick={onHide}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <XMarkIcon />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Vehículo (Sin cambios) */}
                    <div>
                      <label htmlFor="vehicleId" className={labelClass}>
                        Vehículo (Placa)
                      </label>
                      <Controller
                        name="vehicleId"
                        control={control}
                        rules={{ required: 'El vehículo es obligatorio.' }}
                        render={({ field, fieldState }) => (
                          <select
                            {...field}
                            id="vehicleId"
                            className={inputClass(!!fieldState.error)}
                          >
                            <option value="" disabled>
                              Seleccione un vehículo...
                            </option>
                            {vehicles.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.placa} ({v.marca} {v.modelo})
                              </option>
                            ))}
                          </select>
                        )}
                      />
                      {errors.vehicleId && (
                        <small className={errorClass}>
                          {errors.vehicleId.message}
                        </small>
                      )}
                    </div>

                    {/* --- 3. CAMPO DE MOTORISTA ACTUALIZADO --- */}
                    <div>
                      <label htmlFor="driverId" className={labelClass}>
                        Motorista
                      </label>
                      <Controller
                        name="driverId" // <--- CAMBIADO
                        control={control}
                        rules={{ required: 'El motorista es obligatorio.' }}
                        render={({ field, fieldState }) => (
                          <select // <--- CAMBIADO (de input a select)
                            {...field}
                            id="driverId"
                            className={inputClass(!!fieldState.error)}
                          >
                            <option value="" disabled>
                              Seleccione un motorista...
                            </option>
                            {/* Mapea los motoristas activos del store */}
                            {activeDrivers.map((driver) => (
                              <option key={driver.id} value={driver.id}>
                                {driver.nombre}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                      {errors.driverId && ( // <--- CAMBIADO
                        <small className={errorClass}>
                          {errors.driverId.message}
                        </small>
                      )}
                    </div>

                    {/* ... (Campos Fecha, Hora, Kilometraje, Tipo sin cambios) ... */}
                    <div>
                      <label htmlFor="fecha" className={labelClass}>
                        Fecha
                      </label>
                      <Controller
                        name="fecha"
                        control={control}
                        rules={{ required: 'La fecha es obligatoria.' }}
                        render={({ field, fieldState }) => (
                          <input
                            {...field}
                            id="fecha"
                            type="date"
                            className={inputClass(!!fieldState.error)}
                          />
                        )}
                      />
                      {errors.fecha && (
                        <small className={errorClass}>
                          {errors.fecha.message}
                        </small>
                      )}
                    </div>

                    <div>
                      <label htmlFor="hora" className={labelClass}>
                        Hora
                      </label>
                      <Controller
                        name="hora"
                        control={control}
                        rules={{
                          required: 'La hora es obligatoria.',
                          pattern: {
                            value: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
                            message: 'Formato HH:MM requerido.',
                          },
                        }}
                        render={({ field, fieldState }) => (
                          <input
                            {...field}
                            id="hora"
                            type="time"
                            className={inputClass(!!fieldState.error)}
                          />
                        )}
                      />
                      {errors.hora && (
                        <small className={errorClass}>
                          {errors.hora.message}
                        </small>
                      )}
                    </div>

                    <div>
                      <label htmlFor="kilometraje" className={labelClass}>
                        Kilometraje
                      </label>
                      <Controller
                        name="kilometraje"
                        control={control}
                        // --- VALIDACIONES ACTUALIZADAS ---
                        rules={{
                          required: 'El kilometraje es obligatorio.',
                          min: {
                            value: 25,
                            message: 'El valor debe ser al menos 25.',
                          },
                          max: {
                            value: 999,
                            message: 'El valor no debe exceder 50.'
                          }
                        }}
                        // --- FIN DE VALIDACIONES ---
                        render={({ field, fieldState }) => (
                          <input
                            {...field}
                            id="kilometraje"
                            type="number"
                            step="0.01"
                            className={inputClass(!!fieldState.error)}
                          />
                        )}
                      />
                      {errors.kilometraje && (
                        <small className={errorClass}>
                          {errors.kilometraje.message}
                        </small>
                      )}
                    </div>

                    <div>
                      <label htmlFor="tipo" className={labelClass}>
                        Tipo de Registro
                      </label>
                      <Controller
                        name="tipo"
                        control={control}
                        rules={{ required: 'El tipo es obligatorio.' }}
                        render={({ field, fieldState }) => (
                          <select
                            {...field}
                            id="tipo"
                            className={inputClass(!!fieldState.error)}
                          >
                            <option value="SALIDA">Salida</option>
                            <option value="ENTRADA">Entrada</option>
                          </select>
                        )}
                      />
                      {errors.tipo && (
                        <small className={errorClass}>
                          {errors.tipo.message}
                        </small>
                      )}
                    </div>
                  </div>

                  {/* ... (Botones del formulario sin cambios) ... */}
                  <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button
                      type="button"
                      disabled={isSaving}
                      className={secondaryButtonClass}
                      onClick={onHide}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className={primaryButtonClass}
                    >
                      {isSaving
                        ? 'Guardando...'
                        : isEditMode
                        ? 'Actualizar'
                        : 'Crear Registro'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
