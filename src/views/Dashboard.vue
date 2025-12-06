<template>
  <div class="dashboard">
    <h1 class="page-title">Dashboard</h1>
    
    <div class="stats-grid">
      <div class="stat-card" style="border-left: 4px solid var(--primary-color);">
        <div class="stat-content">
          <h3>{{ stats.totalClientes }}</h3>
          <p>Total Clientes</p>
        </div>
      </div>

      <div class="stat-card" style="border-left: 4px solid #50c878;">
        <div class="stat-content">
          <h3>{{ stats.totalProductos }}</h3>
          <p>Total Productos</p>
        </div>
      </div>

      <div class="stat-card" style="border-left: 4px solid #f39c12;">
        <div class="stat-content">
          <h3>{{ stats.totalVentas }}</h3>
          <p>Ventas del Mes</p>
        </div>
      </div>

      <div class="stat-card" style="border-left: 4px solid var(--secondary-color);">
        <div class="stat-content">
          <h3>{{ stats.productosStockBajo }}</h3>
          <p>Productos Stock Bajo</p>
        </div>
      </div>
    </div>

    <div class="row mt-3">
      <div class="col">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Bienvenido al Sistema</h3>
          </div>
          <div class="card-body">
            <p><strong>Usuario:</strong> {{ userName }}</p>
            <p><strong>Rol:</strong> {{ userRole }}</p>
            <p><strong>Fecha:</strong> {{ currentDate }}</p>
            
            <div class="mt-2">
              <h4>Accesos Rápidos</h4>
              <div class="quick-actions">
                <router-link to="/ventas/nueva" class="btn btn-primary">
                  Nueva Venta
                </router-link>
                <router-link to="/clientes" class="btn btn-success">
                  Ver Clientes
                </router-link>
                <router-link to="/productos" class="btn btn-warning">
                  Ver Productos
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

const authStore = useAuthStore()
const clienteStore = useClienteStore()
const productoStore = useProductoStore()

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
    await clienteStore.fetchClientes()
    await productoStore.fetchProductos()

    stats.value.totalClientes = clienteStore.clientesActivos.length
    stats.value.totalProductos = productoStore.productosActivos.length
    stats.value.productosStockBajo = productoStore.productos.filter(
      p => p.stockActual <= p.stockMinimo && p.activo
    ).length
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
})
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
}

.page-title {
  font-size: 32px;
  color: var(--secondary-color);
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 48px;
}

.stat-content h3 {
  font-size: 36px;
  font-weight: 700;
  margin: 0;
  color: #2c3e50;
}

.stat-content p {
  margin: 5px 0 0 0;
  color: #7f8c8d;
  font-size: 14px;
}

.card-body p {
  margin: 10px 0;
  font-size: 16px;
}

.quick-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-top: 15px;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    flex-direction: column;
  }

  .quick-actions .btn {
    width: 100%;
  }
}
</style>
