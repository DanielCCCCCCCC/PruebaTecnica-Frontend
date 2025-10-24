import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const baseURL = apiUrl || 'http://localhost:3000';

console.log(`[API Config] Using base URL: ${baseURL}`);

const api = axios.create({
  baseURL: baseURL,
});

export default api;