import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';
import { useDriverStore } from '../store/driverStore';
import type {
  IDriver,
  ICreateDriver,
  IUpdateDriver,
  IFilterDrivers,
} from '../store/driverStore';
import { DriverFormModal } from '../components/drivers/DriverFormModal';

// --- Iconos ---
interface SvgIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}
const PlusIcon: React.FC<SvgIconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
    {...props}
  >
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);
const PencilIcon: React.FC<SvgIconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
    {...props}
  >
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);
const TrashIcon: React.FC<SvgIconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.11-2.368.11a.75.75 0 00-.73.81.75.75 0 00.73.69h13.276a.75.75 0 00.73-.69.75.75 0 00-.73-.81c-.788 0-1.573-.033-2.368-.11v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.029 2.5.085v.113c-.827.056-1.66.086-2.5.086s-1.673-.03-2.5-.086V4.085C8.327 4.03 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.84 0a.75.75 0 011.5.06l-.3 7.5a.75.75 0 11-1.5-.06l.3-7.5z"
      clipRule="evenodd"
    />
    <path d="M5.5 5.25h9a.75.75 0 01.75.75v9.5a2 2 0 01-2 2h-6a2 2 0 01-2-2v-9.5a.75.75 0 01.75-.75z" />
  </svg>
);
const AlertIcon: React.FC<SvgIconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
    />
  </svg>
);
// Icono para la cabecera (Motoristas)
const UserGroupIcon: React.FC<SvgIconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 18.72a9.094 9.094 0 00-12 0m12 0a9.094 9.094 0 01-12 0m12 0A9.094 9.094 0 016 18.72m12 0v-1.04A4.832 4.832 0 0013.833 13.5H10.17a4.832 4.832 0 00-4.343 4.18M15 9a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

// --- Helper para obtener valores (para ordenar) ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getSortValue = (obj: IDriver, key: string): any => {
  // Asegurarnos de que la clave es válida para IDriver
  if (key in obj) {
    return obj[key as keyof IDriver];
  }
  return '';
};

function DriversPage() {
  // --- ESTADO DEL STORE ---
  const {
    drivers,
    loading,
    fetchDrivers,
    addDriver,
    updateDriver,
    deleteDriver,
  } = useDriverStore();

  // --- ESTADO LOCAL ---
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [driverToEdit, setDriverToEdit] = useState<IDriver | null>(null);
  const [driverToDelete, setDriverToDelete] = useState<IDriver | null>(null);

  // --- ESTADOS DE FILTRO (para los inputs) ---
  const [nombreFilter, setNombreFilter] = useState('');
  const [licenciaFilter, setLicenciaFilter] = useState('');
  const [activoFilter, setActivoFilter] = useState<'true' | 'false' | ''>('');

  // Filtro activo que se pasa al store
  const [activeFilters, setActiveFilters] = useState<IFilterDrivers>({});

  // --- NUEVOS ESTADOS DE ORDEN Y PAGINACIÓN ---
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [rowsPerPage] = useState(12); // Ajustado para layout de tarjetas

  // Carga inicial
  useEffect(() => {
    fetchDrivers(activeFilters);
  }, [fetchDrivers, activeFilters]);

  // --- LÓGICA DE ORDENAMIENTO (CLIENT-SIDE) ---
  const processedDrivers = useMemo(() => {
    const sorted = [...drivers]; // Empezar con los datos filtrados del server
    if (sortConfig !== null) {
      sorted.sort((a, b) => {
        const valA = getSortValue(a, sortConfig.key);
        const valB = getSortValue(b, sortConfig.key);
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [drivers, sortConfig]);

  // --- LÓGICA DE PAGINACIÓN (CLIENT-SIDE) ---
  const totalItems = processedDrivers.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const paginatedDrivers = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return processedDrivers.slice(startIndex, startIndex + rowsPerPage);
  }, [processedDrivers, currentPage, rowsPerPage]);

  // --- NUEVO HANDLER PARA ORDENAMIENTO (DESDE EL SELECT) ---
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '') {
      setSortConfig(null);
    } else {
      const [key, direction] = value.split('-') as [string, 'asc' | 'desc'];
      setSortConfig({ key, direction });
    }
    setCurrentPage(1); // Resetear a la primera página al ordenar
  };

  // --- MANEJO DE FILTROS (Actualizado para resetear paginación) ---
  const handleFilterSubmit = () => {
    const newFilters: IFilterDrivers = {
      nombre: nombreFilter || undefined,
      licencia: licenciaFilter || undefined,
      activo: activoFilter === '' ? undefined : activoFilter === 'true',
    };
    setActiveFilters(newFilters);
    setCurrentPage(1); // <-- RESETEAR PAGINACIÓN
  };

  const handleFilterClear = () => {
    setNombreFilter('');
    setLicenciaFilter('');
    setActivoFilter('');
    setActiveFilters({});
    setCurrentPage(1); // <-- RESETEAR PAGINACIÓN
  };

  // --- MANEJO DE MODALES ---
  const openNewModal = () => {
    setDriverToEdit(null);
    setIsFormModalVisible(true);
  };
  const openEditModal = (driver: IDriver) => {
    setDriverToEdit(driver);
    setIsFormModalVisible(true);
  };
  const hideFormModal = () => {
    setIsFormModalVisible(false);
    setDriverToEdit(null);
  };
  const openConfirmModal = (driver: IDriver) => {
    setDriverToDelete(driver);
    setIsConfirmModalVisible(true);
  };
  const hideConfirmModal = () => {
    setDriverToDelete(null);
    setIsConfirmModalVisible(false);
  };

  // --- LÓGICA DE GUARDADO ---
  const handleSave = async (data: ICreateDriver | IUpdateDriver) => {
    setIsSaving(true);
    const toastId = toast.loading('Guardando...');
    try {
      if (driverToEdit) {
        await updateDriver(driverToEdit.id, data as IUpdateDriver);
        toast.success(`Motorista ${data.nombre} actualizado.`, { id: toastId });
      } else {
        await addDriver(data as ICreateDriver);
        toast.success(`Motorista ${data.nombre} creado.`, { id: toastId });
      }
      setIsSaving(false);
      hideFormModal();
      // Refrescar la lista
      handleFilterSubmit();
    } catch (error) {
      console.error(error);
      setIsSaving(false);
      const errorMessage =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any)?.response?.data?.message ||
        'No se pudo guardar el motorista.';
      toast.error(errorMessage, { id: toastId });
    }
  };

  // --- LÓGICA DE ELIMINACIÓN ---
  const handleDeleteConfirm = async () => {
    if (!driverToDelete) return;
    const toastId = toast.loading('Eliminando...');
    try {
      await deleteDriver(driverToDelete.id);
      toast.success('Motorista eliminado.', { id: toastId });
    } catch (error) {
      console.error(error);
      const errorMessage =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any)?.response?.data?.message ||
        'No se pudo eliminar el motorista.';
      toast.error(errorMessage, { id: toastId });
    }
    hideConfirmModal();
  };

  // --- Clases de Tailwind ---
  const buttonBaseClass =
    'inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 transition-colors shadow-sm';
  const primaryButtonClass = `${buttonBaseClass} bg-blue-600 text-white border-transparent hover:bg-blue-700 focus-visible:ring-blue-500 disabled:bg-blue-400`;
  const secondaryButtonClass = `${buttonBaseClass} bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 disabled:bg-gray-200 dark:disabled:bg-gray-600`;
  const dangerButtonClass = `${buttonBaseClass} bg-red-600 text-white border-transparent hover:bg-red-700 focus-visible:ring-red-500 disabled:bg-red-300`;
  const inputBaseClass =
    'block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400';
  const labelBaseClass =
    'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 p-4 md:p-8 text-gray-900 dark:text-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="max-w-8xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-300">
              Gestión de Motoristas
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Administra el personal de conducción.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-xl">
              <UserGroupIcon className="text-blue-600 dark:text-blue-400 h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total motoristas
              </p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">
                {totalItems} {/* MOSTRAR TOTAL DE PROCESSED */}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-8xl mx-auto">
        <div className="shadow-2xl rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 overflow-hidden">
          {/* Toolbar y Filtros */}
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
              <button onClick={openNewModal} className={primaryButtonClass}>
                <PlusIcon />
                Nuevo Motorista
              </button>
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Filtros y Orden
              </span>
            </div>

            {/* Fila de Filtros y Orden (AHORA 4 COLUMNAS) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Filtro Nombre */}
              <div>
                <label htmlFor="filt_nombre" className={labelBaseClass}>
                  Nombre
                </label>
                <input
                  id="filt_nombre"
                  type="text"
                  placeholder="Buscar por nombre..."
                  className={inputBaseClass}
                  value={nombreFilter}
                  onChange={(e) => setNombreFilter(e.target.value)}
                />
              </div>
              {/* Filtro Licencia */}
              <div>
                <label htmlFor="filt_licencia" className={labelBaseClass}>
                  Licencia
                </label>
                <input
                  id="filt_licencia"
                  type="text"
                  placeholder="Buscar por licencia..."
                  className={inputBaseClass}
                  value={licenciaFilter}
                  onChange={(e) => setLicenciaFilter(e.target.value)}
                />
              </div>
              {/* Filtro Estado */}
              <div>
                <label htmlFor="filt_activo" className={labelBaseClass}>
                  Estado
                </label>
                <select
                  id="filt_activo"
                  className={inputBaseClass}
                  value={activoFilter}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(e) => setActivoFilter(e.target.value as any)}
                >
                  <option value="">Todos</option>
                  <option value="true">Activos</option>
                  <option value="false">Inactivos</option>
                </select>
              </div>
              {/* NUEVO: Ordenamiento */}
              <div>
                <label htmlFor="filt_sort" className={labelBaseClass}>
                  Ordenar por
                </label>
                <select
                  id="filt_sort"
                  className={inputBaseClass}
                  value={sortConfig ? `${sortConfig.key}-${sortConfig.direction}` : ''}
                  onChange={handleSortChange}
                >
                  <option value="">Por defecto</option>
                  <option value="nombre-asc">Nombre (A-Z)</option>
                  <option value="nombre-desc">Nombre (Z-A)</option>
                  <option value="licencia-asc">Licencia (A-Z)</option>
                  <option value="licencia-desc">Licencia (Z-A)</option>
                  <option value="activo-desc">Estado (Inactivo primero)</option>
                  <option value="activo-asc">Estado (Activo primero)</option>
                </select>
              </div>
            </div>

            {/* Botones de Filtro */}
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={handleFilterClear} className={secondaryButtonClass}>
                Limpiar
              </button>
              <button onClick={handleFilterSubmit} className={primaryButtonClass}>
                Aplicar Filtros
              </button>
            </div>
          </div>

          {/* --- INICIO: REEMPLAZO DE TABLA POR GRID DE TARJETAS --- */}
          <div className="p-4 md:p-6 bg-gray-50/50 dark:bg-gray-900/30">
            {loading ? (
              <div className="py-10 text-center text-gray-500 dark:text-gray-400 italic">
                Cargando motoristas...
              </div>
            ) : paginatedDrivers.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedDrivers.map((driver) => (
                  <div
                    key={driver.id}
                    className="flex flex-col justify-between rounded-xl bg-white p-4 shadow-lg transition-all duration-200 hover:shadow-2xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80"
                  >
                    {/* Contenido Principal de la Tarjeta */}
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        {/* Nombre y Licencia */}
                        <div className="flex-1">
                          <h3
                            className="text-lg font-bold text-gray-900 dark:text-white truncate"
                            title={driver.nombre}
                          >
                            {driver.nombre}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Lic: {driver.licencia}
                          </p>
                        </div>
                        {/* Badge de Estado */}
                        <span
                          className={`flex-shrink-0 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            driver.activo
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {driver.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>

                      {/* Detalles de Contacto */}
                      <div className="space-y-1.5 text-sm">
                        {driver.telefono && (
                          <div className="flex">
                            <span className="w-14 flex-shrink-0 font-medium text-gray-700 dark:text-gray-300">
                              Tel:
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {driver.telefono}
                            </span>
                          </div>
                        )}
                        {driver.email && (
                          <div className="flex">
                            <span className="w-14 flex-shrink-0 font-medium text-gray-700 dark:text-gray-300">
                              Email:
                            </span>
                            <span
                              className="text-gray-600 dark:text-gray-400 truncate"
                              title={driver.email}
                            >
                              {driver.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acciones en el pie de la tarjeta */}
                    <div className="mt-4 flex justify-end gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
                      <button
                        onClick={() => openEditModal(driver)}
                        className="rounded-md p-1 text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-blue-900/50"
                        title="Editar"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        onClick={() => openConfirmModal(driver)}
                        className="rounded-md p-1 text-red-600 transition-colors hover:bg-red-100 hover:text-red-800 dark:hover:bg-red-900/50"
                        title="Eliminar"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Mensaje de no resultados
              <div className="py-10 text-center text-gray-500 dark:text-gray-400 italic">
                {drivers.length === 0 && Object.keys(activeFilters).length === 0
                  ? 'No hay motoristas registrados.'
                  : 'No se encontraron motoristas con los filtros.'}
              </div>
            )}
          </div>
          {/* --- FIN: REEMPLAZO DE TABLA --- */}

          {/* --- PAGINADOR (Se mantiene igual) --- */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-2 border-t border-gray-200 bg-gray-50 px-5 py-3 sm:flex-row sm:justify-between dark:border-gray-700 dark:bg-gray-700/50">
              <span className="text-xs text-gray-700 sm:text-sm dark:text-gray-300">
                Mostrando {Math.min((currentPage - 1) * rowsPerPage + 1, totalItems)}{' '}
                a {Math.min(currentPage * rowsPerPage, totalItems)} de {totalItems}{' '}
                registros
              </span>
              <div className="inline-flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`${secondaryButtonClass} rounded-r-none px-3 py-1 text-xs`}
                >
                  Anterior
                </button>
                <span className="px-2 text-xs text-gray-600 dark:text-gray-400">
                  Pág {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`${secondaryButtonClass} rounded-l-none px-3 py-1 text-xs`}
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
          {/* --- FIN DEL PAGINADOR --- */}
        </div>
      </main>

      {/* Modals (Se mantienen iguales) */}
      <DriverFormModal
        visible={isFormModalVisible}
        onHide={hideFormModal}
        driverToEdit={driverToEdit}
        onSave={handleSave}
        isSaving={isSaving}
      />
      <Transition appear show={isConfirmModalVisible} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={hideConfirmModal}>
          {/* Overlay */}
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
          {/* Contenido */}
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
                  <div className="flex items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10 dark:bg-red-900/50">
                      <AlertIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-bold leading-6 text-gray-900 dark:text-white"
                      >
                        Confirmar Eliminación
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ¿Estás seguro de eliminar al motorista{' '}
                          <strong>{driverToDelete?.nombre}</strong>? Esta acción no
                          se puede deshacer.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row-reverse sm:gap-3">
                    <button
                      type="button"
                      className={dangerButtonClass + ' w-full sm:w-auto'}
                      onClick={handleDeleteConfirm}
                    >
                      Sí, eliminar
                    </button>
                    <button
                      type="button"
                      className={
                        secondaryButtonClass + ' w-full sm:w-auto mt-3 sm:mt-0'
                      }
                      onClick={hideConfirmModal}
                    >
                      Cancelar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Footer (Se mantiene igual) */}
      <footer className="mt-8 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Sistema de Gestión Vehicular &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

export default DriversPage;