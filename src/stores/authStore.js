import { defineStore } from 'pinia'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: authService.getUser(),
    token: authService.getToken(),
    isAuthenticated: authService.isAuthenticated()
  }),
  
  getters: {
    currentUser: (state) => state.user,
    userRole: (state) => state.user?.rolNombre || '',
    isAdmin: (state) => state.user?.rolNombre === 'Administrador',
    userName: (state) => state.user?.nombreCompleto || ''
  },
  
  actions: {
    async login(credentials) {
      try {
        // Convertir 'correo' a 'email' para el backend
        const loginData = {
          email: credentials.correo || credentials.email,
          contrasena: credentials.contrasena
        }
        
        const response = await authService.login(loginData)
        
        if (response.exitoso && response.token) {
          this.token = response.token
          this.user = {
            id: response.usuarioId,
            nombreCompleto: response.nombreCompleto,
            correo: response.correo,
            rolNombre: response.rol
          }
          this.isAuthenticated = true
          
          authService.setToken(response.token)
          authService.setUser(this.user)
          
          return { success: true }
        } else {
          return { success: false, message: response.mensaje }
        }
      } catch (error) {
        const message = error.response?.data?.mensaje || 'Error al iniciar sesión'
        return { success: false, message }
      }
    },
    
    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      authService.logout()
    },
    
    checkAuth() {
      this.isAuthenticated = authService.isAuthenticated()
      this.user = authService.getUser()
      this.token = authService.getToken()
    }
  }
})
