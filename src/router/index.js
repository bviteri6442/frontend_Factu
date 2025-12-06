import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// Import views
import Login from '@/views/Login.vue'
import Layout from '@/components/Layout.vue'
import Dashboard from '@/views/Dashboard.vue'
import Clientes from '@/views/Clientes.vue'
import Productos from '@/views/Productos.vue'
import Ventas from '@/views/Ventas.vue'
import NuevaVenta from '@/views/NuevaVenta.vue'
import Usuarios from '@/views/Usuarios.vue'
import ErrorLogs from '@/views/ErrorLogs.vue'
import EliminacionesUsuarios from '@/views/EliminacionesUsuarios.vue'
import EliminacionesProductos from '@/views/EliminacionesProductos.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
      },
      {
        path: 'clientes',
        name: 'Clientes',
        component: Clientes,
        meta: { requiresAuth: true }
      },
      {
        path: 'productos',
        name: 'Productos',
        component: Productos,
        meta: { requiresAuth: true }
      },
      {
        path: 'ventas',
        name: 'Facturas',
        component: Ventas,
        meta: { requiresAuth: true }
      },
      {
        path: 'ventas/nueva',
        name: 'NuevaFactura',
        component: NuevaVenta,
        meta: { requiresAuth: true }
      },
      {
        path: 'usuarios',
        name: 'Usuarios',
        component: Usuarios,
        meta: { 
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'error-logs',
        name: 'ErrorLogs',
        component: ErrorLogs,
        meta: { 
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'eliminaciones-usuarios',
        name: 'EliminacionesUsuarios',
        component: EliminacionesUsuarios,
        meta: { 
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'eliminaciones-productos',
        name: 'EliminacionesProductos',
        component: EliminacionesProductos,
        meta: { 
          requiresAuth: true,
          requiresAdmin: true
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Check authentication
  authStore.checkAuth()
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const isAuthenticated = authStore.isAuthenticated
  const isAdmin = authStore.isAdmin

  // Redirect to login if not authenticated
  if (requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  // Redirect to dashboard if authenticated and trying to access login
  if (to.path === '/login' && isAuthenticated) {
    next('/dashboard')
    return
  }

  // Check admin permissions
  if (requiresAdmin && !isAdmin) {
    next('/dashboard')
    return
  }

  next()
})

export default router
