<template>
  <div class="eliminaciones-page">
    <div class="page-header">
      <h1 class="page-title">Historial de Eliminaciones de Productos</h1>
      <button @click="generarPDF" class="btn btn-primary" :disabled="generandoPDF">
        <i class="fas fa-file-pdf"></i>
        {{ generandoPDF ? 'Generando...' : 'Generar PDF' }}
      </button>
    </div>

    <!-- Estadísticas -->
    <div class="stats-grid" v-if="estadisticas">
      <div class="stat-card clientes">
        <div class="stat-card-content">
          <div class="stat-info">
            <h3>{{ estadisticas.totalEliminaciones }}</h3>
            <p>Total Eliminados</p>
          </div>
          <div class="stat-icon">
            <i class="fas fa-box-archive"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card productos">
        <div class="stat-card-content">
          <div class="stat-info">
            <h3>{{ estadisticas.eliminacionesHoy }}</h3>
            <p>Hoy</p>
          </div>
          <div class="stat-icon">
            <i class="fas fa-calendar-day"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card ventas">
        <div class="stat-card-content">
          <div class="stat-info">
            <h3>{{ estadisticas.stockTotalEliminado }}</h3>
            <p>Stock Eliminado</p>
          </div>
          <div class="stat-icon">
            <i class="fas fa-boxes-stacked"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card stock-bajo">
        <div class="stat-card-content">
          <div class="stat-info">
            <h3>{{ formatCurrency(estadisticas.valorTotalEliminado || 0) }}</h3>
            <p>Valor Total</p>
          </div>
          <div class="stat-icon">
            <i class="fas fa-dollar-sign"></i>
          </div>
        </div>
      </div>
    </div>

    <LoadingSpinner :show="loading" message="Cargando historial..." />

    <div v-if="!loading" class="card">
      <div class="card-header">
        <SearchBox 
          v-model="searchTerm" 
          placeholder="Buscar por nombre, código, administrador..."
          @search="buscar"
        />
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Código</th>
              <th>Producto</th>
              <th>P. Costo</th>
              <th>P. Venta</th>
              <th>Stock</th>
              <th>Eliminado por</th>
              <th>Tipo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedEliminaciones.length === 0">
              <td colspan="9" class="text-center">
                No se encontraron registros de eliminaciones
              </td>
            </tr>
            <tr v-for="eliminacion in paginatedEliminaciones" :key="eliminacion.id">
              <td>{{ formatDateTime(eliminacion.fechaEliminacion) }}</td>
              <td><code>{{ eliminacion.codigoProductoEliminado }}</code></td>
              <td>
                <strong>{{ eliminacion.nombreProductoEliminado }}</strong>
                <br v-if="eliminacion.descripcionProductoEliminado" />
                <small v-if="eliminacion.descripcionProductoEliminado">{{ eliminacion.descripcionProductoEliminado }}</small>
              </td>
              <td>{{ formatCurrency(eliminacion.precioCostoProductoEliminado) }}</td>
              <td>{{ formatCurrency(eliminacion.precioVentaProductoEliminado) }}</td>
              <td>
                <span class="badge badge-info">{{ eliminacion.stockProductoEliminado }}</span>
              </td>
              <td>{{ eliminacion.nombreAdministrador }}</td>
              <td>
                <span :class="['badge', eliminacion.tipoEliminacion === 'Desactivación' ? 'badge-warning' : 'badge-danger']">
                  {{ eliminacion.tipoEliminacion }}
                </span>
              </td>
              <td>
                <button 
                  @click="verDetalles(eliminacion)" 
                  class="btn btn-sm btn-info"
                  title="Ver detalles"
                >
                  <i class="fas fa-eye"></i>
                  Ver
                </button>
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
        <span class="pagination-info">
          Página {{ currentPage }} de {{ totalPages }}
        </span>
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="btn btn-sm"
        >
          Siguiente
        </button>
      </div>
    </div>

    <!-- Modal Detalles -->
    <Modal 
      :show="showModal" 
      title="Detalles de la Eliminación"
      @close="closeModal"
    >
      <div v-if="selectedEliminacion" class="detalles-container">
        <div class="detalle-grupo">
          <h4>📦 Producto Eliminado</h4>
          <div class="detalle-item">
            <span class="label">Nombre:</span>
            <span class="value">{{ selectedEliminacion.nombreProductoEliminado }}</span>
          </div>
          <div class="detalle-item">
            <span class="label">Código:</span>
            <span class="value">{{ selectedEliminacion.codigoProductoEliminado }}</span>
          </div>
          <div class="detalle-item" v-if="selectedEliminacion.descripcionProductoEliminado">
            <span class="label">Descripción:</span>
            <span class="value">{{ selectedEliminacion.descripcionProductoEliminado }}</span>
          </div>
          <div class="detalle-item">
            <span class="label">Precio Costo:</span>
            <span class="value">{{ formatCurrency(selectedEliminacion.precioCostoProductoEliminado) }}</span>
          </div>
          <div class="detalle-item">
            <span class="label">Precio Venta:</span>
            <span class="value">{{ formatCurrency(selectedEliminacion.precioVentaProductoEliminado) }}</span>
          </div>
          <div class="detalle-item">
            <span class="label">Stock:</span>
            <span class="value">{{ selectedEliminacion.stockProductoEliminado }} unidades</span>
          </div>
          <div class="detalle-item">
            <span class="label">Valor Total:</span>
            <span class="value valor-total">{{ formatCurrency(selectedEliminacion.precioVentaProductoEliminado * selectedEliminacion.stockProductoEliminado) }}</span>
          </div>
        </div>

        <div class="detalle-grupo">
          <h4>🔒 Información de la Eliminación</h4>
          <div class="detalle-item">
            <span class="label">Fecha:</span>
            <span class="value">{{ formatDateTime(selectedEliminacion.fechaEliminacion) }}</span>
          </div>
          <div class="detalle-item">
            <span class="label">Tipo:</span>
            <span class="value">{{ selectedEliminacion.tipoEliminacion }}</span>
          </div>
          <div class="detalle-item">
            <span class="label">Eliminado por:</span>
            <span class="value">{{ selectedEliminacion.nombreAdministrador }}</span>
          </div>
          <div class="detalle-item">
            <span class="label">IP:</span>
            <span class="value">{{ selectedEliminacion.ipAddress || 'No registrada' }}</span>
          </div>
          <div class="detalle-item" v-if="selectedEliminacion.motivoEliminacion">
            <span class="label">Motivo:</span>
            <span class="value">{{ selectedEliminacion.motivoEliminacion }}</span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" @click="closeModal" class="btn btn-secondary">
          Cerrar
        </button>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { eliminacionProductoService } from '@/services/eliminacionProductoService'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import SearchBox from '@/components/SearchBox.vue'
import Modal from '@/components/Modal.vue'
import { formatDateTime, formatCurrency } from '@/utils/helpers'
import Swal from 'sweetalert2'

const loading = ref(false)
const generandoPDF = ref(false)
const showModal = ref(false)
const searchTerm = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const eliminaciones = ref([])
const estadisticas = ref(null)
const selectedEliminacion = ref(null)

const filteredEliminaciones = computed(() => {
  if (!searchTerm.value) {
    return eliminaciones.value
  }
  
  const term = searchTerm.value.toLowerCase()
  return eliminaciones.value.filter(e => 
    e.nombreProductoEliminado?.toLowerCase().includes(term) ||
    e.codigoProductoEliminado?.toLowerCase().includes(term) ||
    e.nombreAdministrador?.toLowerCase().includes(term) ||
    e.motivoEliminacion?.toLowerCase().includes(term) ||
    e.tipoEliminacion?.toLowerCase().includes(term)
  )
})

const totalPages = computed(() => 
  Math.ceil(filteredEliminaciones.value.length / itemsPerPage)
)

const paginatedEliminaciones = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredEliminaciones.value.slice(start, end)
})

const fetchEliminaciones = async () => {
  loading.value = true
  try {
    eliminaciones.value = await eliminacionProductoService.getAll()
  } catch (error) {
    console.error('Error al cargar eliminaciones:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudieron cargar los registros de eliminaciones'
    })
  } finally {
    loading.value = false
  }
}

const fetchEstadisticas = async () => {
  try {
    estadisticas.value = await eliminacionProductoService.getEstadisticas()
  } catch (error) {
    console.error('Error al cargar estadísticas:', error)
  }
}

const buscar = async () => {
  if (!searchTerm.value.trim()) {
    await fetchEliminaciones()
    return
  }
  
  loading.value = true
  try {
    eliminaciones.value = await eliminacionProductoService.buscar(searchTerm.value)
    currentPage.value = 1
  } catch (error) {
    console.error('Error en búsqueda:', error)
  } finally {
    loading.value = false
  }
}

const verDetalles = (eliminacion) => {
  selectedEliminacion.value = eliminacion
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedEliminacion.value = null
}

const generarPDF = async () => {
  generandoPDF.value = true
  try {
    const response = await eliminacionProductoService.generarPDF(searchTerm.value || null)
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(response.html)
    printWindow.document.close()
    
    printWindow.onload = () => {
      printWindow.print()
    }

    Swal.fire({
      icon: 'success',
      title: 'PDF Generado',
      text: 'El reporte se ha abierto en una nueva ventana. Usa Ctrl+P para guardarlo como PDF.',
      timer: 3000
    })
  } catch (error) {
    console.error('Error al generar PDF:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo generar el PDF'
    })
  } finally {
    generandoPDF.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    fetchEliminaciones(),
    fetchEstadisticas()
  ])
})
</script>

<style scoped>
.eliminaciones-page {
  max-width: 1400px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding: 20px;
}

.pagination-info {
  color: #7f8c8d;
}

.detalles-container {
  padding: 10px 0;
}

.detalle-grupo {
  margin-bottom: 25px;
}

.detalle-grupo h4 {
  color: #2c3e50;
  border-bottom: 2px solid #FF7713;
  padding-bottom: 8px;
  margin-bottom: 15px;
}

.detalle-item {
  display: flex;
  margin-bottom: 10px;
}

.detalle-item .label {
  font-weight: 600;
  color: #7f8c8d;
  width: 120px;
  flex-shrink: 0;
}

.detalle-item .value {
  color: #2c3e50;
}

.valor-total {
  font-weight: bold;
  color: #e74c3c;
  font-size: 1.1rem;
}

.badge-info {
  background-color: #3498db;
  color: white;
}

code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .table-container {
    overflow-x: auto;
  }
}
</style>
