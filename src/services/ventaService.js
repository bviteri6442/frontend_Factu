import apiClient from '@/utils/axios'
import { API_ENDPOINTS } from '@/config/api'

export const ventaService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters).toString()
    const url = params ? `${API_ENDPOINTS.VENTAS}?${params}` : API_ENDPOINTS.VENTAS
    const response = await apiClient.get(url)
    return response.data
  },
  
  async getById(id) {
    const response = await apiClient.get(API_ENDPOINTS.VENTAS_BY_ID(id))
    return response.data
  },
  
  async create(ventaData) {
    const response = await apiClient.post(API_ENDPOINTS.VENTAS, ventaData)
    return response.data
  },
  
  async generatePDF(ventaId) {
    const response = await apiClient.get(API_ENDPOINTS.VENTAS_PDF(ventaId), {
      responseType: 'blob',
      timeout: 30000 // 30 segundos timeout
    })
    return response.data
  },
  
  async downloadPDF(ventaId, numeroFactura) {
    try {
      const blob = await this.generatePDF(ventaId)
      
      // Verificar que el blob es válido
      if (!blob || blob.size === 0) {
        throw new Error('El PDF generado está vacío')
      }
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Factura_${numeroFactura}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Limpiar después de un delay para asegurar la descarga
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 100)
    } catch (error) {
      console.error('Error en downloadPDF:', error)
      throw error
    }
  }
}
