<template>
  <div class="error-logs-page">
    <div class="page-header">
      <h1 class="page-title">Registro de Errores</h1>
      <button @click="fetchErrorLogs" class="btn btn-primary">
        Actualizar
      </button>
    </div>

    <LoadingSpinner :show="loading" message="Cargando errores..." />

    <div v-if="!loading" class="card">
      <div class="card-header">
        <SearchBox 
          v-model="searchTerm" 
          placeholder="Buscar por mensaje o pantalla..."
        />
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Pantalla</th>
              <th>Mensaje</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredErrorLogs.length === 0">
              <td colspan="4" class="text-center">
                No se encontraron errores registrados
              </td>
            </tr>
            <tr v-for="error in paginatedErrorLogs" :key="error.id">
              <td>{{ formatDateTime(error.fecha) }}</td>
              <td>
                <span class="badge badge-warning">{{ error.pantalla || 'N/A' }}</span>
              </td>
              <td>
                <div class="error-message">{{ error.mensaje }}</div>
              </td>
              <td>
                <button 
                  @click="viewErrorDetail(error)" 
                  class="btn btn-sm btn-primary"
                  title="Ver Detalle"
                >
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

    <!-- Modal Detalle Error -->
    <Modal 
      :show="showDetailModal" 
      title="Detalle del Error"
      :showFooter="false"
      @close="showDetailModal = false"
    >
      <div v-if="selectedError" class="error-detail">
        <div class="detail-row">
          <strong>Fecha:</strong>
          <span>{{ formatDateTime(selectedError.fecha) }}</span>
        </div>
        <div class="detail-row">
          <strong>Pantalla:</strong>
          <span>{{ selectedError.pantalla || 'N/A' }}</span>
        </div>
        <div class="detail-row">
          <strong>Mensaje:</strong>
          <p class="error-text">{{ selectedError.mensaje }}</p>
        </div>
        <div class="detail-row" v-if="selectedError.stackTrace">
          <strong>Stack Trace:</strong>
          <pre class="stack-trace">{{ selectedError.stackTrace }}</pre>
        </div>

        <div class="modal-footer">
          <button @click="showDetailModal = false" class="btn btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { errorLogService } from '@/services/errorLogService'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import SearchBox from '@/components/SearchBox.vue'
import Modal from '@/components/Modal.vue'
import { formatDateTime } from '@/utils/helpers'
import Swal from 'sweetalert2'

const loading = ref(false)
const searchTerm = ref('')
const currentPage = ref(1)
const itemsPerPage = 15
const showDetailModal = ref(false)
const selectedError = ref(null)

const errorLogs = ref([])

const filteredErrorLogs = computed(() => {
  if (!searchTerm.value) {
    return errorLogs.value
  }
  
  const term = searchTerm.value.toLowerCase()
  return errorLogs.value.filter(e => 
    e.mensaje?.toLowerCase().includes(term) ||
    e.pantalla?.toLowerCase().includes(term)
  )
})

const totalPages = computed(() => 
  Math.ceil(filteredErrorLogs.value.length / itemsPerPage)
)

const paginatedErrorLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredErrorLogs.value.slice(start, end)
})

const fetchErrorLogs = async () => {
  loading.value = true
  try {
    errorLogs.value = await errorLogService.getAll()
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudieron cargar los errores'
    })
  } finally {
    loading.value = false
  }
}

const viewErrorDetail = (error) => {
  selectedError.value = error
  showDetailModal.value = true
}

onMounted(() => {
  fetchErrorLogs()
})
</script>

<style scoped>
.error-logs-page {
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
  color: var(--secondary-color);
  margin: 0;
}

.error-message {
  max-width: 500px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.error-detail .detail-row {
  margin-bottom: 20px;
}

.error-detail .detail-row strong {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
}

.error-text {
  padding: 10px;
  background-color: #fff3cd;
  border-left: 4px solid #f39c12;
  border-radius: 4px;
  color: #856404;
  word-wrap: break-word;
}

.stack-trace {
  padding: 15px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  max-height: 300px;
  color: #e74c3c;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .table-container {
    overflow-x: auto;
  }
}
</style>
