<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>Sistema de Gestión</h1>
        <p>Ingresa tus credenciales para acceder</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="correo" class="form-label required">Correo Electrónico</label>
          <input
            id="correo"
            v-model="form.correo"
            type="email"
            class="form-control"
            :class="{ 'is-invalid': errors.correo }"
            placeholder="correo@ejemplo.com"
            required
          />
          <span v-if="errors.correo" class="form-error">{{ errors.correo }}</span>
        </div>

        <div class="form-group">
          <label for="contrasena" class="form-label required">Contraseña</label>
          <div class="password-input">
            <input
              id="contrasena"
              v-model="form.contrasena"
              :type="showPassword ? 'text' : 'password'"
              class="form-control"
              :class="{ 'is-invalid': errors.contrasena }"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="password-toggle"
            >
              {{ showPassword ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
          <span v-if="errors.contrasena" class="form-error">{{ errors.contrasena }}</span>
        </div>

        <button
          type="submit"
          class="btn btn-primary btn-block"
          :disabled="loading"
        >
          {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </form>

      <div class="login-footer">
        <small>© 2025 Sistema de Gestión Comercial</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Swal from 'sweetalert2'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  correo: '',
  contrasena: ''
})

const errors = ref({})
const errorMessage = ref('')
const loading = ref(false)
const showPassword = ref(false)

const validateForm = () => {
  errors.value = {}
  let isValid = true

  if (!form.value.correo) {
    errors.value.correo = 'El correo es requerido'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.value.correo)) {
    errors.value.correo = 'El correo no es válido'
    isValid = false
  }

  if (!form.value.contrasena) {
    errors.value.contrasena = 'La contraseña es requerida'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  errorMessage.value = ''
  
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    const result = await authStore.login(form.value)

    if (result.success) {
      await Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Inicio de sesión exitoso',
        timer: 1500,
        showConfirmButton: false
      })
      router.push('/dashboard')
    } else {
      errorMessage.value = result.message || 'Error al iniciar sesión'
      
      if (errorMessage.value.toLowerCase().includes('bloqueado')) {
        await Swal.fire({
          icon: 'error',
          title: 'Cuenta Bloqueada',
          text: errorMessage.value,
          confirmButtonColor: '#180A01'
        })
      }
    }
  } catch (error) {
    errorMessage.value = 'Error al conectar con el servidor'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1E293B 0%, #475569 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 450px;
  padding: 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 35px;
}

.login-header h1 {
  color: #1E293B;
  margin-bottom: 10px;
  font-size: 28px;
}

.login-header p {
  color: #64748B;
  font-size: 14px;
}

.login-form {
  margin-bottom: 25px;
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 5px;
  color: #64748B;
}

.btn-block {
  width: 100%;
  margin-top: 10px;
  padding: 14px;
  font-size: 16px;
}

.error-message {
  margin-top: 15px;
  padding: 12px;
  background-color: #FEE2E2;
  color: #DC2626;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
}

.login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #E2E8F0;
  color: #94A3B8;
}

.login-footer small {
  font-size: 12px;
}

@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
  }

  .login-header h1 {
    font-size: 24px;
  }
}
</style>
