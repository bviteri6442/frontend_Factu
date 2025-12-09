<template>
  <div class="logs-page">
    <div class="page-header">
      <h1 class="page-title">📋 Logs del Sistema</h1>
      <button @click="actualizarDatos" class="btn btn-primary">
        Actualizar
      </button>
    </div>

    <!-- Tabs para cambiar entre tipos de logs -->
    <div class="tabs">
      <button 
        @click="tabActiva = 'intentos-login'" 
        :class="['tab', { active: tabActiva === 'intentos-login' }]"
      >
        🔐 Intentos de Login
      </button>
      <button 
        @click="tabActiva = 'errores'" 
        :class="['tab', { active: tabActiva === 'errores' }]"
      >
        ⚠️ Errores del Sistema
      </button>
    </div>

    <LoadingSpinner :show="loading" message="Cargando logs..." />

    <!-- Tab: Intentos de Login -->
    <div v-if="!loading && tabActiva === 'intentos-login'" class="tab-content">
      <!-- Estadísticas -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ statsIntentosLogin.totalIntentos || 0 }}</div>
          <div class="stat-label">Total Intentos</div>
        </div>
        <div class="stat-card success">
          <div class="stat-value">{{ statsIntentosLogin.intentosExitosos || 0 }}</div>
          <div class="stat-label">Exitosos</div>
        </div>
        <div class="stat-card danger">
          <div class="stat-value">{{ statsIntentosLogin.intentosFallidos || 0 }}</div>
          <div class="stat-label">Fallidos</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-value">{{ statsIntentosLogin.intentosFallidosHoy || 0 }}</div>
          <div class="stat-label">Fallidos Hoy</div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card">
        <div class="card-header">
          <h3>Filtros</h3>
          <button @click="exportarPDFIntentosLogin" class="btn btn-secondary btn-sm">
            📄 Exportar PDF
          </button>
        </div>
        <div class="filters-grid">
          <div class="filter-item">
            <label>Fecha Inicio:</label>
            <input type="date" v-model="filtrosIntentosLogin.fechaInicio" />
          </div>
          <div class="filter-item">
            <label>Fecha Fin:</label>
            <input type="date" v-model="filtrosIntentosLogin.fechaFin" />
          </div>
          <div class="filter-item">
            <label>Estado:</label>
            <select v-model="filtrosIntentosLogin.exitoso">
              <option :value="undefined">Todos</option>
              <option :value="true">Exitosos</option>
              <option :value="false">Fallidos</option>
            </select>
          </div>
          <div class="filter-item">
            <label>Usuario:</label>
            <input type="text" v-model="filtrosIntentosLogin.usuario" placeholder="Nombre de usuario" />
          </div>
          <div class="filter-actions">
            <button @click="cargarIntentosLogin" class="btn btn-primary btn-sm">Filtrar</button>
            <button @click="limpiarFiltrosIntentosLogin" class="btn btn-secondary btn-sm">Limpiar</button>
          </div>
        </div>
      </div>

      <!-- Tabla de Intentos -->
      <div class="card">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Estado</th>
                <th>IP</th>
                <th>Navegador</th>
                <th>Mensaje</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="intentosLogin.length === 0">
                <td colspan="6" class="text-center">No se encontraron intentos de login</td>
              </tr>
              <tr v-for="intento in intentosLogin" :key="intento.id">
                <td>{{ formatFecha(intento.fechaIntento) }}</td>
                <td>{{ intento.nombreUsuario }}</td>
                <td>
                  <span :class="['badge', intento.exitoso ? 'badge-success' : 'badge-danger']">
                    {{ intento.exitoso ? '✓ Exitoso' : '✗ Fallido' }}
                  </span>
                </td>
                <td>{{ intento.ipAddress || '-' }}</td>
                <td>{{ truncar(intento.userAgent, 40) }}</td>
                <td>{{ intento.mensajeError || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Tab: Errores del Sistema -->
    <div v-if="!loading && tabActiva === 'errores'" class="tab-content">
      <!-- Estadísticas -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ statsErrores.totalErrores || 0 }}</div>
          <div class="stat-label">Total Errores</div>
        </div>
        <div class="stat-card danger">
          <div class="stat-value">{{ statsErrores.erroresNoRevisados || 0 }}</div>
          <div class="stat-label">No Revisados</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-value">{{ statsErrores.erroresHoy || 0 }}</div>
          <div class="stat-label">Hoy</div>
        </div>
        <div class="stat-card info">
          <div class="stat-value">{{ statsErrores.erroresSemana || 0 }}</div>
          <div class="stat-label">Esta Semana</div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card">
        <div class="card-header">
          <h3>Filtros</h3>
          <button @click="exportarPDFErrores" class="btn btn-secondary btn-sm">
            📄 Exportar PDF
          </button>
        </div>
        <div class="filters-grid">
          <div class="filter-item">
            <label>Fecha Inicio:</label>
            <input type="date" v-model="filtrosErrores.fechaInicio" />
          </div>
          <div class="filter-item">
            <label>Fecha Fin:</label>
            <input type="date" v-model="filtrosErrores.fechaFin" />
          </div>
          <div class="filter-item">
            <label>Nivel:</label>
            <select v-model="filtrosErrores.nivel">
              <option value="">Todos</option>
              <option value="Critical">Crítico</option>
              <option value="Error">Error</option>
              <option value="Warning">Advertencia</option>
              <option value="Info">Información</option>
            </select>
          </div>
          <div class="filter-item">
            <label>Estado:</label>
            <select v-model="filtrosErrores.revisado">
              <option :value="undefined">Todos</option>
              <option :value="false">No Revisados</option>
              <option :value="true">Revisados</option>
            </select>
          </div>
          <div class="filter-actions">
            <button @click="cargarErrores" class="btn btn-primary btn-sm">Filtrar</button>
            <button @click="limpiarFiltrosErrores" class="btn btn-secondary btn-sm">Limpiar</button>
          </div>
        </div>
      </div>

      <!-- Tabla de Errores -->
      <div class="card">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Nivel</th>
                <th>Tipo</th>
                <th>Mensaje</th>
                <th>Origen</th>
                <th>Usuario</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="errores.length === 0">
                <td colspan="8" class="text-center">No se encontraron errores</td>
              </tr>
              <tr v-for="error in errores" :key="error.id">
                <td>{{ formatFecha(error.fecha) }}</td>
                <td>
                  <span :class="['badge', getNivelClass(error.nivel)]">
                    {{ error.nivel }}
                  </span>
                </td>
                <td>{{ error.tipoError }}</td>
                <td>{{ truncar(error.mensaje, 50) }}</td>
                <td>{{ error.origen || '-' }}</td>
                <td>{{ error.usuarioId || '-' }}</td>
                <td>
                  <span :class="['badge', error.revisado ? 'badge-success' : 'badge-warning']">
                    {{ error.revisado ? 'Revisado' : 'Pendiente' }}
                  </span>
                </td>
                <td>
                  <button 
                    v-if="!error.revisado" 
                    @click="marcarRevisado(error)" 
                    class="btn btn-sm btn-primary"
                  >
                    Marcar Revisado
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { logsService } from '@/services/logsService'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import Swal from 'sweetalert2'

const loading = ref(false)
const tabActiva = ref('intentos-login')

// Intentos de Login
const intentosLogin = ref([])
const statsIntentosLogin = ref({})
const filtrosIntentosLogin = ref({
  fechaInicio: undefined,
  fechaFin: undefined,
  exitoso: undefined,
  usuario: ''
})

// Errores
const errores = ref([])
const statsErrores = ref({})
const filtrosErrores = ref({
  fechaInicio: undefined,
  fechaFin: undefined,
  nivel: '',
  revisado: undefined
})

const formatFecha = (fecha) => {
  if (!fecha) return '-'
  const date = new Date(fecha)
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const truncar = (texto, longitud) => {
  if (!texto) return '-'
  return texto.length > longitud ? texto.substring(0, longitud) + '...' : texto
}

const getNivelClass = (nivel) => {
  const map = {
    'Critical': 'badge-danger',
    'Error': 'badge-danger',
    'Warning': 'badge-warning',
    'Info': 'badge-info'
  }
  return map[nivel] || 'badge-secondary'
}

const cargarIntentosLogin = async () => {
  loading.value = true
  try {
    intentosLogin.value = await logsService.getIntentosLogin(filtrosIntentosLogin.value)
    statsIntentosLogin.value = await logsService.getEstadisticasIntentosLogin()
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudieron cargar los intentos de login'
    })
  } finally {
    loading.value = false
  }
}

const cargarErrores = async () => {
  loading.value = true
  try {
    errores.value = await logsService.getErrores(filtrosErrores.value)
    statsErrores.value = await logsService.getEstadisticasErrores()
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

const limpiarFiltrosIntentosLogin = () => {
  filtrosIntentosLogin.value = {
    fechaInicio: undefined,
    fechaFin: undefined,
    exitoso: undefined,
    usuario: ''
  }
  cargarIntentosLogin()
}

const limpiarFiltrosErrores = () => {
  filtrosErrores.value = {
    fechaInicio: undefined,
    fechaFin: undefined,
    nivel: '',
    revisado: undefined
  }
  cargarErrores()
}

const marcarRevisado = async (error) => {
  const result = await Swal.fire({
    title: 'Marcar como revisado',
    input: 'textarea',
    inputLabel: 'Notas (opcional)',
    inputPlaceholder: 'Agrega notas sobre la revisión...',
    showCancelButton: true,
    confirmButtonText: 'Marcar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#6366F1'
  })

  if (result.isConfirmed) {
    try {
      await logsService.marcarErrorRevisado(error.id, result.value)
      await Swal.fire({
        icon: 'success',
        title: 'Marcado',
        text: 'El error se marcó como revisado',
        timer: 2000
      })
      cargarErrores()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo marcar el error'
      })
    }
  }
}

const exportarPDFIntentosLogin = async () => {
  try {
    const { html, nombreArchivo } = await logsService.generarPDFIntentosLogin(filtrosIntentosLogin.value)
    
    const newWindow = window.open('', '_blank')
    newWindow.document.write(html)
    newWindow.document.close()
    newWindow.print()
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo generar el PDF'
    })
  }
}

const exportarPDFErrores = async () => {
  try {
    const { html, nombreArchivo } = await logsService.generarPDFErrores(filtrosErrores.value)
    
    const newWindow = window.open('', '_blank')
    newWindow.document.write(html)
    newWindow.document.close()
    newWindow.print()
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo generar el PDF'
    })
  }
}

const actualizarDatos = () => {
  if (tabActiva.value === 'intentos-login') {
    cargarIntentosLogin()
  } else {
    cargarErrores()
  }
}

onMounted(() => {
  cargarIntentosLogin()
  cargarErrores()
})
</script>

<style scoped>
.logs-page {
  max-width: 1600px;
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

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #e0e0e0;
}

.tab {
  padding: 15px 30px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: #7f8c8d;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
}

.tab:hover {
  color: var(--primary-color);
}

.tab.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  border-left: 4px solid var(--primary-color);
}

.stat-card.success {
  border-left-color: #27ae60;
}

.stat-card.danger {
  border-left-color: #e74c3c;
}

.stat-card.warning {
  border-left-color: #f39c12;
}

.stat-card.info {
  border-left-color: #3498db;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--secondary-color);
  margin-bottom: 10px;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 500;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-item label {
  font-weight: 500;
  color: var(--secondary-color);
  font-size: 14px;
}

.filter-item input,
.filter-item select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.filter-actions {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.text-center {
  text-align: center;
  padding: 40px !important;
  color: #7f8c8d;
}

.badge-info {
  background-color: #3498db;
  color: white;
}

.badge-secondary {
  background-color: #95a5a6;
  color: white;
}
</style>
