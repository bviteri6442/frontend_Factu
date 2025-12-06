import apiClient from '@/utils/axios'
import { API_ENDPOINTS } from '@/config/api'

export const productoService = {
  async getAll() {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTOS)
    return response.data
  },
  
  async getById(id) {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTOS_BY_ID(id))
    return response.data
  },
  
  async create(productoData) {
    // Mapear campos del frontend a lo que espera el backend
    const payload = {
      nombre: productoData.nombre,
      codigo: productoData.codigoBarra,
      precio: productoData.precioVenta,
      precioCompra: productoData.precioCosto || 0,
      stockInicial: productoData.stockActual || 0
    }
    const response = await apiClient.post(API_ENDPOINTS.PRODUCTOS, payload)
    return response.data
  },
  
  async update(id, productoData) {
    // Mapear campos del frontend a lo que espera el backend
    const payload = {
      id: id,
      nombre: productoData.nombre,
      precioVenta: productoData.precioVenta
    }
    const response = await apiClient.put(API_ENDPOINTS.PRODUCTOS_BY_ID(id), payload)
    return response.data
  },
  
  async delete(id) {
    const response = await apiClient.delete(API_ENDPOINTS.PRODUCTOS_BY_ID(id))
    return response.data
  },
  
  async getDisponibles() {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTOS)
    // Filter products with stock > 0
    return response.data.filter(p => p.stockActual > 0 && p.activo)
  }
}
