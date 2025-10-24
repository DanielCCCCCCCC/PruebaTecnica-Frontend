import { useEffect, Fragment } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, Transition } from '@headlessui/react';
import type { VehicleModalProps, VehicleFormData } from '../../interfaces/Vehicle';

// Interfaz para los iconos (opcional, pero útil)
interface IconProps { className?: string }

// Iconos SVG para reemplazar 'primeicons'
const XMarkIcon = ({ className = "w-6 h-6" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export function VehicleFormModal({ visible, onHide, vehicleToEdit, onSave, isSaving }: VehicleModalProps) {
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm<VehicleFormData>();
  const isEditMode = !!vehicleToEdit;

  useEffect(() => {
    if (visible) {
      if (isEditMode && vehicleToEdit) {
        reset({
          marca: vehicleToEdit.marca,
          modelo: vehicleToEdit.modelo,
          placa: vehicleToEdit.placa,
        });
      } else {
        reset({ marca: '', modelo: '', placa: '' });
      }
    }
  }, [vehicleToEdit, visible, reset, isEditMode]);

  const onSubmit = (data: VehicleFormData) => {
    onSave(data);
  };

  // --- Clases de Tailwind para componentes ---
  const inputClass = (hasError: boolean) => 
    `mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors
    ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`;
  
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
  const errorClass = "mt-1 text-sm text-red-600";
  const buttonBaseClass = "inline-flex justify-center rounded-lg border border-transparent px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 transition-colors";
  const primaryButtonClass = `${buttonBaseClass} bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 disabled:bg-blue-300`;
  const secondaryButtonClass = `${buttonBaseClass} bg-gray-100 text-gray-700 hover:bg-gray-200 focus-visible:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600`;
  // ---

  return (
    <Transition appear show={visible} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onHide}>
        {/* Fondo oscuro del modal */}
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
                <div className="flex justify-between items-center">
                  <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 dark:text-white">
                    {isEditMode ? "Editar Vehículo" : "Nuevo Vehículo"}
                  </Dialog.Title>
                  <button onClick={onHide} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <XMarkIcon />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
                  <div>
                    <label htmlFor="marca" className={labelClass}>Marca</label>
                    <Controller
                      name="marca"
                      control={control}
                      // --- VALIDACIONES AÑADIDAS ---
                      rules={{ 
                        required: 'La marca es obligatoria.',
                        minLength: {
                          value: 1,
                          message: 'La marca debe tener al menos 1 caracter.'
                        },
                        maxLength: {
                          value: 10,
                          message: 'La marca no debe exceder los 15 caracteres.'
                        }
                      }}
                      // --- FIN DE VALIDACIONES ---
                      render={({ field, fieldState }) => (
                        <input {...field} id="marca" type="text" className={inputClass(!!fieldState.error)} />
                      )}
                    />
                    {errors.marca && <small className={errorClass}>{errors.marca.message}</small>}
                  </div>

                  <div>
                    <label htmlFor="modelo" className={labelClass}>Modelo</label>
                    <Controller
                      name="modelo"
                      control={control}
                      // --- VALIDACIONES AÑADIDAS ---
                      rules={{ 
                        required: 'El modelo es obligatorio.',
                        minLength: {
                          value: 1,
                          message: 'El modelo debe tener al menos 1 caracter.'
                        },
                        maxLength: {
                          value: 10,
                          message: 'El modelo no debe exceder los 10 caracteres.'
                        }
                      }}
                      // --- FIN DE VALIDACIONES ---
                      render={({ field, fieldState }) => (
                        <input {...field} id="modelo" type="text" className={inputClass(!!fieldState.error)} />
                      )}
                    />
                    {errors.modelo && <small className={errorClass}>{errors.modelo.message}</small>}
                  </div>

                  <div>
                    <label htmlFor="placa" className={labelClass}>Placa</label>
                    <Controller
                      name="placa"
                      control={control}
                      // --- VALIDACIONES AÑADIDAS Y AJUSTADAS ---
                      rules={{ 
                        required: 'La placa es obligatoria.',
                        minLength: {
                          value: 1,
                          message: 'La placa debe tener al menos 1 caracter.'
                        },
                        maxLength: {
                          value: 10,
                          message: 'La placa no debe exceder los 10 caracteres.'
                        },
                        pattern: { 
                          value: /^[A-Z0-9-]+$/, 
                          message: 'La placa debe contener solo letras mayúsculas, números y guiones.' // Mensaje ajustado al DTO
                        } 
                      }}
                      // --- FIN DE VALIDACIONES ---
                      render={({ field, fieldState }) => (
                        <input {...field} id="placa" type="text" className={inputClass(!!fieldState.error)} placeholder="Ej: HBC-1234" />
                      )}
                    />
                    {errors.placa && <small className={errorClass}>{errors.placa.message}</small>}
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button type="button" disabled={isSaving} className={secondaryButtonClass} onClick={onHide}>
                      Cancelar
                    </button>
                    <button type="submit" disabled={isSaving} className={primaryButtonClass}>
                      {isSaving ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear Vehículo')}
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