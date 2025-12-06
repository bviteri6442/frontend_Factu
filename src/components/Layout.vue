<template>
  <div class="layout">
    <nav class="navbar">
      <div class="navbar-brand">
        <h2>💼 Sistema de Gestión</h2>
      </div>
      <div class="navbar-user">
        <span class="user-name">👤 {{ userName }}</span>
        <span class="user-role">{{ userRole }}</span>
        <button @click="handleLogout" class="btn btn-danger btn-sm">
          Cerrar Sesión
        </button>
      </div>
    </nav>

    <div class="layout-container">
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <router-link to="/dashboard" class="nav-item">
            <span class="nav-icon">📊</span>
            <span>Dashboard</span>
          </router-link>
          
          <router-link to="/clientes" class="nav-item">
            <span class="nav-icon">👥</span>
            <span>Clientes</span>
          </router-link>
          
          <router-link to="/productos" class="nav-item">
            <span class="nav-icon">📦</span>
            <span>Productos</span>
          </router-link>
          
          <router-link to="/ventas" class="nav-item">
            <span class="nav-icon">💰</span>
            <span>Facturas</span>
          </router-link>
          
          <router-link v-if="isAdmin" to="/usuarios" class="nav-item">
            <span class="nav-icon">👤</span>
            <span>Usuarios</span>
          </router-link>
          
          <router-link v-if="isAdmin" to="/eliminaciones-productos" class="nav-item">
            <span class="nav-icon">📦</span>
            <span>Elim. Productos</span>
          </router-link>
          
          <router-link v-if="isAdmin" to="/error-logs" class="nav-item">
            <span class="nav-icon">⚠️</span>
            <span>Registro de Errores</span>
          </router-link>
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

.navbar {
  background: linear-gradient(135deg, #1E293B 0%, #334155 100%);
  color: white;
  padding: 0 30px;
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-brand h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
}

.user-role {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.layout-container {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 250px;
  background-color: white;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
}

.nav-item {
  padding: 15px 25px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--secondary-color);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background-color: #F1F5F9;
  border-left-color: #6366F1;
}

.nav-item.router-link-active {
  background-color: rgba(99, 102, 241, 0.1);
  border-left-color: #6366F1;
  color: #6366F1;
}

.nav-icon {
  font-size: 20px;
}

.main-content {
  flex: 1;
  padding: 30px;
  background-color: #f5f5f5;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }

  .navbar-brand h2 {
    font-size: 18px;
  }

  .main-content {
    padding: 15px;
  }
}
</style>
