import apiClient from '@/utils/axios'
import { API_ENDPOINTS } from '@/config/api'

export const logsService = {
  // Intentos de Login
  async getIntentosLogin(filtros = {}) {
    const params = new URLSearchParams()
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio)
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin)
    if (filtros.exitoso !== undefined) params.append('exitoso', filtros.exitoso)
    if (filtros.usuario) params.append('usuario', filtros.usuario)
    
    const response = await apiClient.get(`${API_ENDPOINTS.LOGS_INTENTOS_LOGIN}?${params}`)
    return response.data
  },

  async getEstadisticasIntentosLogin() {
    const response = await apiClient.get(API_ENDPOINTS.LOGS_INTENTOS_LOGIN_STATS)
    return response.data
  },

  async generarPDFIntentosLogin(filtros = {}) {
    const params = new URLSearchParams()
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio)
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin)
    
    const response = await apiClient.get(`${API_ENDPOINTS.LOGS_INTENTOS_LOGIN_PDF}?${params}`)
    return response.data
  },

  // Logs de Errores
  async getErrores(filtros = {}) {
    const params = new URLSearchParams()
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio)
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin)
    if (filtros.nivel) params.append('nivel', filtros.nivel)
    if (filtros.revisado !== undefined) params.append('revisado', filtros.revisado)
    
    const response = await apiClient.get(`${API_ENDPOINTS.LOGS_ERRORES}?${params}`)
    return response.data
  },

  async getEstadisticasErrores() {
    const response = await apiClient.get(API_ENDPOINTS.LOGS_ERRORES_STATS)
    return response.data
  },

  async marcarErrorRevisado(id, notas = null) {
    const response = await apiClient.put(API_ENDPOINTS.LOGS_ERROR_REVISAR(id), notas)
    return response.data
  },

  async generarPDFErrores(filtros = {}) {
    const params = new URLSearchParams()
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio)
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin)
    
    const response = await apiClient.get(`${API_ENDPOINTS.LOGS_ERRORES_PDF}?${params}`)
    return response.data
  }
}
