<template>
  <div class="cliente-search-container">
    <div class="search-header">
      <input
        ref="searchInput"
        v-model="searchTerm"
        type="text"
        class="search-input-main"
        :placeholder="searchPlaceholder"
        @input="onSearchInput"
        @keydown.esc="clearSearch"
        @keydown.down.prevent="navigateDown"
        @keydown.up.prevent="navigateUp"
        @keydown.enter.prevent="selectHighlighted"
      />
    </div>

    <div class="search-results">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Buscando clientes...</span>
      </div>

      <div v-else-if="error" class="error-state">
        <span class="error-icon">⚠️</span>
        <span>{{ error }}</span>
      </div>

      <div v-else-if="searchTerm.length > 0 && searchTerm.length < minSearchLength" class="info-state">
        <span class="info-icon">ℹ️</span>
        <span>Escriba al menos {{ minSearchLength }} caracteres para buscar</span>
      </div>

      <div v-else-if="clientes.length === 0 && searchTerm.length >= minSearchLength" class="empty-state">
        <span class="empty-icon">🔍</span>
        <span>No se encontraron clientes</span>
      </div>

      <div v-else-if="clientes.length > 0" class="results-list">
        <div
          v-for="(cliente, index) in clientes"
          :key="cliente.id"
          class="result-item"
          :class="{ 'highlighted': index === highlightedIndex }"
          @click="selectCliente(cliente)"
          @mouseenter="highlightedIndex = index"
        >
          <div class="item-header">
            <strong>{{ cliente.nombre }}</strong>
            <span class="badge badge-info">{{ cliente.documento }}</span>
          </div>
          <div class="item-details">
            <span v-if="cliente.telefono">📞 {{ cliente.telefono }}</span>
            <span v-if="cliente.email">✉️ {{ cliente.email }}</span>
          </div>
          <div v-if="cliente.direccion" class="item-address">
            📍 {{ cliente.direccion }}
          </div>
        </div>

        <div v-if="hasMore" class="load-more">
          <small>Mostrando {{ clientes.length }} resultados. Refine su búsqueda para ver más.</small>
        </div>
      </div>

      <div v-else class="initial-state">
        <span class="search-icon">🔍</span>
        <p>Escriba para buscar clientes</p>
        <small>Puede buscar por nombre, documento, teléfono o email</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { clienteService } from '@/services/clienteService'

const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  },
  placeholder: {
    type: String,
    default: 'Click para seleccionar cliente (Opcional - Consumidor Final por defecto)'
  },
  searchPlaceholder: {
    type: String,
    default: 'Buscar por nombre, documento, teléfono o email...'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: true
  },
  minSearchLength: {
    type: Number,
    default: 2
  },
  maxResults: {
    type: Number,
    default: 20
  }
})

const emit = defineEmits(['update:modelValue', 'select', 'clear'])

const searchTerm = ref('')
const clientes = ref([])
const loading = ref(false)
const error = ref(null)
const hasMore = ref(false)
const highlightedIndex = ref(-1)
const searchInput = ref(null)
let searchTimeout = null

const clearSearch = () => {
  searchTerm.value = ''
  clientes.value = []
  highlightedIndex.value = -1
  error.value = null
}

const onSearchInput = () => {
  clearTimeout(searchTimeout)
  
  if (searchTerm.value.length < props.minSearchLength) {
    clientes.value = []
    error.value = null
    return
  }

  // Debounce de 300ms para evitar muchas peticiones
  searchTimeout = setTimeout(() => {
    searchClientes()
  }, 300)
}

const searchClientes = async () => {
  if (searchTerm.value.length < props.minSearchLength) return

  loading.value = true
  error.value = null
  highlightedIndex.value = -1

  try {
    const response = await clienteService.search(searchTerm.value, props.maxResults)
    clientes.value = response.data || response
    hasMore.value = clientes.value.length >= props.maxResults
  } catch (err) {
    console.error('Error buscando clientes:', err)
    error.value = 'Error al buscar clientes. Intente nuevamente.'
    clientes.value = []
  } finally {
    loading.value = false
  }
}

const selectCliente = (cliente) => {
  emit('update:modelValue', cliente)
  emit('select', cliente)
  // El modal se cerrará desde el componente padre
}

const navigateDown = () => {
  if (highlightedIndex.value < clientes.value.length - 1) {
    highlightedIndex.value++
  }
}

const navigateUp = () => {
  if (highlightedIndex.value > 0) {
    highlightedIndex.value--
  }
}

const selectHighlighted = () => {
  if (highlightedIndex.value >= 0 && highlightedIndex.value < clientes.value.length) {
    selectCliente(clientes.value[highlightedIndex.value])
  }
}
</script>

<style scoped>
.cliente-search-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-header {
  width: 100%;
}

.search-input-main {
  width: 100%;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px 16px;
  font-size: 16px;
  outline: none;
  transition: all 0.2s;
}

.search-input-main:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-results {
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
}

/* Estados */
.loading-state,
.error-state,
.empty-state,
.info-state,
.initial-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
  color: #64748b;
  text-align: center;
}

.search-icon,
.empty-icon,
.info-icon {
  font-size: 64px;
  margin-bottom: 8px;
}

.initial-state p {
  font-size: 18px;
  font-weight: 500;
  color: #475569;
  margin: 0;
}

.initial-state small {
  color: #94a3b8;
  font-size: 14px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 56px;
}

.error-state {
  color: #ef4444;
}

.info-state {
  color: #3b82f6;
}

/* Lista de resultados */
.results-list {
  padding: 8px;
}

.result-item {
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 6px;
  border: 2px solid transparent;
}

.result-item:hover,
.result-item.highlighted {
  background: #eef2ff;
  border-color: #6366f1;
  transform: translateX(4px);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-header strong {
  color: #1e293b;
  font-size: 16px;
}

.badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.badge-info {
  background: #dbeafe;
  color: #1e40af;
}

.item-details {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.item-address {
  font-size: 13px;
  color: #94a3b8;
  margin-top: 6px;
}

.load-more {
  padding: 12px;
  text-align: center;
  color: #64748b;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  border-radius: 0 0 8px 8px;
  font-size: 13px;
}
</style>
