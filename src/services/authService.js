import apiClient from '@/utils/axios'
import { API_ENDPOINTS } from '@/config/api'

export const authService = {
  async login(credentials) {
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, credentials)
    return response.data
  },
  
  async registro(userData) {
    const response = await apiClient.post(API_ENDPOINTS.REGISTRO, userData)
    return response.data
  },
  
  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
  
  getToken() {
    return localStorage.getItem('token')
  },
  
  getUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },
  
  setToken(token) {
    localStorage.setItem('token', token)
  },
  
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user))
  },
  
  isAuthenticated() {
    return !!this.getToken()
  }
}
