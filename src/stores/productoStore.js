import { defineStore } from 'pinia'
import { productoService } from '@/services/productoService'

export const useProductoStore = defineStore('producto', {
  state: () => ({
    productos: [],
    loading: false,
    error: null
  }),
  
  getters: {
    productosActivos: (state) => state.productos.filter(p => p.activo),
    productosDisponibles: (state) => state.productos.filter(p => p.activo && p.stockActual > 0),
    getProductoById: (state) => (id) => state.productos.find(p => p.id === id)
  },
  
  actions: {
    async fetchProductos() {
      this.loading = true
      this.error = null
      try {
        this.productos = await productoService.getAll()
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async createProducto(productoData) {
      try {
        const newProducto = await productoService.create(productoData)
        await this.fetchProductos() // Refresh list
        return newProducto
      } catch (error) {
        throw error
      }
    },
    
    async updateProducto(id, productoData) {
      try {
        await productoService.update(id, productoData)
        await this.fetchProductos() // Refresh list
      } catch (error) {
        throw error
      }
    },
    
    async deleteProducto(id) {
      try {
        await productoService.delete(id)
        await this.fetchProductos() // Refresh list
      } catch (error) {
        throw error
      }
    }
  }
})
