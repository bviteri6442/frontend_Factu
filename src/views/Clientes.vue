<template>
  <div class="clientes-page">
    <div class="page-header">
      <h1 class="page-title">Clientes</h1>
      <button 
        v-if="isAdmin"
        @click="openCreateModal" 
        class="btn btn-primary"
      >
        Nuevo Cliente
      </button>
    </div>

    <LoadingSpinner :show="loading" message="Cargando clientes..." />

    <div v-if="!loading" class="card">
      <div class="card-header">
        <SearchBox 
          v-model="searchTerm" 
          placeholder="Buscar por nombre, documento o correo..."
        />
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Fecha Creación</th>
              <th v-if="isAdmin">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredClientes.length === 0">
              <td :colspan="isAdmin ? 7 : 6" class="text-center">
                No se encontraron clientes
              </td>
            </tr>
            <tr v-for="cliente in paginatedClientes" :key="cliente.id">
              <td>{{ cliente.nombre }}</td>
              <td>{{ cliente.documento }}</td>
              <td>{{ cliente.email || 'N/A' }}</td>
              <td>{{ cliente.telefono || 'N/A' }}</td>
              <td>
                <span :class="['badge', cliente.activo ? 'badge-success' : 'badge-danger']">
                  {{ cliente.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>{{ formatDate(cliente.fechaCreacion) }}</td>
              <td v-if="isAdmin">
                <div class="action-buttons">
                  <button 
                    @click="openEditModal(cliente)" 
                    class="btn btn-sm btn-warning"
                    title="Editar"
                  >
                    Editar
                  </button>
                  <button 
                    @click="deleteCliente(cliente)" 
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
      :title="editMode ? 'Editar Cliente' : 'Nuevo Cliente'"
      @close="closeModal"
    >
      <form @submit.prevent="saveCliente">
        <div class="form-group">
          <label class="form-label required">Nombre Completo</label>
          <input
            v-model="form.nombre"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': formErrors.nombre }"
            placeholder="Ej: Juan Carlos Pérez González"
            @keypress="onlyLetters"
            required
          />
          <span v-if="formErrors.nombre" class="form-error">{{ formErrors.nombre }}</span>
        </div>

        <div class="form-group">
          <label class="form-label required">Documento (Cédula/RUC)</label>
          <input
            v-model="form.documento"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': formErrors.documento }"
            placeholder="Ej: 1234567890 (Cédula 10 dígitos) o 1234567890001 (RUC 13 dígitos)"
            @keypress="onlyNumbers"
            :disabled="editMode"
            maxlength="20"
            required
          />
          <span v-if="formErrors.documento" class="form-error">{{ formErrors.documento }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="form-control"
            :class="{ 'is-invalid': formErrors.email }"
            placeholder="Ej: cliente@ejemplo.com"
          />
          <span v-if="formErrors.email" class="form-error">{{ formErrors.email }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">Teléfono</label>
          <input
            v-model="form.telefono"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': formErrors.telefono }"
            placeholder="Ej: 0987654321 (10 dígitos)"
            @keypress="onlyNumbers"
            maxlength="15"
          />
          <span v-if="formErrors.telefono" class="form-error">{{ formErrors.telefono }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">Dirección</label>
          <textarea
            v-model="form.direccion"
            class="form-control"
            rows="3"
            maxlength="300"
            placeholder="Ej: Av. Principal #123 y Calle Secundaria, Edificio Torre Azul, Oficina 201"
          ></textarea>
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
import { useClienteStore } from '@/stores/clienteStore'
import { useAuthStore } from '@/stores/authStore'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import SearchBox from '@/components/SearchBox.vue'
import Modal from '@/components/Modal.vue'
import { formatDate } from '@/utils/helpers'
import { onlyLetters, onlyNumbers } from '@/utils/helpers'
import { schemas } from '@/utils/validation'
import Swal from 'sweetalert2'

const clienteStore = useClienteStore()
const authStore = useAuthStore()

const isAdmin = computed(() => authStore.isAdmin)
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const editMode = ref(false)
const searchTerm = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const form = ref({
  nombre: '',
  documento: '',
  email: '',
  telefono: '',
  direccion: '',
  activo: true
})

const formErrors = ref({})

const filteredClientes = computed(() => {
  if (!searchTerm.value) {
    return clienteStore.clientes
  }
  
  const term = searchTerm.value.toLowerCase()
  return clienteStore.clientes.filter(c => 
    c.nombre?.toLowerCase().includes(term) ||
    c.documento?.includes(term) ||
    c.email?.toLowerCase().includes(term)
  )
})

const totalPages = computed(() => 
  Math.ceil(filteredClientes.value.length / itemsPerPage)
)

const paginatedClientes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredClientes.value.slice(start, end)
})

const openCreateModal = () => {
  editMode.value = false
  form.value = {
    nombre: '',
    documento: '',
    email: '',
    telefono: '',
    direccion: '',
    activo: true
  }
  formErrors.value = {}
  showModal.value = true
}

const openEditModal = (cliente) => {
  editMode.value = true
  form.value = { ...cliente }
  formErrors.value = {}
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formErrors.value = {}
}

const validateForm = async () => {
  try {
    await schemas.cliente.validate(form.value, { abortEarly: false })
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

const saveCliente = async () => {
  if (!await validateForm()) {
    return
  }

  saving.value = true
  try {
    if (editMode.value) {
      await clienteStore.updateCliente(form.value.id, form.value)
      await Swal.fire({
        icon: 'success',
        title: 'Cliente actualizado',
        text: 'El cliente se actualizó correctamente',
        timer: 2000
      })
    } else {
      await clienteStore.createCliente(form.value)
      await Swal.fire({
        icon: 'success',
        title: 'Cliente creado',
        text: 'El cliente se creó correctamente',
        timer: 2000
      })
    }
    closeModal()
  } catch (error) {
    const message = error.response?.data?.message || 'Error al guardar el cliente'
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message
    })
  } finally {
    saving.value = false
  }
}

const deleteCliente = async (cliente) => {
  const result = await Swal.fire({
    title: '¿Eliminar cliente?',
    text: `¿Estás seguro de eliminar a ${cliente.nombre}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#180A01',
    cancelButtonColor: '#95a5a6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  })

  if (result.isConfirmed) {
    try {
      await clienteStore.deleteCliente(cliente.id)
      await Swal.fire({
        icon: 'success',
        title: 'Cliente eliminado',
        text: 'El cliente se eliminó correctamente',
        timer: 2000
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el cliente'
      })
    }
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await clienteStore.fetchClientes()
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudieron cargar los clientes'
    })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.clientes-page {
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

.action-buttons {
  display: flex;
  gap: 5px;
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
