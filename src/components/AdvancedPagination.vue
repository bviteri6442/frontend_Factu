<template>
  <div class="advanced-pagination" v-if="totalPages > 1">
    <div class="pagination-controls">
      <!-- Ir a primera página -->
      <button 
        @click="goToPage(1)" 
        :disabled="currentPage === 1"
        class="btn btn-sm btn-jump"
        title="Ir a la primera página"
      >
        <i class="fas fa-angle-double-left"></i>
      </button>

      <!-- Retroceder 1000 -->
      <button 
        @click="goToPage(Math.max(1, currentPage - 1000))" 
        :disabled="currentPage <= 1000"
        class="btn btn-sm btn-jump-large"
        title="Retroceder 1000 páginas"
      >
        <i class="fas fa-backward"></i> 1000
      </button>

      <!-- Retroceder 100 -->
      <button 
        @click="goToPage(Math.max(1, currentPage - 100))" 
        :disabled="currentPage <= 100"
        class="btn btn-sm btn-jump-medium"
        title="Retroceder 100 páginas"
      >
        <i class="fas fa-backward"></i> 100
      </button>

      <!-- Retroceder 10 -->
      <button 
        @click="goToPage(Math.max(1, currentPage - 10))" 
        :disabled="currentPage <= 10"
        class="btn btn-sm btn-jump-small"
        title="Retroceder 10 páginas"
      >
        <i class="fas fa-backward"></i> 10
      </button>

      <!-- Anterior -->
      <button 
        @click="goToPage(currentPage - 1)" 
        :disabled="currentPage === 1"
        class="btn btn-sm btn-nav"
      >
        <i class="fas fa-chevron-left"></i> Anterior
      </button>

      <!-- Páginas visibles (5 páginas) -->
      <div class="page-numbers">
        <button 
          v-for="page in visiblePages" 
          :key="page"
          @click="goToPage(page)"
          :class="['btn', 'btn-sm', 'btn-page', { active: currentPage === page }]"
        >
          {{ page }}
        </button>
      </div>

      <!-- Siguiente -->
      <button 
        @click="goToPage(currentPage + 1)" 
        :disabled="currentPage === totalPages"
        class="btn btn-sm btn-nav"
      >
        Siguiente <i class="fas fa-chevron-right"></i>
      </button>

      <!-- Avanzar 10 -->
      <button 
        @click="goToPage(Math.min(totalPages, currentPage + 10))" 
        :disabled="currentPage + 10 > totalPages"
        class="btn btn-sm btn-jump-small"
        title="Avanzar 10 páginas"
      >
        10 <i class="fas fa-forward"></i>
      </button>

      <!-- Avanzar 100 -->
      <button 
        @click="goToPage(Math.min(totalPages, currentPage + 100))" 
        :disabled="currentPage + 100 > totalPages"
        class="btn btn-sm btn-jump-medium"
        title="Avanzar 100 páginas"
      >
        100 <i class="fas fa-forward"></i>
      </button>

      <!-- Avanzar 1000 -->
      <button 
        @click="goToPage(Math.min(totalPages, currentPage + 1000))" 
        :disabled="currentPage + 1000 > totalPages"
        class="btn btn-sm btn-jump-large"
        title="Avanzar 1000 páginas"
      >
        1000 <i class="fas fa-forward"></i>
      </button>

      <!-- Ir a última página -->
      <button 
        @click="goToPage(totalPages)" 
        :disabled="currentPage === totalPages"
        class="btn btn-sm btn-jump"
        title="Ir a la última página"
      >
        <i class="fas fa-angle-double-right"></i>
      </button>
    </div>

    <!-- Info de página actual -->
    <div class="pagination-info">
      Página <strong>{{ currentPage }}</strong> de <strong>{{ totalPages }}</strong>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:currentPage'])

// Calcular páginas visibles (mostrar 5 páginas)
const visiblePages = computed(() => {
  const pages = []
  const total = props.totalPages
  const current = props.currentPage
  
  // Calcular rango de 5 páginas centradas en la actual
  let start = Math.max(1, current - 2)
  let end = Math.min(total, start + 4)
  
  // Ajustar si estamos cerca del inicio
  if (end - start < 4) {
    start = Math.max(1, end - 4)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('update:currentPage', page)
  }
}
</script>

<style scoped>
.advanced-pagination {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.pagination-controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
  padding: 0 0.5rem;
  border-left: 2px solid #e0e0e0;
  border-right: 2px solid #e0e0e0;
}

.btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  background-color: white;
  color: #374151;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.btn:hover:not(:disabled) {
  background-color: #f3f4f6;
  border-color: #9ca3af;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f9fafb;
}

.btn-sm {
  padding: 0.375rem 0.625rem;
  font-size: 0.8125rem;
}

/* Botones de navegación básica */
.btn-nav {
  background-color: #3b82f6;
  color: white;
  border-color: #2563eb;
}

.btn-nav:hover:not(:disabled) {
  background-color: #2563eb;
  border-color: #1d4ed8;
}

/* Botones de salto */
.btn-jump {
  background-color: #8b5cf6;
  color: white;
  border-color: #7c3aed;
  font-weight: 600;
}

.btn-jump:hover:not(:disabled) {
  background-color: #7c3aed;
  border-color: #6d28d9;
}

.btn-jump-small {
  background-color: #10b981;
  color: white;
  border-color: #059669;
}

.btn-jump-small:hover:not(:disabled) {
  background-color: #059669;
  border-color: #047857;
}

.btn-jump-medium {
  background-color: #f59e0b;
  color: white;
  border-color: #d97706;
}

.btn-jump-medium:hover:not(:disabled) {
  background-color: #d97706;
  border-color: #b45309;
}

.btn-jump-large {
  background-color: #ef4444;
  color: white;
  border-color: #dc2626;
}

.btn-jump-large:hover:not(:disabled) {
  background-color: #dc2626;
  border-color: #b91c1c;
}

/* Botones de página */
.btn-page {
  min-width: 2.5rem;
  justify-content: center;
}

.btn-page.active {
  background-color: #1e40af;
  color: white;
  border-color: #1e3a8a;
  font-weight: 600;
  transform: scale(1.1);
}

/* Info de paginación */
.pagination-info {
  color: #6b7280;
  font-size: 0.875rem;
  text-align: center;
}

.pagination-info strong {
  color: #1f2937;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .pagination-controls {
    gap: 0.25rem;
  }
  
  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .btn-jump-large,
  .btn-jump-medium {
    display: none;
  }
  
  .page-numbers {
    padding: 0 0.25rem;
  }
}

@media (max-width: 480px) {
  .btn-jump-small {
    font-size: 0;
    padding: 0.25rem;
  }
  
  .btn-jump-small i {
    margin: 0;
  }
  
  .btn-nav {
    font-size: 0;
    padding: 0.25rem 0.5rem;
  }
  
  .btn-nav i {
    margin: 0;
  }
}
</style>
