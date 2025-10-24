import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { Toaster } from 'react-hot-toast';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
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