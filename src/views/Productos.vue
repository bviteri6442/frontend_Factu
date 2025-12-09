<template>
  <div class="productos-page">
    <div class="page-header">
      <h1 class="page-title">Productos</h1>
      <button 
        v-if="isAdmin"
        @click="openCreateModal" 
        class="btn btn-primary"
      >
        Nuevo Producto
      </button>
    </div>

    <LoadingSpinner :show="loading" message="Cargando productos..." />

    <div v-if="!loading" class="card">
      <div class="card-header">
        <SearchBox 
          v-model="searchTerm" 
          placeholder="Buscar por nombre o código de barras..."
        />
        <div class="filters">
          <label>
            <input type="checkbox" v-model="filterStockBajo" />
            Stock Bajo
          </label>
          <label>
            <input type="checkbox" v-model="filterSinStock" />
            Sin Stock
          </label>
        </div>
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th class="text-right">Precio Costo</th>
              <th class="text-right">Precio Venta</th>
              <th class="text-right">Stock Actual</th>
              <th class="text-right">Stock Mínimo</th>
              <th>Estado</th>
              <th v-if="isAdmin">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredProductos.length === 0">
              <td :colspan="isAdmin ? 8 : 7" class="text-center">
                No se encontraron productos
              </td>
            </tr>
            <tr 
              v-for="producto in paginatedProductos" 
              :key="producto.id"
              :class="{ 'low-stock': producto.stockActual <= producto.stockMinimo }"
            >
              <td>{{ producto.codigoBarra }}</td>
              <td>
                <strong>{{ producto.nombre }}</strong>
                <br />
                <small v-if="producto.descripcion">{{ producto.descripcion }}</small>
              </td>
              <td class="text-right">{{ formatCurrency(producto.precioCosto) }}</td>
              <td class="text-right">{{ formatCurrency(producto.precioVenta) }}</td>
              <td class="text-right">
                <span :class="getStockClass(producto)">
                  {{ producto.stockActual }}
                </span>
              </td>
              <td class="text-right">{{ producto.stockMinimo }}</td>
              <td>
                <span :class="['badge', producto.activo ? 'badge-success' : 'badge-danger']">
                  {{ producto.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td v-if="isAdmin">
                <div class="action-buttons">
                  <button 
                    @click="openEditModal(producto)" 
                    class="btn btn-sm btn-warning"
                    title="Editar"
                  >
                    Editar
                  </button>
                  <button 
                    @click="deleteProducto(producto)" 
                    class="btn btn-sm btn-danger"
                    title="Eliminar"
                  >
                    Eliminar
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

    <!-- Modal Create/Edit -->
    <Modal 
      :show="showModal" 
      :title="editMode ? 'Editar Producto' : 'Nuevo Producto'"
      :showFooter="false"
      @close="closeModal"
    >
      <form @submit.prevent="saveProducto">
        <div class="row">
          <div class="col-2">
            <div class="form-group">
              <label class="form-label required">Nombre</label>
              <input
                v-model="form.nombre"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': formErrors.nombre }"
                placeholder="Ej: Laptop HP Pavilion 15"
                required
              />
              <span v-if="formErrors.nombre" class="form-error">{{ formErrors.nombre }}</span>
            </div>
          </div>

          <div class="col-2">
            <div class="form-group">
              <label class="form-label required">Código de Barras</label>
              <input
                v-model="form.codigoBarra"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': formErrors.codigoBarra }"
                placeholder="Ej: 7501234567890 o PROD-001"
                :disabled="editMode"
                required
              />
              <span v-if="formErrors.codigoBarra" class="form-error">{{ formErrors.codigoBarra }}</span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Descripción</label>
          <textarea
            v-model="form.descripcion"
            class="form-control"
            rows="2"
            maxlength="500"
            placeholder="Ej: Laptop con procesador Intel Core i5, 8GB RAM, 256GB SSD, pantalla 15.6 pulgadas"
          ></textarea>
        </div>

        <div class="row">
          <div class="col-2">
            <div class="form-group">
              <label class="form-label required">Precio Costo</label>
              <input
                v-model.number="form.precioCosto"
                type="number"
                step="0.01"
                class="form-control"
                :class="{ 'is-invalid': formErrors.precioCosto }"
                placeholder="Ej: 450.00"
                required
              />
              <span v-if="formErrors.precioCosto" class="form-error">{{ formErrors.precioCosto }}</span>
            </div>
          </div>

          <div class="col-2">
            <div class="form-group">
              <label class="form-label required">Precio Venta</label>
              <input
                v-model.number="form.precioVenta"
                type="number"
                step="0.01"
                class="form-control"
                :class="{ 'is-invalid': formErrors.precioVenta }"
                placeholder="Ej: 650.00"
                required
              />
              <span v-if="formErrors.precioVenta" class="form-error">{{ formErrors.precioVenta }}</span>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-2">
            <div class="form-group">
              <label class="form-label required">Stock Actual</label>
              <input
                v-model.number="form.stockActual"
                type="number"
                class="form-control"
                :class="{ 'is-invalid': formErrors.stockActual }"
                placeholder="Ej: 50"
                required
              />
              <span v-if="formErrors.stockActual" class="form-error">{{ formErrors.stockActual }}</span>
            </div>
          </div>

          <div class="col-2">
            <div class="form-group">
              <label class="form-label">Stock Mínimo</label>
              <input
                v-model.number="form.stockMinimo"
                type="number"
                class="form-control"
                :class="{ 'is-invalid': formErrors.stockMinimo }"
                placeholder="Ej: 10"
              />
              <span v-if="formErrors.stockMinimo" class="form-error">{{ formErrors.stockMinimo }}</span>
            </div>
          </div>
        </div>

        <div v-if="editMode" class="form-group">
          <label class="form-label">Estado</label>
          <select v-model="form.activo" class="form-select">
            <option :value="true">Activo</option>
            <option :value="false">Inactivo</option>
          </select>
        </div>

        <div class="modal-footer">
          <button type="button" @click="closeModal" class="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary" :disabled="saving">
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductoStore } from '@/stores/productoStore'
import { useAuthStore } from '@/stores/authStore'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import SearchBox from '@/components/SearchBox.vue'
import Modal from '@/components/Modal.vue'
import { formatCurrency } from '@/utils/helpers'
import { schemas } from '@/utils/validation'
import Swal from 'sweetalert2'

const productoStore = useProductoStore()
const authStore = useAuthStore()

const isAdmin = computed(() => authStore.isAdmin)
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const editMode = ref(false)
const searchTerm = ref('')
const filterStockBajo = ref(false)
const filterSinStock = ref(false)
const currentPage = ref(1)
const itemsPerPage = 10

const form = ref({
  nombre: '',
  codigoBarra: '',
  descripcion: '',
  precioCosto: 0,
  precioVenta: 0,
  stockActual: 0,
  stockMinimo: 10,
  activo: true
})

const formErrors = ref({})

const filteredProductos = computed(() => {
  let productos = productoStore.productos
  
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    productos = productos.filter(p => 
      p.nombre?.toLowerCase().includes(term) ||
      p.codigoBarra?.includes(term)
    )
  }
  
  if (filterStockBajo.value) {
    productos = productos.filter(p => p.stockActual <= p.stockMinimo && p.stockActual > 0)
  }
  
  if (filterSinStock.value) {
    productos = productos.filter(p => p.stockActual === 0)
  }
  
  return productos
})

const totalPages = computed(() => 
  Math.ceil(filteredProductos.value.length / itemsPerPage)
)

const paginatedProductos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredProductos.value.slice(start, end)
})

const getStockClass = (producto) => {
  if (producto.stockActual === 0) return 'badge badge-danger'
  if (producto.stockActual <= producto.stockMinimo) return 'badge badge-warning'
  return 'badge badge-success'
}

const openCreateModal = () => {
  editMode.value = false
  form.value = {
    nombre: '',
    codigoBarra: '',
    descripcion: '',
    precioCosto: 0,
    precioVenta: 0,
    stockActual: 0,
    stockMinimo: 10,
    activo: true
  }
  formErrors.value = {}
  showModal.value = true
}

const openEditModal = (producto) => {
  editMode.value = true
  form.value = { ...producto }
  formErrors.value = {}
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formErrors.value = {}
}

const validateForm = async () => {
  try {
    await schemas.producto.validate(form.value, { abortEarly: false })
    formErrors.value = {}
    return true
  } catch (err) {
    formErrors.value = {}
    err.inner.forEach(error => {
      formErrors.value[error.path] = error.message
    })
    return false
  }
}

const saveProducto = async () => {
  if (!await validateForm()) {
    return
  }

  // Additional validation
  if (form.value.precioVenta <= form.value.precioCosto) {
    Swal.fire({
      icon: 'warning',
      title: 'Advertencia',
      text: 'El precio de venta debe ser mayor al precio de costo'
    })
    return
  }

  saving.value = true
  try {
    if (editMode.value) {
      await productoStore.updateProducto(form.value.id, form.value)
      await Swal.fire({
        icon: 'success',
        title: 'Producto actualizado',
        text: 'El producto se actualizó correctamente',
        timer: 2000
      })
    } else {
      await productoStore.createProducto(form.value)
      await Swal.fire({
        icon: 'success',
        title: 'Producto creado',
        text: 'El producto se creó correctamente',
        timer: 2000
      })
    }
    closeModal()
  } catch (error) {
    const message = error.response?.data?.message || 'Error al guardar el producto'
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message
    })
  } finally {
    saving.value = false
  }
}

const deleteProducto = async (producto) => {
  const result = await Swal.fire({
    title: '¿Eliminar producto?',
    text: `¿Estás seguro de eliminar ${producto.nombre}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#180A01',
    cancelButtonColor: '#95a5a6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  })

  if (result.isConfirmed) {
    try {
      await productoStore.deleteProducto(producto.id)
      await Swal.fire({
        icon: 'success',
        title: 'Producto eliminado',
        text: 'El producto se eliminó correctamente',
        timer: 2000
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el producto'
      })
    }
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await productoStore.fetchProductos()
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudieron cargar los productos'
    })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.productos-page {
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

.filters {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.filters label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.action-buttons {
  display: flex;
  gap: 5px;
}

.low-stock {
  background-color: #fff3cd;
}

.text-right {
  text-align: right !important;
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

  .filters {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
