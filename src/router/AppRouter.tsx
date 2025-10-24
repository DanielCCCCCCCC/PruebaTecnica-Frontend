import { Routes, Route, Navigate } from 'react-router-dom';
import VehiclesPage from '../pages/VehiclesPage';
import RecordsPage from '../pages/RecordsPage';
import DriversPage from '../pages/DriversPage';
// Importa aquí tus otras páginas cuando las crees
// import RecordsPage from '../pages/RecordsPage';

export function AppRouter() {
  return (
    <div style={{ padding: '1rem' }}>
      <Routes>
        {/* Ruta por defecto: redirige a /vehicles */}
        <Route path="/" element={<Navigate to="/vehicles" replace />} />

        {/* Módulo de Vehículos */}
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path='/drivers' element={<DriversPage />} /> 
        <Route path="/records" element={<RecordsPage />} />

        <Route path="*" element={<h1>404: Página No Encontrada</h1>} />
      </Routes>
    </div>
  );
}