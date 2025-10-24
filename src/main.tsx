import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { Toaster } from 'react-hot-toast'; // <-- Para notificaciones

// --- ¡ELIMINA TODAS LAS LÍNEAS DE PRIMEREACT! ---
// import { PrimeReactProvider } from 'primereact/api';
// import 'primereact/themes/aura-light-blue/theme.css';
// import 'primereact/resources/primereact.min.css';
// import 'primeicons/primeicons.css';

import './index.css'; // Tu CSS de Tailwind

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Quitamos el PrimeReactProvider */}
    <BrowserRouter>
      <App />
      {/* Añadimos el componente de notificaciones */}
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          className: 'shadow-lg rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
);