<template>
  <div class="eliminaciones-page">
    <div class="page-header">
      <h1 class="page-title">Historial de Eliminaciones de Usuarios</h1>
      <button @click="generarPDF" class="btn btn-primary" :disabled="generandoPDF">
        {{ generandoPDF ? 'Generando...' : '📄 Generar PDF' }}
      </button>
    </div>

    <!-- Estadísticas -->
    <div class="stats-container" v-if="estadisticas">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
          <span class="stat-value">{{ estadisticas.totalEliminaciones }}</span>
          <span class="stat-label">Total Eliminaciones</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-info">
          <span class="stat-value">{{ estadisticas.eliminacionesHoy }}</span>
          <span class="stat-label">Hoy</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📆</div>
        <div class="stat-info">
          <span class="stat-value">{{ estadisticas.eliminacionesSemana }}</span>
          <span class="stat-label">Esta Semana</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🗓️</div>
        <div class="stat-info">
          <span class="stat-value">{{ estadisticas.eliminacionesMes }}</span>
          <span class="stat-label">Este Mes</span>
        </div>
      </div>
    </div>

    <LoadingSpinner :show="loading" message="Cargando historial..." />

    <div v-if="!loading" class="card">
      <div class="card-header">
        <SearchBox 
          v-model="searchTerm" 
          placeholder="Buscar por nombre, cédula, email, rol, administrador..."
          @search="buscar"
        />
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Usuario Eliminado</th>
              <th>Cédula</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Eliminado por</th>
              <th>Tipo</th>
              <th>Motivo</th>
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
              <td>
                <strong>{{ eliminacion.nombreUsuarioEliminado }}</strong>
              </td>
              <td>{{ eliminacion.cedulaUsuarioEliminado }}</td>
              <td>{{ eliminacion.emailUsuarioEliminado }}</td>
              <td>
                <span :class="['badge', getRolBadgeClass(eliminacion.rolUsuarioEliminado)]">
                  {{ eliminacion.rolUsuarioEliminado }}
                </span>
              </td>
              <td>{{ eliminacion.nombreAdministrador }}</td>
              <td>
                <span :class="['badge', eliminacion.tipoEliminacion === 'Desactivación' ? 'badge-warning' : 'badge-danger']">
                  {{ eliminacion.tipoEliminacion }}
                </span>
              </td>
              <td>{{ eliminacion.motivoEliminacion || '-' }}</td>
              <td>
                <button 
                  @click="verDetalles(eliminacion)" 
                  class="btn btn-sm btn-info"
                  title="Ver detalles"
                >
                  👁️ Ver
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
          <h4>👤 Usuario Eliminado</h4>
          <div class="detalle-item">
            <span class="label">Nombre:</span>
            <span class="value">{{ selectedEliminacion.nombreUsuarioEliminado }}</span>
          </div>
          <div class="detalle-item">
            <span class="label">Cédula:</span>
            <span class="value">{{ selectedEliminacion.cedulaUsuarioEliminado }}</span>
          </div>
          <div class="detalle-item">
            <span class="label">Email:</span>
            <span class="value">{{ selectedEliminacion.emailUsuarioEliminado }}</span>
          </div>
          <div class="detalle-item">
            <span class="label">Rol:</span>
            <span class="value">{{ selectedEliminacion.rolUsuarioEliminado }}</span>
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
import { eliminacionUsuarioService } from '@/services/eliminacionUsuarioService'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import SearchBox from '@/components/SearchBox.vue'
import Modal from '@/components/Modal.vue'
import { formatDateTime } from '@/utils/helpers'
import Swal from 'sweetalert2'

const loading = ref(false)
const generandoPDF = ref(false)
const showModal = ref(false)
const searchTerm = ref('')
const currentPage = ref(1)
const itemsPerPage = 2

const eliminaciones = ref([])
const estadisticas = ref(null)
const selectedEliminacion = ref(null)

const filteredEliminaciones = computed(() => {
  if (!searchTerm.value) {
    return eliminaciones.value
  }
  
  const term = searchTerm.value.toLowerCase()
  return eliminaciones.value.filter(e => 
    e.nombreUsuarioEliminado?.toLowerCase().includes(term) ||
    e.cedulaUsuarioEliminado?.toLowerCase().includes(term) ||
    e.emailUsuarioEliminado?.toLowerCase().includes(term) ||
    e.rolUsuarioEliminado?.toLowerCase().includes(term) ||
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
    eliminaciones.value = await eliminacionUsuarioService.getAll()
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
    estadisticas.value = await eliminacionUsuarioService.getEstadisticas()
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
    eliminaciones.value = await eliminacionUsuarioService.buscar(searchTerm.value)
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
    const response = await eliminacionUsuarioService.generarPDF(searchTerm.value || null)
    
    // Crear ventana para imprimir/guardar como PDF
    const printWindow = window.open('', '_blank')
    printWindow.document.write(response.html)
    printWindow.document.close()
    
    // Esperar a que cargue y luego imprimir
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

const getRolBadgeClass = (rol) => {
  if (rol === 'Administrador') return 'badge-warning'
  if (rol === 'Secretaria') return 'badge-info'
  return 'badge-success'
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 28px;
  color: #2c3e50;
  margin: 0;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  font-size: 0.9rem;
  color: #7f8c8d;
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

.badge-info {
  background-color: #3498db;
  color: white;
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
