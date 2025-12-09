<template>
  <div class="ventas-page">
    <div class="page-header">
      <h1 class="page-title">Facturas</h1>
      <router-link to="/ventas/nueva" class="btn btn-primary">
        Nueva Factura
      </router-link>
    </div>

    <LoadingSpinner :show="loading" message="Cargando facturas..." />

    <div v-if="!loading" class="card">
      <div class="card-header">
        <SearchBox 
          v-model="searchTerm" 
          placeholder="Buscar por número de factura o cliente..."
        />
        <div class="filters">
          <div class="filter-group">
            <label>Fecha Inicio:</label>
            <input type="date" v-model="filters.fechaInicio" class="form-control" />
          </div>
          <div class="filter-group">
            <label>Fecha Fin:</label>
            <input type="date" v-model="filters.fechaFin" class="form-control" />
          </div>
          <button @click="applyFilters" class="btn btn-sm btn-primary">Filtrar</button>
          <button @click="clearFilters" class="btn btn-sm btn-secondary">Limpiar</button>
        </div>
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Nº Factura</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Usuario</th>
              <th class="text-right">Subtotal</th>
              <th class="text-right">IVA</th>
              <th class="text-right">Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredVentas.length === 0">
              <td colspan="9" class="text-center">
                No se encontraron facturas
              </td>
            </tr>
            <tr v-for="venta in paginatedVentas" :key="venta.ventaId">
              <td><strong>{{ venta.numeroFactura }}</strong></td>
              <td>{{ formatDateTime(venta.fechaVenta) }}</td>
              <td>{{ venta.clienteNombre || 'Consumidor Final' }}</td>
              <td>{{ venta.usuarioNombre }}</td>
              <td class="text-right">{{ formatCurrency(venta.subtotal) }}</td>
              <td class="text-right">{{ formatCurrency(venta.totalImpuesto) }}</td>
              <td class="text-right"><strong>{{ formatCurrency(venta.totalVenta) }}</strong></td>
              <td>
                <span :class="['badge', getEstadoClass(venta.estado)]">
                  {{ venta.estado }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button 
                    @click="viewVenta(venta.numeroFactura)" 
                    class="btn btn-sm btn-primary"
                    title="Ver Detalle"
                  >
                    Ver
                  </button>
                  <button 
                    @click="downloadPDF(venta)" 
                    class="btn btn-sm btn-success"
                    title="Descargar PDF"
                  >
                    PDF
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="btn btn-sm"
        >
          Anterior
        </button>
        <button 
          v-for="page in totalPages" 
          :key="page"
          @click="currentPage = page"
          :class="['btn', 'btn-sm', { active: currentPage === page }]"
        >
          {{ page }}
        </button>
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="btn btn-sm"
        >
          Siguiente
        </button>
      </div>
    </div>

    <!-- Modal Ver Detalle -->
    <Modal 
      :show="showDetailModal" 
      title="Detalle de Factura"
      :showFooter="false"
      @close="showDetailModal = false"
    >
      <div v-if="selectedVenta" class="venta-detail">
        <div class="detail-header">
          <h3>Factura: {{ selectedVenta.numeroFactura }}</h3>
          <p><strong>Fecha:</strong> {{ formatDateTime(selectedVenta.fechaVenta) }}</p>
          <p><strong>Cliente:</strong> {{ selectedVenta.clienteNombre || 'Consumidor Final' }}</p>
          <p><strong>Usuario:</strong> {{ selectedVenta.usuarioNombre }}</p>
        </div>

        <h4 class="mt-2">Productos:</h4>
        <table class="table">
          <thead>
            <tr>
              <th>Producto</th>
              <th class="text-right">Cantidad</th>
              <th class="text-right">Precio Unit.</th>
              <th class="text-right">Descuento</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="detalle in selectedVenta.detalles" :key="detalle.productoId">
              <td>{{ detalle.productoNombre }}</td>
              <td class="text-right">{{ detalle.cantidad }}</td>
              <td class="text-right">{{ formatCurrency(detalle.precioUnitario) }}</td>
              <td class="text-right">{{ detalle.descuento }}%</td>
              <td class="text-right">{{ formatCurrency(detalle.total) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="totals">
          <p><strong>Subtotal:</strong> {{ formatCurrency(selectedVenta.subtotal) }}</p>
          <p><strong>IVA ({{ selectedVenta.porcentajeIVA }}%):</strong> {{ formatCurrency(selectedVenta.totalImpuesto) }}</p>
          <h3><strong>TOTAL:</strong> {{ formatCurrency(selectedVenta.totalVenta) }}</h3>
        </div>

        <div v-if="selectedVenta.observaciones" class="mt-2">
          <p><strong>Observaciones:</strong></p>
          <p>{{ selectedVenta.observaciones }}</p>
        </div>

        <div class="modal-footer">
          <button @click="showDetailModal = false" class="btn btn-secondary">Cerrar</button>
          <button @click="downloadPDF(selectedVenta)" class="btn btn-success">
            Descargar PDF
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ventaService } from '@/services/ventaService'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import SearchBox from '@/components/SearchBox.vue'
import Modal from '@/components/Modal.vue'
import { formatCurrency, formatDateTime } from '@/utils/helpers'
import Swal from 'sweetalert2'

const router = useRouter()

const loading = ref(false)
const ventas = ref([])
const searchTerm = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const showDetailModal = ref(false)
const selectedVenta = ref(null)

const filters = ref({
  fechaInicio: '',
  fechaFin: '',
  estado: ''
})

const filteredVentas = computed(() => {
  if (!searchTerm.value) {
    return ventas.value
  }
  
  const term = searchTerm.value.toLowerCase()
  return ventas.value.filter(v => 
    v.numeroFactura?.toLowerCase().includes(term) ||
    v.clienteNombre?.toLowerCase().includes(term)
  )
})

const totalPages = computed(() => 
  Math.ceil(filteredVentas.value.length / itemsPerPage)
)

const paginatedVentas = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredVentas.value.slice(start, end)
})

const getEstadoClass = (estado) => {
  switch (estado?.toLowerCase()) {
    case 'completada':
      return 'badge-success'
    case 'pendiente':
      return 'badge-warning'
    case 'cancelada':
      return 'badge-danger'
    default:
      return 'badge-secondary'
  }
}

const fetchVentas = async (filterParams = {}) => {
  loading.value = true
  try {
    console.log('[DEBUG] Llamando a ventaService.getAll con params:', filterParams)
    const result = await ventaService.getAll(filterParams)
    console.log('[DEBUG] Respuesta del backend:', result)
    console.log('[DEBUG] Tipo de respuesta:', typeof result)
    console.log('[DEBUG] Es array?:', Array.isArray(result))
    
    ventas.value = result || []
    console.log('[DEBUG] Facturas cargadas:', ventas.value.length)
  } catch (error) {
    console.error('[DEBUG] Error completo:', error)
    console.error('[DEBUG] Error response:', error.response)
    console.error('[DEBUG] Error data:', error.response?.data)
    console.error('[DEBUG] Error status:', error.response?.status)
    
    ventas.value = []
    // Solo mostrar error si no es un error de lista vacía
    if (error.response?.status !== 404) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'No se pudieron cargar las facturas'
      })
    }
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  const filterParams = {}
  if (filters.value.fechaInicio) filterParams.fechaInicio = filters.value.fechaInicio
  if (filters.value.fechaFin) filterParams.fechaFin = filters.value.fechaFin
  if (filters.value.estado) filterParams.estado = filters.value.estado
  
  fetchVentas(filterParams)
}

const clearFilters = () => {
  filters.value = {
    fechaInicio: '',
    fechaFin: '',
    estado: ''
  }
  fetchVentas()
}

const viewVenta = async (ventaId) => {
  try {
    selectedVenta.value = await ventaService.getById(ventaId)
    showDetailModal.value = true
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo cargar el detalle de la factura'
    })
  }
}

const downloadPDF = async (venta) => {
  const loadingSwal = Swal.fire({
    title: 'Generando PDF...',
    text: 'Por favor espera',
    allowOutsideClick: false,
    allowEscapeKey: true,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading()
    }
  })
  
  try {
    await ventaService.downloadPDF(venta.numeroFactura, venta.numeroFactura)
    
    Swal.close()
    Swal.fire({
      icon: 'success',
      title: 'PDF Descargado',
      text: 'La factura se descargó correctamente',
      timer: 2000,
      showConfirmButton: false
    })
  } catch (error) {
    Swal.close()
    console.error('Error al descargar PDF:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error al descargar PDF',
      text: error.response?.data?.message || error.message || 'No se pudo generar el PDF'
    })
  }
}

onMounted(() => {
  fetchVentas()
})
</script>

<style scoped>
.ventas-page {
  max-width: 1400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 32px;
  color: #2c3e50;
  margin: 0;
}

.filters {
  display: flex;
  gap: 15px;
  margin-top: 15px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
}

.filter-group .form-control {
  width: 150px;
}

.action-buttons {
  display: flex;
  gap: 5px;
}

.venta-detail .detail-header {
  border-bottom: 2px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.venta-detail .detail-header h3 {
  color: #4a90e2;
  margin-bottom: 10px;
}

.venta-detail .detail-header p {
  margin: 5px 0;
}

.totals {
  text-align: right;
  border-top: 2px solid #eee;
  padding-top: 15px;
  margin-top: 15px;
}

.totals p {
  margin: 5px 0;
}

.totals h3 {
  color: #4a90e2;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .filters {
    flex-direction: column;
    width: 100%;
  }

  .filter-group .form-control {
    width: 100%;
  }

  .table-container {
    overflow-x: auto;
  }
}
</style>
