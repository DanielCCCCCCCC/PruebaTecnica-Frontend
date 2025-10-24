import axios from 'axios';

// Lee la variable VITE_API_URL (inyectada por Vite desde .env o Cloudflare)
const apiUrl = import.meta.env.VITE_API_URL;

// Fallback por si acaso
const baseURL = apiUrl || 'http://localhost:3000'; // En producción, apiUrl NO debería ser undefined

console.log(`[API Config] Using base URL: ${baseURL}`); // <-- ¡REVISA ESTE LOG!

const api = axios.create({
  baseURL: baseURL,
});

export default api;