import apiClient from '@/utils/axios'
import { API_ENDPOINTS } from '@/config/api'

export const productoService = {
  async getAll() {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTOS)
    // Mapear los datos del backend (PascalCase) al formato del frontend (camelCase)
    return response.data.map(p => ({
      id: p.Id || p.id,
      nombre: p.Nombre || p.nombre,
      codigoBarra: p.Codigo || p.codigo,
      descripcion: p.Descripcion || p.descripcion,
      precioCosto: p.PrecioCompra || p.precioCompra,
      precioVenta: p.Precio || p.precio,
      stockActual: p.Stock || p.stock,
      stockMinimo: p.StockMinimo || p.stockMinimo,
      activo: p.Activo || p.activo,
      fechaCreacion: p.FechaCreacion || p.fechaCreacion,
      fechaActualizacion: p.FechaActualizacion || p.fechaActualizacion
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
    
    // Filtrar productos activos por nombre, código o descripción
    // El backend retorna campos en PascalCase (Nombre, Codigo, etc.)
    const filtered = response.data.filter(p => 
      (p.Activo || p.activo) && (
        p.Nombre?.toLowerCase().includes(searchTerm) ||
        p.Codigo?.toLowerCase().includes(searchTerm) ||
        p.Descripcion?.toLowerCase().includes(searchTerm) ||
        p.nombre?.toLowerCase().includes(searchTerm) ||
        p.codigo?.toLowerCase().includes(searchTerm) ||
        p.descripcion?.toLowerCase().includes(searchTerm)
      )
    )
    
    // Mapear al formato esperado por el frontend (camelCase) y limitar resultados
    return filtered.slice(0, limit).map(p => ({
      id: p.Id || p.id,
      nombre: p.Nombre || p.nombre,
      codigo: p.Codigo || p.codigo,
      descripcion: p.Descripcion || p.descripcion,
      precio: p.Precio || p.precio,
      precioCompra: p.PrecioCompra || p.precioCompra,
      stock: p.Stock || p.stock,
      stockMinimo: p.StockMinimo || p.stockMinimo,
      activo: p.Activo || p.activo
    }))
  }
}
