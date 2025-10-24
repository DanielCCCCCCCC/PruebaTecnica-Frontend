import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AppRouter } from './router/AppRouter';
import car_12273888 from './assets/car_12273888.png';

type ImgIconProps = React.ImgHTMLAttributes<HTMLImageElement>
interface SvgIconProps extends React.SVGProps<SVGSVGElement> { className?: string }

const CarIcon: React.FC<ImgIconProps> = ({ className, ...props }) => (
  <img
    src={car_12273888}
    alt="Icono de coche"
    className={`w-8 h-8 ${className || ''}`.trim()}
    {...props}
  />
);

const Bars3Icon: React.FC<SvgIconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);
const XMarkIcon: React.FC<SvgIconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinkClassesDesktop = ({ isActive }: { isActive: boolean }): string =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
      isActive
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
    }`;

  const navLinkClassesMobile = ({ isActive }: { isActive: boolean }): string =>
    `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 ${
      isActive
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
    }`;


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:bg-gray-900">

      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <CarIcon />
                <span className="font-bold text-lg text-gray-800 dark:text-white">Gestión Vehicular</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4"> 
              <NavLink to="/vehicles" className={navLinkClassesDesktop}>
                Vehículos
              </NavLink>
              <NavLink to="/drivers" className={navLinkClassesDesktop}>
                Motorista
              </NavLink>
              <NavLink to="/records" className={navLinkClassesDesktop}>
                Registros
              </NavLink>
            </div>

            <div className="flex md:hidden"> 
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Abrir menú principal</span>
                {isMobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>

          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 dark:border-gray-700">
              <NavLink
                to="/vehicles"
                className={navLinkClassesMobile}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Vehículos
              </NavLink>
              <NavLink
                to="/drivers"
                className={navLinkClassesMobile}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Motorista
              </NavLink>
              <NavLink
                to="/records"
                className={navLinkClassesMobile}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Registros
              </NavLink>
            </div>
          </div>
        )}
      </nav>

      <AppRouter />
    </div>
  );
}

export default App;