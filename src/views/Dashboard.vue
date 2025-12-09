<template>
  <div class="dashboard">
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-chart-line"></i>
        Dashboard
      </h1>
    </div>

    <LoadingSpinner :show="loading" message="Cargando estadísticas..." />

    <div v-if="!loading" class="stats-grid">
      <!-- Total Clientes -->
      <div class="stat-card clientes">
        <div class="stat-card-content">
          <div class="stat-info">
            <h3>{{ stats.totalClientes }}</h3>
            <p>Total Clientes</p>
          </div>
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
        </div>
      </div>

      <!-- Total Productos -->
      <div class="stat-card productos">
        <div class="stat-card-content">
          <div class="stat-info">
            <h3>{{ stats.totalProductos }}</h3>
            <p>Total Productos</p>
          </div>
          <div class="stat-icon">
            <i class="fas fa-boxes-stacked"></i>
          </div>
        </div>
      </div>

      <!-- Ventas del Mes -->
      <div class="stat-card ventas">
        <div class="stat-card-content">
          <div class="stat-info">
            <h3>{{ stats.totalVentas }}</h3>
            <p>Ventas del Mes</p>
          </div>
          <div class="stat-icon">
            <i class="fas fa-receipt"></i>
          </div>
        </div>
      </div>

      <!-- Stock Bajo -->
      <div class="stat-card stock-bajo">
        <div class="stat-card-content">
          <div class="stat-info">
            <h3>{{ stats.productosStockBajo }}</h3>
            <p>Productos Stock Bajo</p>
          </div>
          <div class="stat-icon">
            <i class="fas fa-triangle-exclamation"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Bienvenida y Accesos Rápidos -->
    <div class="row" v-if="!loading">
      <div class="col">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-hand-wave"></i>
              Bienvenido al Sistema
            </h3>
          </div>
          <div class="card-body">
            <div class="info-section">
              <p><i class="fas fa-user"></i> <strong>Usuario:</strong> {{ userName }}</p>
              <p><i class="fas fa-user-shield"></i> <strong>Rol:</strong> {{ userRole }}</p>
              <p><i class="fas fa-calendar-day"></i> <strong>Fecha:</strong> {{ currentDate }}</p>
            </div>
            
            <div class="quick-actions-section">
              <h4><i class="fas fa-bolt"></i> Accesos Rápidos</h4>
              <div class="quick-actions">
                <router-link to="/ventas/nueva" class="btn btn-primary">
                  <i class="fas fa-plus"></i>
                  Nueva Venta
                </router-link>
                <router-link to="/clientes" class="btn btn-success">
                  <i class="fas fa-users"></i>
                  Ver Clientes
                </router-link>
                <router-link to="/productos" class="btn btn-warning">
                  <i class="fas fa-box"></i>
                  Ver Productos
                </router-link>
                <router-link to="/ventas" class="btn btn-secondary">
                  <i class="fas fa-file-invoice-dollar"></i>
                  Ver Facturas
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useClienteStore } from '@/stores/clienteStore'
import { useProductoStore } from '@/stores/productoStore'
import { ventaService } from '@/services/ventaService'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const authStore = useAuthStore()
const clienteStore = useClienteStore()
const productoStore = useProductoStore()

const loading = ref(true)

const userName = computed(() => authStore.userName)
const userRole = computed(() => authStore.userRole)

const currentDate = computed(() => {
  return new Date().toLocaleDateString('es-EC', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const stats = ref({
  totalClientes: 0,
  totalProductos: 0,
  totalVentas: 0,
  productosStockBajo: 0
})

onMounted(async () => {
  try {
    loading.value = true
    
    // Cargar datos en paralelo
    await Promise.all([
      clienteStore.fetchClientes(),
      productoStore.fetchProductos(),
      loadVentasMes()
    ])

    // Actualizar estadísticas
    stats.value.totalClientes = clienteStore.clientesActivos.length
    stats.value.totalProductos = productoStore.productosActivos.length
    stats.value.productosStockBajo = productoStore.productos.filter(
      p => p.stockActual <= p.stockMinimo && p.activo
    ).length
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    loading.value = false
  }
})

async function loadVentasMes() {
  try {
    const ventasMes = await ventaService.getVentasMesActual()
    stats.value.totalVentas = ventasMes
  } catch (error) {
    console.error('Error loading ventas del mes:', error)
    stats.value.totalVentas = 0
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.info-section {
  margin-bottom: 2rem;
}

.info-section p {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.75rem 0;
  font-size: 1rem;
}

.info-section p i {
  color: var(--color-accion);
  width: 1.25rem;
}

.quick-actions-section h4 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: var(--color-marca);
}

.quick-actions-section h4 i {
  color: var(--color-alerta);
}
</style>
