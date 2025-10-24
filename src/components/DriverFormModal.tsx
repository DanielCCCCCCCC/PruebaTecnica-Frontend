import { useEffect, Fragment } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, Transition } from '@headlessui/react';
import type { IDriver, ICreateDriver, IUpdateDriver } from '../store/driverStore';

export interface DriverFormData {
  nombre: string;
  licencia: string;
  telefono: string;
  email: string;
  activo: boolean;
}

export interface DriverModalProps {
  visible: boolean;
  onHide: () => void;
  driverToEdit: IDriver | null;
  onSave: (data: ICreateDriver | IUpdateDriver) => Promise<void>;
  isSaving: boolean;
}

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

export function DriverFormModal({
  visible,
  onHide,
  driverToEdit,
  onSave,
  isSaving,
}: DriverModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DriverFormData>();
  const isEditMode = !!driverToEdit;

  useEffect(() => {
    if (visible) {
      if (isEditMode && driverToEdit) {
        reset({
          nombre: driverToEdit.nombre,
          licencia: driverToEdit.licencia,
          telefono: driverToEdit.telefono || '',
          email: driverToEdit.email || '',
          activo: driverToEdit.activo,
        });
      } else {
        reset({
          nombre: '',
          licencia: '',
          telefono: '',
          email: '',
          activo: true,
        });
      }
    }
  }, [driverToEdit, visible, reset, isEditMode]);

  const onSubmit = (data: DriverFormData) => {
    const dto = {
      ...data,
      telefono: data.telefono || undefined,
      email: data.email || undefined,
    };

    if (isEditMode) {
      onSave(dto as IUpdateDriver);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { activo, ...createDto } = dto;
      onSave(createDto as ICreateDriver);
    }
  };

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
                <div className="flex justify-between items-center">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-bold leading-6 text-gray-900 dark:text-white"
                  >
                    {isEditMode ? 'Editar Motorista' : 'Nuevo Motorista'}
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
                    <div className="md:col-span-2">
                      <label htmlFor="nombre" className={labelClass}>
                        Nombre Completo
                      </label>
                      <Controller
                        name="nombre"
                        control={control}
                        rules={{
                          required: 'El nombre es obligatorio.',
                          minLength: {
                            value: 1,
                            message: 'El nombre debe tener al menos 1 caracter.',
                          },
                          maxLength: {
                            value: 30,
                            message: 'El nombre no debe exceder los 30 caracteres.',
                          },
                        }}
                        render={({ field, fieldState }) => (
                          <input
                            {...field}
                            id="nombre"
                            type="text"
                            className={inputClass(!!fieldState.error)}
                          />
                        )}
                      />
                      {errors.nombre && (
                        <small className={errorClass}>
                          {errors.nombre.message}
                        </small>
                      )}
                    </div>

                    <div>
                      <label htmlFor="licencia" className={labelClass}>
                        N° de Licencia
                      </label>
                      <Controller
                        name="licencia"
                        control={control}
                        rules={{
                          required: 'La licencia es obligatoria.',
                          minLength: {
                            value: 1,
                            message: 'La licencia debe tener al menos 1 caracter.',
                          },
                          maxLength: {
                            value: 20,
                            message: 'La licencia no debe exceder los 20 caracteres.',
                          },
                          pattern: {
                            value: /^[A-Z0-9-]+$/,
                            message: 'La licencia debe contener solo letras mayúsculas, números y guiones',
                          },
                        }}
                        render={({ field, fieldState }) => (
                          <input
                            {...field}
                            id="licencia"
                            type="text"
                            className={inputClass(!!fieldState.error)}
                          />
                        )}
                      />
                      {errors.licencia && (
                        <small className={errorClass}>
                          {errors.licencia.message}
                        </small>
                      )}
                    </div>

                    <div>
                      <label htmlFor="telefono" className={labelClass}>
                        Teléfono (Opcional)
                      </label>
                      <Controller
                        name="telefono"
                        control={control}
                        rules={{
                          minLength: {
                            value: 1,
                            message: 'El teléfono debe tener al menos 1 caracter.',
                          },
                          maxLength: {
                            value: 15,
                            message: 'El teléfono no debe exceder los 15 caracteres.',
                          },
                        }}
                        render={({ field, fieldState }) => (
                          <input
                            {...field}
                            id="telefono"
                            type="tel"
                            className={inputClass(!!fieldState.error)}
                          />
                        )}
                      />
                      {errors.telefono && (
                        <small className={errorClass}>
                          {errors.telefono.message}
                        </small>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="email" className={labelClass}>
                        Email (Opcional)
                      </label>
                      <Controller
                        name="email"
                        control={control}
                        rules={{
                          minLength: {
                            value: 1,
                            message: 'El email debe tener al menos 1 caracter.',
                          },
                          maxLength: {
                            value: 255,
                            message: 'El email no debe exceder los 255 caracteres.',
                          },
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Email no válido.',
                          },
                        }}
                        render={({ field, fieldState }) => (
                          <input
                            {...field}
                            id="email"
                            type="email"
                            className={inputClass(!!fieldState.error)}
                          />
                        )}
                      />
                      {errors.email && (
                        <small className={errorClass}>
                          {errors.email.message}
                        </small>
                      )}
                    </div>

                    {isEditMode && (
                      <div className="md:col-span-2 flex items-center gap-3 mt-2">
                        <Controller
                          name="activo"
                          control={control}
                          render={({ field }) => (
                            <input
                              id="activo"
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          )}
                        />
                        <label htmlFor="activo" className={labelClass}>
                          Motorista Activo
                        </label>
                      </div>
                    )}
                  </div>

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
                        : 'Crear Motorista'}
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