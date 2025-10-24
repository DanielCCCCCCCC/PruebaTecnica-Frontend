import React, { useState, useEffect, useMemo, Fragment } from 'react'; // <-- Se añadió useMemo
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';
import { useRecordStore } from '../store/recordStore';
import type { IRecord, ICreateRecord, IFilterRecords } from '../interfaces/IRecord'; 
import { RecordFormModal } from '../components/records/RecordFormModal';

// --- Iconos (Sin cambios) ---
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
const DocumentTextIcon: React.FC<SvgIconProps> = (props) => (
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
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    />
  </svg>
);

// --- Helper de formato de fecha (Sin cambios) ---
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC', 
  });
};

// --- Helper para obtener valores (para ordenar) ---
// (Necesario para ordenar por campos anidados como vehicle.placa)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getSortValue = (obj: IRecord, key: string): any => {
  if (key === 'vehicle.placa') return obj.vehicle?.placa || '';
  if (key === 'driver.nombre') return obj.driver?.nombre || '';
  // Asegurarnos de que la clave es válida para IRecord
  if (key in obj) {
    return obj[key as keyof IRecord];
  }
  return '';
};


function RecordsPage() {
  // --- ESTADO DEL STORE (Sin cambios) ---
  const {
    records,
    filterOptions,
    loading,
    loadingFilters,
    fetchRecords,
    fetchFilterOptions,
    addRecord,
    updateRecord,
    deleteRecord,
  } = useRecordStore();

  // --- ESTADO LOCAL (Sin cambios) ---
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<IRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<IRecord | null>(null);

  // --- ESTADOS DE FILTRO (para los inputs) ---
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [driverFilter, setDriverFilter] = useState(''); 
  const [typeFilter, setTypeFilter] = useState(''); 
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [activeFilters, setActiveFilters] = useState<IFilterRecords>({});

  // --- NUEVOS ESTADOS DE ORDEN Y PAGINACIÓN ---
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [rowsPerPage, setRowsPerPage] = useState(10); // Seteado a 10

  // Carga inicial
  useEffect(() => {
    fetchRecords(activeFilters);
  }, [fetchRecords, activeFilters]);

  // Carga inicial de opciones de filtros
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  // --- LÓGICA DE ORDENAMIENTO (CLIENT-SIDE) ---
  const processedRecords = useMemo(() => {
    const sorted = [...records]; // Empezar con los datos filtrados del server
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
  }, [records, sortConfig]);

  // --- LÓGICA DE PAGINACIÓN (CLIENT-SIDE) ---
  const totalItems = processedRecords.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return processedRecords.slice(startIndex, startIndex + rowsPerPage);
  }, [processedRecords, currentPage, rowsPerPage]);

  // --- FUNCIÓN PARA SOLICITAR ORDEN ---
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Resetear a la primera página al ordenar
  };

  // --- MANEJO DE FILTROS (Actualizado para resetear paginación) ---
  const handleFilterSubmit = () => {
    const newFilters: IFilterRecords = {
      vehicleId: vehicleFilter || undefined,
      driverId: driverFilter || undefined, 
      tipo: typeFilter ? typeFilter.toLowerCase() : undefined,
      startDate: startDateFilter
        ? new Date(startDateFilter + 'T00:00:00')
        : undefined,
      endDate: endDateFilter
        ? new Date(endDateFilter + 'T00:00:00')
        : undefined,
    };
    setActiveFilters(newFilters);
    setCurrentPage(1); // <-- RESETEAR PAGINACIÓN
  };

  const handleFilterClear = () => {
    setVehicleFilter('');
    setTypeFilter('');
    setDriverFilter(''); 
    setStartDateFilter('');
    setEndDateFilter('');
    setActiveFilters({});
    setCurrentPage(1); // <-- RESETEAR PAGINACIÓN
  };

  // --- MANEJO DE MODALES (Sin cambios) ---
  const openNewModal = () => {
    setRecordToEdit(null);
    setIsFormModalVisible(true);
  };
  const openEditModal = (record: IRecord) => {
    setRecordToEdit(record);
    setIsFormModalVisible(true);
  };
  const hideFormModal = () => {
    setIsFormModalVisible(false);
    setRecordToEdit(null);
  };
  const openConfirmModal = (record: IRecord) => {
    setRecordToDelete(record);
    setIsConfirmModalVisible(true);
  };
  const hideConfirmModal = () => {
    setRecordToDelete(null);
    setIsConfirmModalVisible(false);
  };

  // --- LÓGICA DE GUARDADO (Sin cambios) ---
  const handleSave = async (data: ICreateRecord) => {
    setIsSaving(true);
    const toastId = toast.loading('Guardando...');
    try {
      if (recordToEdit) {
        await updateRecord(recordToEdit.id, data);
        toast.success(`Registro actualizado.`, { id: toastId });
      } else {
        await addRecord(data);
        toast.success(`Registro creado.`, { id: toastId });
      }
      setIsSaving(false);
      hideFormModal();
    } catch (error) {
      console.error(error);
      setIsSaving(false);
      const errorMessage =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any)?.response?.data?.message ||
        'No se pudo guardar el registro.';
      toast.error(errorMessage, { id: toastId });
    }
  };

  // --- LÓGICA DE ELIMINACIÓN (Sin cambios) ---
  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;
    const toastId = toast.loading('Eliminando...');
    try {
      await deleteRecord(recordToDelete.id);
      toast.success('Registro eliminado.', { id: toastId });
    } catch (error) {
      console.error(error);
      const errorMessage =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any)?.response?.data?.message ||
        'No se pudo eliminar el registro.';
      toast.error(errorMessage, { id: toastId });
    }
    hideConfirmModal();
  };

  // --- Clases de Tailwind (Sin cambios) ---
  const buttonBaseClass =
    'inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 transition-colors shadow-sm';
  const primaryButtonClass = `${buttonBaseClass} bg-blue-600 text-white border-transparent hover:bg-blue-700 focus-visible:ring-blue-500 disabled:bg-blue-400`;
  const secondaryButtonClass = `${buttonBaseClass} bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 disabled:bg-gray-200 dark:disabled:bg-gray-600`;
  const dangerButtonClass = `${buttonBaseClass} bg-red-600 text-white border-transparent hover:bg-red-700 focus-visible:ring-red-500 disabled:bg-red-300`;
  const inputBaseClass =
    'block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400';
  const labelBaseClass =
    'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
  // NUEVA CLASE PARA ENCABEZADOS DE TABLA
  const thClass = "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider";
  const thSortableClass = `${thClass} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700`;


  // --- FUNCIÓN PARA MANEJAR CAMBIO EN SELECT TIPO (Sin cambios) ---
  const handleTypeFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    setTypeFilter(newValue); 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 p-4 md:p-8 text-gray-900 dark:text-gray-100 dark:bg-gray-900">
      {/* Header (Sin cambios) */}
      <header className="max-w-8xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-300">
              Gestión de Registros
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Bitácora de entradas y salidas de vehículos.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-xl">
              <DocumentTextIcon className="text-blue-600 dark:text-blue-400 h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total registros
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
          {/* Toolbar y Filtros (Sin cambios) */}
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
              <button onClick={openNewModal} className={primaryButtonClass}>
                <PlusIcon />
                Nuevo Registro
              </button>
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Filtros
              </span>
            </div>

            {/* Fila de Filtros (Sin cambios) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro Vehículos */}
              <div>
                <label htmlFor="filt_vehicle" className={labelBaseClass}>
                  Vehículo
                </label>
                <select
                  id="filt_vehicle"
                  className={inputBaseClass}
                  value={vehicleFilter}
                  onChange={(e) => setVehicleFilter(e.target.value)}
                  disabled={loadingFilters}
                >
                  <option value="">Todos</option>
                  {filterOptions.vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.placa} ({v.marca})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Filtro de Motorista/Driver */}
              <div>
                <label htmlFor="filt_driver" className={labelBaseClass}>
                  Motorista
                </label>
                <select
                  id="filt_driver"
                  className={inputBaseClass}
                  value={driverFilter} 
                  onChange={(e) => setDriverFilter(e.target.value)} 
                  disabled={loadingFilters}
                >
                  <option value="">Todos</option>
                  {filterOptions.drivers?.map((d) => ( 
                    <option key={d.id} value={d.id}> 
                      {d.nombre} 
                    </option>
                  ))}
                </select>
              </div>
              {/* Filtro Tipo */}
              <div>
                <label htmlFor="filt_tipo" className={labelBaseClass}>
                  Tipo
                </label>
                <select
                  id="filt_tipo"
                  className={inputBaseClass}
                  value={typeFilter}
                  onChange={handleTypeFilterChange}
                >
                  <option value="">Todos</option>
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                </select>
              </div>
              {/* Filtros Fecha */}
              <div>
                <label htmlFor="filt_start" className={labelBaseClass}>
                  Fecha Inicio
                </label>
                <input
                  id="filt_start"
                  type="date"
                  className={inputBaseClass}
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="filt_end" className={labelBaseClass}>
                  Fecha Fin
                </label>
                <input
                  id="filt_end"
                  type="date"
                  className={inputBaseClass}
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                />
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

          {/* Table (ACTUALIZADA) */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {/* ENCABEZADOS DE TABLA ACTUALIZADOS CON SORTING */}
                  <th
                    scope="col"
                    className={thSortableClass}
                    onClick={() => requestSort('vehicle.placa')}
                  >
                    Vehículo (Placa)
                    {/* Aquí podrías agregar un ícono de flecha basado en sortConfig */}
                  </th>
                  <th
                    scope="col"
                    className={thSortableClass}
                    onClick={() => requestSort('driver.nombre')}
                  >
                    Motorista
                  </th>
                  <th
                    scope="col"
                    className={thSortableClass}
                    onClick={() => requestSort('fecha')}
                  >
                    Fecha
                  </th>
                  <th
                    scope="col"
                    className={thSortableClass}
                    onClick={() => requestSort('hora')}
                  >
                    Hora
                  </th>
                  <th
                    scope="col"
                    className={thSortableClass}
                    onClick={() => requestSort('kilometraje')}
                  >
                    Kilometraje
                  </th>
                  <th
                    scope="col"
                    className={thSortableClass}
                    onClick={() => requestSort('tipo')}
                  >
                    Tipo
                  </th>
                  <th scope="col" className={thClass}> {/* Sin ordenar */}
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-gray-500 dark:text-gray-400 italic"
                    >
                      Cargando registros...
                    </td>
                  </tr>
                // ACTUALIZADO: Mapear sobre 'paginatedRecords'
                ) : paginatedRecords.length > 0 ? (
                  paginatedRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {record.vehicle?.placa || (
                          <span className="italic text-gray-400">N/A</span>
                        )}
                        <span className="block text-xs text-gray-500">
                          {record.vehicle?.marca} {record.vehicle?.modelo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {record.driver?.nombre || (
                            <span className="italic text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(record.fecha)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {record.hora}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {record.kilometraje.toLocaleString()} km
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.tipo === 'SALIDA'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}
                        >
                          {record.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEditModal(record)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                            title="Editar"
                          >
                            <PencilIcon />
                          </button>
                          <button
                            onClick={() => openConfirmModal(record)}
                            className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                            title="Eliminar"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-gray-500 dark:text-gray-400 italic"
                    >
                      {/* Lógica de mensaje 'No resultados' actualizada */}
                      {records.length === 0 && Object.keys(activeFilters).length === 0
                        ? 'No hay registros.'
                        : 'No se encontraron registros con los filtros aplicados.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* --- NUEVO PAGINADOR --- */}
          {totalPages > 1 && (
            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center sm:justify-between gap-2">
              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                Mostrando {Math.min((currentPage - 1) * rowsPerPage + 1, totalItems)} 
                {" "}a {Math.min(currentPage * rowsPerPage, totalItems)} de {totalItems} registros
              </span>
              <div className="inline-flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`${secondaryButtonClass} rounded-r-none px-3 py-1 text-xs`}
                >
                  Anterior
                </button>
                  <span className="text-xs text-gray-600 dark:text-gray-400 px-2">
                    Pág {currentPage} de {totalPages}
                  </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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

      {/* Modals (Sin cambios) */}
      <RecordFormModal
        visible={isFormModalVisible}
        onHide={hideFormModal}
        recordToEdit={recordToEdit}
        onSave={handleSave}
        isSaving={isSaving}
        vehicles={filterOptions.vehicles} 
      />
      <Transition appear show={isConfirmModalVisible} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={hideConfirmModal}>
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
                          ¿Estás seguro de eliminar este registro? Esta acción
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

      {/* Footer (Sin cambios) */}
      <footer className="mt-8 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Sistema de Gestión Vehicular &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

export default RecordsPage;
