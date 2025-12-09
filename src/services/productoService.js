import apiClient from '@/utils/axios'
import { API_ENDPOINTS } from '@/config/api'

export const productoService = {
  async getAll() {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTOS)
    // Mapear los datos del backend al formato del frontend
    return response.data.map(p => ({
      id: p.id,
      nombre: p.nombre,
      codigoBarra: p.codigo,
      descripcion: p.descripcion,
      precioCosto: p.precioCompra,
      precioVenta: p.precio,
      stockActual: p.stock,
      stockMinimo: p.stockMinimo,
      activo: p.activo,
      fechaCreacion: p.fechaCreacion,
      fechaActualizacion: p.fechaActualizacion
    }))
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
      descripcion: productoData.descripcion || '',
      precio: productoData.precioVenta,
      precioCompra: productoData.precioCosto || 0,
      stockInicial: productoData.stockActual || 0,
      stockMinimo: productoData.stockMinimo || 10
    }
    const response = await apiClient.post(API_ENDPOINTS.PRODUCTOS, payload)
    return response.data
  },
  
  async update(id, productoData) {
    // Mapear campos del frontend a lo que espera el backend
    const payload = {
      id: id,
      nombre: productoData.nombre,
      descripcion: productoData.descripcion,
      precioVenta: productoData.precioVenta,
      precioCompra: productoData.precioCosto,
      stock: productoData.stockActual,
      stockMinimo: productoData.stockMinimo
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
  },

  async search(query, limit = 20) {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTOS)
    const searchTerm = query.toLowerCase()
    
    // Filtrar productos por nombre, código o descripción
    const filtered = response.data.filter(p => 
      p.nombre?.toLowerCase().includes(searchTerm) ||
      p.codigo?.toLowerCase().includes(searchTerm) ||
      p.descripcion?.toLowerCase().includes(searchTerm)
    )
    
    // Limitar resultados
    return filtered.slice(0, limit)
  }
}
