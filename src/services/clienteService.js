import apiClient from '@/utils/axios'
import { API_ENDPOINTS } from '@/config/api'

export const clienteService = {
  async getAll() {
    const response = await apiClient.get(API_ENDPOINTS.CLIENTES)
    return response.data
  },
  
  async getById(id) {
    const response = await apiClient.get(API_ENDPOINTS.CLIENTES_BY_ID(id))
    return response.data
  },
  
  async create(clienteData) {
    const response = await apiClient.post(API_ENDPOINTS.CLIENTES, clienteData)
    return response.data
  },
  
  async update(id, clienteData) {
    const response = await apiClient.put(API_ENDPOINTS.CLIENTES_BY_ID(id), clienteData)
    return response.data
  },
  
  async delete(id) {
    const response = await apiClient.delete(API_ENDPOINTS.CLIENTES_BY_ID(id))
    return response.data
  },
  
  async search(searchTerm) {
    const response = await apiClient.get(`${API_ENDPOINTS.CLIENTES}?search=${searchTerm}`)
    return response.data
  }
}
