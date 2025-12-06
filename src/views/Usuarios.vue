<template>
  <div class="usuarios-page">
    <div class="page-header">
      <h1 class="page-title">Usuarios</h1>
      <button @click="openCreateModal" class="btn btn-primary">
        Nuevo Usuario
      </button>
    </div>

    <LoadingSpinner :show="loading" message="Cargando usuarios..." />

    <div v-if="!loading" class="card">
      <div class="card-header">
        <SearchBox 
          v-model="searchTerm" 
          placeholder="Buscar por nombre, cédula o correo..."
        />
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Cédula</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Último Login</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredUsuarios.length === 0">
              <td colspan="7" class="text-center">
                No se encontraron usuarios
              </td>
            </tr>
            <tr v-for="usuario in paginatedUsuarios" :key="usuario.id">
              <td>{{ usuario.cedula }}</td>
              <td>{{ usuario.nombreCompleto }}</td>
              <td>{{ usuario.correo }}</td>
              <td>
                <span :class="['badge', usuario.rolNombre === 'Administrador' ? 'badge-warning' : 'badge-success']">
                  {{ usuario.rolNombre }}
                </span>
              </td>
              <td>
                <span :class="['badge', usuario.activo ? 'badge-success' : 'badge-danger']">
                  {{ usuario.activo ? 'Activo' : 'Bloqueado' }}
                </span>
              </td>
              <td>{{ usuario.fechaUltimoLogin ? formatDateTime(usuario.fechaUltimoLogin) : 'Nunca' }}</td>
              <td>
                <div class="action-buttons">
                  <button 
                    @click="openEditModal(usuario)" 
                    class="btn btn-sm btn-warning"
                    title="Editar"
                  >
                    Editar
                  </button>
                  <button 
                    v-if="!usuario.activo"
                    @click="desbloquearUsuario(usuario)" 
                    class="btn btn-sm btn-success"
                    title="Desbloquear"
                  >
                    Desbloquear
                  </button>
                  <button 
                    @click="deleteUsuario(usuario)" 
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
      :title="editMode ? 'Editar Usuario' : 'Nuevo Usuario'"
      @close="closeModal"
    >
      <form @submit.prevent="saveUsuario">
        <div class="form-group">
          <label class="form-label required">Cédula</label>
          <input
            v-model="form.cedula"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': formErrors.cedula }"
            @keypress="onlyNumbers"
            :disabled="editMode"
            maxlength="10"
            required
          />
          <span v-if="formErrors.cedula" class="form-error">{{ formErrors.cedula }}</span>
        </div>

        <div class="form-group">
          <label class="form-label required">Nombre Completo</label>
          <input
            v-model="form.nombreCompleto"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': formErrors.nombreCompleto }"
            @keypress="onlyLetters"
            required
          />
          <span v-if="formErrors.nombreCompleto" class="form-error">{{ formErrors.nombreCompleto }}</span>
        </div>

        <div class="form-group">
          <label class="form-label required">Correo Electrónico</label>
          <input
            v-model="form.correo"
            type="email"
            class="form-control"
            :class="{ 'is-invalid': formErrors.correo }"
            required
          />
          <span v-if="formErrors.correo" class="form-error">{{ formErrors.correo }}</span>
        </div>

        <div class="form-group" v-if="!editMode">
          <label class="form-label required">Contraseña</label>
          <input
            v-model="form.contrasena"
            type="password"
            class="form-control"
            :class="{ 'is-invalid': formErrors.contrasena }"
            required
          />
          <small class="form-text">
            4-10 caracteres con mayúscula, minúscula, número y símbolo (@$!%*?&)
          </small>
          <span v-if="formErrors.contrasena" class="form-error">{{ formErrors.contrasena }}</span>
        </div>

        <div class="form-group">
          <label class="form-label required">Rol</label>
          <select 
            v-model="form.rolId" 
            class="form-select"
            :class="{ 'is-invalid': formErrors.rolId }"
            required
          >
            <option value="">Seleccione un rol...</option>
            <option v-for="rol in roles" :key="rol.id" :value="rol.id">
              {{ rol.nombre }}
            </option>
          </select>
          <span v-if="formErrors.rolId" class="form-error">{{ formErrors.rolId }}</span>
        </div>

        <div v-if="editMode" class="form-group">
          <label class="form-label">Estado</label>
          <select v-model="form.activo" class="form-select">
            <option :value="true">Activo</option>
            <option :value="false">Bloqueado</option>
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
import { usuarioService, rolService } from '@/services/usuarioService'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import SearchBox from '@/components/SearchBox.vue'
import Modal from '@/components/Modal.vue'
import { formatDateTime, onlyLetters, onlyNumbers } from '@/utils/helpers'
import { schemas } from '@/utils/validation'
import Swal from 'sweetalert2'

const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const editMode = ref(false)
const searchTerm = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const usuarios = ref([])
const roles = ref([])

const form = ref({
  cedula: '',
  nombreCompleto: '',
  correo: '',
  contrasena: '',
  rolId: '',
  activo: true
})

const formErrors = ref({})

const filteredUsuarios = computed(() => {
  if (!searchTerm.value) {
    return usuarios.value
  }
  
  const term = searchTerm.value.toLowerCase()
  return usuarios.value.filter(u => 
    u.nombreCompleto?.toLowerCase().includes(term) ||
    u.cedula?.includes(term) ||
    u.correo?.toLowerCase().includes(term)
  )
})

const totalPages = computed(() => 
  Math.ceil(filteredUsuarios.value.length / itemsPerPage)
)

const paginatedUsuarios = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredUsuarios.value.slice(start, end)
})

const fetchUsuarios = async () => {
  loading.value = true
  try {
    usuarios.value = await usuarioService.getAll()
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudieron cargar los usuarios'
    })
  } finally {
    loading.value = false
  }
}

const fetchRoles = async () => {
  try {
    roles.value = await rolService.getAll()
  } catch (error) {
    console.error('Error loading roles:', error)
  }
}

const openCreateModal = () => {
  editMode.value = false
  form.value = {
    cedula: '',
    nombreCompleto: '',
    correo: '',
    contrasena: '',
    rolId: '',
    activo: true
  }
  formErrors.value = {}
  showModal.value = true
}

const openEditModal = (usuario) => {
  editMode.value = true
  form.value = {
    id: usuario.id,
    cedula: usuario.cedula,
    nombreCompleto: usuario.nombreCompleto,
    correo: usuario.correo,
    rolId: usuario.rolId,
    activo: usuario.activo
  }
  formErrors.value = {}
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formErrors.value = {}
}

const validateForm = async () => {
  try {
    if (editMode.value) {
      // Skip password validation for edit
      const { contrasena, ...formWithoutPassword } = form.value
      await schemas.usuario.omit(['contrasena']).validate(formWithoutPassword, { abortEarly: false })
    } else {
      await schemas.usuario.validate(form.value, { abortEarly: false })
    }
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

const saveUsuario = async () => {
  if (!await validateForm()) {
    return
  }

  saving.value = true
  try {
    if (editMode.value) {
      await usuarioService.update(form.value.id, form.value)
      await Swal.fire({
        icon: 'success',
        title: 'Usuario actualizado',
        text: 'El usuario se actualizó correctamente',
        timer: 2000
      })
    } else {
      await usuarioService.create(form.value)
      await Swal.fire({
        icon: 'success',
        title: 'Usuario creado',
        text: 'El usuario se creó correctamente',
        timer: 2000
      })
    }
    closeModal()
    await fetchUsuarios()
  } catch (error) {
    const message = error.response?.data?.message || 'Error al guardar el usuario'
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message
    })
  } finally {
    saving.value = false
  }
}

const deleteUsuario = async (usuario) => {
  const result = await Swal.fire({
    title: '¿Eliminar usuario?',
    text: `¿Estás seguro de eliminar a ${usuario.nombreCompleto}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#180A01',
    cancelButtonColor: '#95a5a6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  })

  if (result.isConfirmed) {
    try {
      await usuarioService.delete(usuario.id)
      await Swal.fire({
        icon: 'success',
        title: 'Usuario eliminado',
        text: 'El usuario se eliminó correctamente',
        timer: 2000
      })
      await fetchUsuarios()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el usuario'
      })
    }
  }
}

const desbloquearUsuario = async (usuario) => {
  const result = await Swal.fire({
    title: '¿Desbloquear usuario?',
    text: `¿Deseas desbloquear a ${usuario.nombreCompleto}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#FF7713',
    cancelButtonColor: '#95a5a6',
    confirmButtonText: 'Sí, desbloquear',
    cancelButtonText: 'Cancelar'
  })

  if (result.isConfirmed) {
    try {
      await usuarioService.desbloquear(usuario.id)
      await Swal.fire({
        icon: 'success',
        title: 'Usuario desbloqueado',
        text: 'El usuario se desbloqueó correctamente',
        timer: 2000
      })
      await fetchUsuarios()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo desbloquear el usuario'
      })
    }
  }
}

onMounted(async () => {
  await Promise.all([
    fetchUsuarios(),
    fetchRoles()
  ])
})
</script>

<style scoped>
.usuarios-page {
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

.action-buttons {
  display: flex;
  gap: 5px;
}

.form-text {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #6c757d;
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
