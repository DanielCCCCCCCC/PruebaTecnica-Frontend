import React from 'react'; // Importar React
import { Link, NavLink } from 'react-router-dom';
import { AppRouter } from './router/AppRouter';
import car_12273888 from './assets/car_12273888.png'; // <-- 1. Importar la imagen PNG

// --- Definición de tipos para los iconos ---
type ImgIconProps = React.ImgHTMLAttributes<HTMLImageElement>

const CarIcon: React.FC<ImgIconProps> = ({ className, ...props }) => (
  <img
    src={car_12273888}
    alt="Icono de coche"
    className={`w-8 h-8 ${className || ''}`.trim()}
    {...props}
  />
);
// ---

function App() {
  // Función para aplicar clases condicionalmente a NavLink (igual que antes)
  const navLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
      isActive
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:bg-gray-900">

      {/* --- Barra de Navegación Moderna --- */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo o Título */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                {/* Ahora usa el componente de imagen */}
                <CarIcon />
                <span className="font-bold text-lg text-gray-800 dark:text-white">Gestión Vehicular</span>
              </Link>
            </div>
            {/* Enlaces de Navegación */}
            <div className="flex items-center space-x-4">
              <NavLink to="/vehicles" className={navLinkClasses}>
                Vehículos
              </NavLink>
              <NavLink to="/drivers" className={navLinkClasses}>
                Motorista
              </NavLink>
              <NavLink to="/records" className={navLinkClasses}>
                Registros
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido de la Página */}
      <AppRouter />
    </div>
  );
}

export default App;