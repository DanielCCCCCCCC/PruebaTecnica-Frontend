import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';
import type { IVehicle, VehicleFormData } from '../interfaces/Vehicle';
import { VehicleFormModal } from '../components/vehicles/VehicleFormModal';
import { useVehicleStore } from '../store/vehicleStore';
import car_12273888 from '../assets/car_12273888.png';

type ImgIconProps = React.ImgHTMLAttributes<HTMLImageElement>;
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
// Correct Trash Icon
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
const SearchIcon: React.FC<SvgIconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
      clipRule="evenodd"
    />
  </svg>
);

const CarIcon: React.FC<ImgIconProps> = ({ className, ...props }) => (
  <img
    src={car_12273888}
    alt="Icono de coche"
    className={`w-10 h-8 ${className || ''}`.trim()}
    {...props}
  />
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

// Definimos las columnas que tendrán filtro
type FilterableColumn = 'placa' | 'marca' | 'modelo';

function VehiclesPage() {
  // --- ESTADO DEL STORE ---
  const {
    vehicles,
    loading,
    fetchVehicles,
    deleteVehicle,
    addVehicle,
    updateVehicle,
  } = useVehicleStore();

  // --- ESTADO LOCAL ---
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<IVehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<IVehicle | null>(null);

  // --- ESTADOS DE FILTRO Y PAGINACIÓN ---
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [columnFilters, setColumnFilters] = useState<
    Record<FilterableColumn, string>
  >({
    placa: '',
    marca: '',
    modelo: '',
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof IVehicle;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [rowsPerPage] = useState(12); // Ajustado a 12 para tarjetas

  // Carga inicial
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // --- LÓGICA DE FILTRADO, ORDENADO Y PAGINACIÓN (CLIENT-SIDE) ---
  const processedVehicles = useMemo(() => {
    const filtered = vehicles.filter((vehicle) => {
      // Filtro Global
      const globalMatch =
        vehicle.placa.toLowerCase().includes(globalFilter.toLowerCase()) ||
        vehicle.marca.toLowerCase().includes(globalFilter.toLowerCase()) ||
        vehicle.modelo.toLowerCase().includes(globalFilter.toLowerCase());

      // Filtros de Columna
      const columnMatch = (
        Object.keys(columnFilters) as FilterableColumn[]
      ).every((key) =>
        vehicle[key].toLowerCase().includes(columnFilters[key].toLowerCase()),
      );

      return globalMatch && columnMatch;
    });

    // Ordenado
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [vehicles, globalFilter, columnFilters, sortConfig]);

  // Paginación
  const totalItems = processedVehicles.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return processedVehicles.slice(startIndex, startIndex + rowsPerPage);
  }, [processedVehicles, currentPage, rowsPerPage]);

  // --- HANDLER PARA ORDENAMIENTO (DESDE EL SELECT) ---
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '') {
      setSortConfig(null);
    } else {
      const [key, direction] = value.split('-') as [
        keyof IVehicle,
        'asc' | 'desc',
      ];
      setSortConfig({ key, direction });
    }
    setCurrentPage(1); // Resetear a la primera página al ordenar
  };

  const handleColumnFilterChange = (key: FilterableColumn, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Resetear a la primera página al filtrar
  };
  // ---

  // --- MANEJO DE MODALES (sin cambios) ---
  const openNewModal = () => {
    setVehicleToEdit(null);
    setIsFormModalVisible(true);
  };
  const openEditModal = (vehicle: IVehicle) => {
    setVehicleToEdit(vehicle);
    setIsFormModalVisible(true);
  };
  const hideFormModal = () => {
    setIsFormModalVisible(false);
    setVehicleToEdit(null);
  };
  const openConfirmModal = (vehicle: IVehicle) => {
    setVehicleToDelete(vehicle);
    setIsConfirmModalVisible(true);
  };
  const hideConfirmModal = () => {
    setVehicleToDelete(null);
    setIsConfirmModalVisible(false);
  };

  // --- LÓGICA DE GUARDADO (sin cambios) ---
  const handleSave = async (data: VehicleFormData) => {
    setIsSaving(true);
    const toastId = toast.loading('Guardando...');
    try {
      const vehicleName = `${data.marca} ${data.modelo}`;
      if (vehicleToEdit) {
        await updateVehicle(vehicleToEdit.id, data);
        toast.success(`Vehículo ${vehicleName} actualizado.`, { id: toastId });
      } else {
        await addVehicle(data);
        toast.success(`Vehículo ${vehicleName} creado.`, { id: toastId });
      }
      setIsSaving(false);
      hideFormModal();
    } catch (error) {
      console.error(error);
      setIsSaving(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any)?.response?.data?.message ||
        'No se pudo guardar el vehículo.';
      toast.error(errorMessage, { id: toastId });
    }
  };

  // --- LÓGICA DE ELIMINACIÓN (sin cambios) ---
  const handleDeleteConfirm = async () => {
    if (!vehicleToDelete) return;
    const toastId = toast.loading('Eliminando...');
    try {
      await deleteVehicle(vehicleToDelete.id);
      toast.success('Vehículo eliminado.', { id: toastId });
    } catch (error) {
      console.error(error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any)?.response?.data?.message ||
        'No se pudo eliminar el vehículo.';
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
              Gestión de Vehículos
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Administra y mantiene el registro de vehículos del sistema.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-xl">
              <CarIcon className="text-blue-600 dark:text-blue-400 h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total registros
              </p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">
                {totalItems}
              </p>{' '}
              {/* Mostrar total filtrado/original */}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-8xl mx-auto">
        <div className="shadow-2xl rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 overflow-hidden">
          {/* Toolbar (Botón y Búsqueda Global) */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-5 border-b border-gray-200 dark:border-gray-700">
            <button onClick={openNewModal} className={primaryButtonClass}>
              <PlusIcon />
              Nuevo Vehículo
            </button>
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="text-gray-400" />
              </div>
              <input
                type="text"
                value={globalFilter}
                onChange={(e) => {
                  setGlobalFilter(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar (Global)..."
                className={`${inputBaseClass} pl-10`}
              />
            </div>
          </div>

          {/* --- NUEVA SECCIÓN DE FILTROS Y ORDEN --- */}
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Filtro Placa */}
              <div>
                <label htmlFor="filt_placa" className={labelBaseClass}>
                  Placa
                </label>
                <input
                  id="filt_placa"
                  type="text"
                  placeholder="Filtrar por placa..."
                  className={inputBaseClass}
                  value={columnFilters.placa}
                  onChange={(e) =>
                    handleColumnFilterChange('placa', e.target.value)
                  }
                />
              </div>
              {/* Filtro Marca */}
              <div>
                <label htmlFor="filt_marca" className={labelBaseClass}>
                  Marca
                </label>
                <input
                  id="filt_marca"
                  type="text"
                  placeholder="Filtrar por marca..."
                  className={inputBaseClass}
                  value={columnFilters.marca}
                  onChange={(e) =>
                    handleColumnFilterChange('marca', e.target.value)
                  }
                />
              </div>
              {/* Filtro Modelo */}
              <div>
                <label htmlFor="filt_modelo" className={labelBaseClass}>
                  Modelo
                </label>
                <input
                  id="filt_modelo"
                  type="text"
                  placeholder="Filtrar por modelo..."
                  className={inputBaseClass}
                  value={columnFilters.modelo}
                  onChange={(e) =>
                    handleColumnFilterChange('modelo', e.target.value)
                  }
                />
              </div>
              {/* Nuevo Sort Select */}
              <div>
                <label htmlFor="filt_sort" className={labelBaseClass}>
                  Ordenar por
                </label>
                <select
                  id="filt_sort"
                  className={inputBaseClass}
                  value={
                    sortConfig
                      ? `${sortConfig.key}-${sortConfig.direction}`
                      : ''
                  }
                  onChange={handleSortChange}
                >
                  <option value="">Por defecto</option>
                  <option value="placa-asc">Placa (A-Z)</option>
                  <option value="placa-desc">Placa (Z-A)</option>
                  <option value="marca-asc">Marca (A-Z)</option>
                  <option value="marca-desc">Marca (Z-A)</option>
                  <option value="modelo-asc">Modelo (A-Z)</option>
                  <option value="modelo-desc">Modelo (Z-A)</option>
                </select>
              </div>
            </div>
          </div>
          {/* --- FIN NUEVA SECCIÓN --- */}

          {/* --- INICIO: REEMPLAZO DE TABLA POR GRID DE TARJETAS --- */}
          <div className="p-4 md:p-6 bg-gray-50/50 dark:bg-gray-900/30">
            {loading ? (
              <div className="py-10 text-center text-gray-500 dark:text-gray-400 italic">
                Cargando vehículos...
              </div>
            ) : paginatedVehicles.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex flex-col justify-between rounded-xl bg-white p-4 shadow-lg transition-all duration-200 hover:shadow-2xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80"
                  >
                    {/* Contenido Principal */}
                    <div>
                      {/* Cabecera de Tarjeta */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <h3
                            className="text-xl font-bold text-blue-700 dark:text-blue-400 truncate"
                            title={vehicle.placa}
                          >
                            {vehicle.placa}
                          </h3>
                        </div>
                      </div>

                      {/* Detalles */}
                      <div className="space-y-1.5 text-sm">
                        <div className="flex">
                          <span className="w-16 flex-shrink-0 font-medium text-gray-700 dark:text-gray-300">
                            Marca:
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 truncate">
                            {vehicle.marca}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="w-16 flex-shrink-0 font-medium text-gray-700 dark:text-gray-300">
                            Modelo:
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 truncate">
                            {vehicle.modelo}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="mt-4 flex justify-end gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
                      <button
                        onClick={() => openEditModal(vehicle)}
                        className="rounded-md p-1 text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-blue-900/50"
                        title="Editar"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        onClick={() => openConfirmModal(vehicle)}
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
                {vehicles.length === 0
                  ? 'No hay vehículos registrados.'
                  : 'No se encontraron vehículos con los filtros aplicados.'}
              </div>
            )}
          </div>
          {/* --- FIN: REEMPLAZO DE TABLA --- */}

          {/* Paginator */}
          {totalPages > 1 && (
            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center sm:justify-between gap-2">
              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                Mostrando{' '}
                {Math.min((currentPage - 1) * rowsPerPage + 1, totalItems)} a{' '}
                {Math.min(currentPage * rowsPerPage, totalItems)} de {totalItems}{' '}
                registros
              </span>
              <div className="inline-flex items-center gap-1">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`${secondaryButtonClass} rounded-r-none px-3 py-1 text-xs`}
                >
                  Anterior
                </button>
                <span className="text-xs text-gray-600 dark:text-gray-400 px-2">
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
        </div>
      </main>

      {/* Modals */}
      <VehicleFormModal
        visible={isFormModalVisible}
        onHide={hideFormModal}
        vehicleToEdit={vehicleToEdit}
        onSave={handleSave}
        isSaving={isSaving}
      />
      <Transition appear show={isConfirmModalVisible} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={hideConfirmModal}>
          {/* Background overlay */}
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
          {/* Modal content */}
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
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
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
                          ¿Estás seguro de eliminar el vehículo{' '}
                          <strong>{vehicleToDelete?.placa}</strong>? Esta acción
                          no se puede deshacer.
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

      {/* Footer */}
      <footer className="mt-8 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Sistema de Gestión Vehicular &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

export default VehiclesPage;