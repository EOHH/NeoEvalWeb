import axios from 'axios';

// Creamos una instancia global de Axios
export const apiClient = axios.create({
  // 🔥 Vite inyectará mágicamente el valor del archivo .env o .env.production
  baseURL: import.meta.env.VITE_API_URL, 
  withCredentials: true, // Vital para recibir las cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Sesión expirada o no autorizada");
    }
    return Promise.reject(error);
  }
);