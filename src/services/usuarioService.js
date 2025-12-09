import apiClient from '@/utils/axios'
import { API_ENDPOINTS } from '@/config/api'

export const usuarioService = {
  async getAll() {
    const response = await apiClient.get(API_ENDPOINTS.USUARIOS)
    // Mapear los campos del backend a los del frontend
    return response.data.map(u => ({
      id: u.id,
      cedula: u.nombreUsuario,
      nombreCompleto: u.nombre,
      correo: u.email,
      activo: u.activo,
      fechaBloqueo: u.fechaBloqueo,
      fechaCreacion: u.fechaCreacion,
      fechaUltimoLogin: u.fechaUltimoLogin,
      rolId: u.rolId,
      rolNombre: u.rolNombre
    }))
  },
  
  async getById(id) {
    const response = await apiClient.get(API_ENDPOINTS.USUARIOS_BY_ID(id))
    const u = response.data
    return {
      id: u.id,
      cedula: u.nombreUsuario,
      nombreCompleto: u.nombre,
      correo: u.email,
      activo: u.activo,
      fechaBloqueo: u.fechaBloqueo,
      fechaCreacion: u.fechaCreacion,
      fechaUltimoLogin: u.fechaUltimoLogin,
      rolId: u.rolId,
      rolNombre: u.rolNombre
    }
  },
  
  async create(usuarioData) {
    // Mapear campos del frontend al backend (enviar en ambos formatos para compatibilidad)
    const payload = {
      // Formato backend
      nombreUsuario: usuarioData.cedula,
      nombre: usuarioData.nombreCompleto,
      email: usuarioData.correo,
      // Formato frontend (aliases)
      cedula: usuarioData.cedula,
      nombreCompleto: usuarioData.nombreCompleto,
      correo: usuarioData.correo,
      // Campos requeridos
      contrasena: usuarioData.contrasena,
      rolId: parseInt(usuarioData.rolId)
    }
    const response = await apiClient.post(API_ENDPOINTS.USUARIOS, payload)
    return response.data
  },
  
  async update(id, usuarioData) {
    // Mapear campos del frontend al backend
    const payload = {
      nombre: usuarioData.nombreCompleto,
      email: usuarioData.correo,
      rolId: usuarioData.rolId ? parseInt(usuarioData.rolId) : undefined,
      activo: usuarioData.activo
    }
    const response = await apiClient.put(API_ENDPOINTS.USUARIOS_BY_ID(id), payload)
    return response.data
  },
  
  async delete(id) {
    const response = await apiClient.delete(API_ENDPOINTS.USUARIOS_BY_ID(id))
    return response.data
  },
  
  async desbloquear(id) {
    const response = await apiClient.post(API_ENDPOINTS.USUARIOS_DESBLOQUEAR(id))
    return response.data
  }
}

export const rolService = {
  async getAll() {
    const response = await apiClient.get(API_ENDPOINTS.ROLES)
    return response.data
  }
}
