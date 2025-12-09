<template>
  <div class="producto-search-container">
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
        <span>Buscando productos...</span>
      </div>

      <div v-else-if="error" class="error-state">
        <span class="error-icon">⚠️</span>
        <span>{{ error }}</span>
      </div>

      <div v-else-if="searchTerm.length > 0 && searchTerm.length < minSearchLength" class="info-state">
        <span class="info-icon">ℹ️</span>
        <span>Escriba al menos {{ minSearchLength }} caracteres para buscar</span>
      </div>

      <div v-else-if="productos.length === 0 && searchTerm.length >= minSearchLength" class="empty-state">
        <span class="empty-icon">🔍</span>
        <span>No se encontraron productos</span>
      </div>

      <div v-else-if="productos.length > 0" class="results-list">
        <div
          v-for="(producto, index) in productos"
          :key="producto.id"
          class="result-item"
          :class="{ 'highlighted': index === highlightedIndex, 'sin-stock': producto.stock <= 0 }"
          @click="selectProducto(producto)"
          @mouseenter="highlightedIndex = index"
        >
          <div class="item-header">
            <strong>{{ producto.nombre }}</strong>
            <span class="badge badge-primary">{{ producto.codigo }}</span>
          </div>
          <div class="item-details">
            <span class="precio">💰 ${{ producto.precioVenta.toFixed(2) }}</span>
            <span :class="['stock', producto.stock <= 0 ? 'stock-agotado' : producto.stock <= 5 ? 'stock-bajo' : 'stock-normal']">
              📦 Stock: {{ producto.stock }}
            </span>
          </div>
          <div v-if="producto.descripcion" class="item-description">
            {{ producto.descripcion }}
          </div>
          <div v-if="producto.stock <= 0" class="stock-warning">
            ⚠️ Producto sin stock disponible
          </div>
        </div>

        <div v-if="hasMore" class="load-more">
          <small>Mostrando {{ productos.length }} resultados. Refine su búsqueda para ver más.</small>
        </div>
      </div>

      <div v-else class="initial-state">
        <span class="search-icon">🔍</span>
        <p>Escriba para buscar productos</p>
        <small>Puede buscar por nombre, código o descripción</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { productoService } from '@/services/productoService'

const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  },
  searchPlaceholder: {
    type: String,
    default: 'Buscar por nombre, código o descripción...'
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

const emit = defineEmits(['update:modelValue', 'select'])

const searchTerm = ref('')
const productos = ref([])
const loading = ref(false)
const error = ref(null)
const hasMore = ref(false)
const highlightedIndex = ref(-1)
const searchInput = ref(null)
let searchTimeout = null

const clearSearch = () => {
  searchTerm.value = ''
  productos.value = []
  highlightedIndex.value = -1
  error.value = null
}

const onSearchInput = () => {
  clearTimeout(searchTimeout)
  
  if (searchTerm.value.length < props.minSearchLength) {
    productos.value = []
    error.value = null
    return
  }

  // Debounce de 300ms para evitar muchas peticiones
  searchTimeout = setTimeout(() => {
    searchProductos()
  }, 300)
}

const searchProductos = async () => {
  if (searchTerm.value.length < props.minSearchLength) return

  loading.value = true
  error.value = null
  highlightedIndex.value = -1

  try {
    const response = await productoService.search(searchTerm.value, props.maxResults)
    productos.value = response.data || response
    hasMore.value = productos.value.length >= props.maxResults
  } catch (err) {
    console.error('Error buscando productos:', err)
    error.value = 'Error al buscar productos. Intente nuevamente.'
    productos.value = []
  } finally {
    loading.value = false
  }
}

const selectProducto = (producto) => {
  if (producto.stock <= 0) {
    error.value = 'Este producto no tiene stock disponible'
    return
  }
  
  emit('update:modelValue', producto)
  emit('select', producto)
}

const navigateDown = () => {
  if (highlightedIndex.value < productos.value.length - 1) {
    highlightedIndex.value++
  }
}

const navigateUp = () => {
  if (highlightedIndex.value > 0) {
    highlightedIndex.value--
  }
}

const selectHighlighted = () => {
  if (highlightedIndex.value >= 0 && highlightedIndex.value < productos.value.length) {
    selectProducto(productos.value[highlightedIndex.value])
  }
}
</script>

<style scoped>
.producto-search-container {
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
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
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
  border-top-color: #10b981;
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
  background: #ecfdf5;
  border-color: #10b981;
  transform: translateX(4px);
}

.result-item.sin-stock {
  opacity: 0.6;
  cursor: not-allowed;
}

.result-item.sin-stock:hover {
  background: #fee2e2;
  border-color: #ef4444;
  transform: translateX(0);
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

.badge-primary {
  background: #dbeafe;
  color: #1e40af;
}

.item-details {
  display: flex;
  gap: 16px;
  font-size: 14px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.precio {
  color: #10b981;
  font-weight: 600;
}

.stock {
  font-weight: 500;
}

.stock-normal {
  color: #10b981;
}

.stock-bajo {
  color: #f59e0b;
}

.stock-agotado {
  color: #ef4444;
}

.item-description {
  font-size: 13px;
  color: #64748b;
  margin-top: 6px;
  font-style: italic;
}

.stock-warning {
  margin-top: 8px;
  padding: 6px 10px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
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
