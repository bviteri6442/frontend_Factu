import { defineStore } from 'pinia'
import { clienteService } from '@/services/clienteService'

export const useClienteStore = defineStore('cliente', {
  state: () => ({
    clientes: [],
    loading: false,
    error: null
  }),
  
  getters: {
    clientesActivos: (state) => state.clientes.filter(c => c.activo),
    getClienteById: (state) => (id) => state.clientes.find(c => c.id === id)
  },
  
  actions: {
    async fetchClientes() {
      this.loading = true
      this.error = null
      try {
        this.clientes = await clienteService.getAll()
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async createCliente(clienteData) {
      try {
        const newCliente = await clienteService.create(clienteData)
        await this.fetchClientes() // Refresh list
        return newCliente
      } catch (error) {
        throw error
      }
    },
    
    async updateCliente(id, clienteData) {
      try {
        await clienteService.update(id, clienteData)
        await this.fetchClientes() // Refresh list
      } catch (error) {
        throw error
      }
    },
    
    async deleteCliente(id) {
      try {
        await clienteService.delete(id)
        await this.fetchClientes() // Refresh list
      } catch (error) {
        throw error
      }
    }
  }
})
