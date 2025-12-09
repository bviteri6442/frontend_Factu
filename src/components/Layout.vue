<template>
  <div class="layout">
    <nav class="navbar">
      <div class="navbar-content">
        <div class="navbar-brand">
          <i class="fas fa-briefcase"></i>
          Sistema de Gestión
        </div>
        <div class="navbar-user">
          <div class="navbar-user-info">
            <div class="navbar-user-name">{{ userName }}</div>
            <div class="navbar-user-role">{{ userRole }}</div>
          </div>
          <button @click="handleLogout" class="btn btn-danger btn-sm">
            <i class="fas fa-right-from-bracket"></i>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>

    <div class="layout-container">
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <div class="sidebar-item">
            <router-link to="/dashboard" class="sidebar-link">
              <i class="fas fa-chart-line"></i>
              <span>Dashboard</span>
            </router-link>
          </div>
          
          <div class="sidebar-item">
            <router-link to="/clientes" class="sidebar-link">
              <i class="fas fa-users"></i>
              <span>Clientes</span>
            </router-link>
          </div>
          
          <div class="sidebar-item">
            <router-link to="/productos" class="sidebar-link">
              <i class="fas fa-box"></i>
              <span>Productos</span>
            </router-link>
          </div>
          
          <div class="sidebar-item">
            <router-link to="/ventas" class="sidebar-link">
              <i class="fas fa-file-invoice-dollar"></i>
              <span>Facturas</span>
            </router-link>
          </div>
          
          <div v-if="isAdmin" class="sidebar-divider"></div>
          
          <div v-if="isAdmin" class="sidebar-item">
            <router-link to="/usuarios" class="sidebar-link">
              <i class="fas fa-user-shield"></i>
              <span>Usuarios</span>
            </router-link>
          </div>
          
          <div v-if="isAdmin" class="sidebar-item">
            <router-link to="/eliminaciones-usuarios" class="sidebar-link">
              <i class="fas fa-user-slash"></i>
              <span>Elim. Usuarios</span>
            </router-link>
          </div>
          
          <div v-if="isAdmin" class="sidebar-item">
            <router-link to="/eliminaciones-productos" class="sidebar-link">
              <i class="fas fa-box-archive"></i>
              <span>Elim. Productos</span>
            </router-link>
          </div>
          
          <div v-if="isAdmin" class="sidebar-divider"></div>
          
          <div v-if="isAdmin" class="sidebar-item">
            <router-link to="/logs" class="sidebar-link">
              <i class="fas fa-clipboard-list"></i>
              <span>Logs</span>
            </router-link>
          </div>
        </nav>
      </aside>

      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Swal from 'sweetalert2'

const router = useRouter()
const authStore = useAuthStore()

const userName = computed(() => authStore.userName)
const userRole = computed(() => authStore.userRole)
const isAdmin = computed(() => authStore.isAdmin)

const handleLogout = async () => {
  const result = await Swal.fire({
    title: '¿Cerrar sesión?',
    text: '¿Estás seguro que deseas salir?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'var(--primary-color)',
    cancelButtonColor: '#95a5a6',
    confirmButtonText: 'Sí, salir',
    cancelButtonText: 'Cancelar'
  })

  if (result.isConfirmed) {
    authStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-container {
  display: flex;
  flex: 1;
}

/* Los estilos de navbar, sidebar, etc. ya están en main.css */
</style>
