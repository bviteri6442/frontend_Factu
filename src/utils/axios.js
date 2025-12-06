import axios from 'axios'
import { API_BASE_URL } from '@/config/api'
import router from '@/router'
import Swal from 'sweetalert2'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - Add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      const { status, data, config } = error.response
      
      // Unauthorized - Token expired or invalid
      // Don't show session expired if it's a login attempt
      if (status === 401 && !config.url.includes('/Auth/login')) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
        Swal.fire({
          icon: 'warning',
          title: 'Sesión Expirada',
          text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          confirmButtonColor: '#4a90e2'
        })
      }
      
      // Forbidden - No permissions
      if (status === 403) {
        Swal.fire({
          icon: 'error',
          title: 'Acceso Denegado',
          text: 'No tienes permisos para realizar esta acción.',
          confirmButtonColor: '#e74c3c'
        })
      }
      
      // Server errors
      if (status >= 500) {
        Swal.fire({
          icon: 'error',
          title: 'Error del Servidor',
          text: 'Ha ocurrido un error en el servidor. Por favor, intenta más tarde.',
          confirmButtonColor: '#e74c3c'
        })
      }
    } else if (error.request) {
      // Network error
      Swal.fire({
        icon: 'error',
        title: 'Error de Conexión',
        text: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
        confirmButtonColor: '#e74c3c'
      })
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
