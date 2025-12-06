
// Cambiar esta variable para seleccionar la base de datos
const DATABASE = 'sqlite' // Opciones: 'postgresql' o 'sqlite'

const BACKENDS = {
  postgresql: 'https://localhost:56397/api',
  sqlite: 'https://localhost:56500/api'
}

export const API_BASE_URL = BACKENDS[DATABASE]

// Para mostrar en la UI qué base de datos está en uso
export const CURRENT_DATABASE = DATABASE.toUpperCase()

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTRO: '/auth/registro',
  
  // Clientes
  CLIENTES: '/clientes',
  CLIENTES_BY_ID: (id) => `/clientes/${id}`,
  CLIENTES_BUSCAR: '/clientes/buscar',
  
  // Productos
  PRODUCTOS: '/productos',
  PRODUCTOS_BY_ID: (id) => `/productos/${id}`,
  PRODUCTOS_DISPONIBLES: '/productos/disponibles',
  
  // Ventas
  VENTAS: '/ventas',
  VENTAS_BY_ID: (id) => `/ventas/${id}`,
  VENTAS_PDF: (id) => `/ventas/${id}/pdf`,
  
  // Usuarios
  USUARIOS: '/usuarios',
  USUARIOS_BY_ID: (id) => `/usuarios/${id}`,
  USUARIOS_DESBLOQUEAR: (id) => `/usuarios/${id}/desbloquear`,
  
  // Roles
  ROLES: '/roles',
  
  // Error Logs
  ERROR_LOGS: '/errorlogs',
  
  // Eliminaciones de Usuarios
  ELIMINACIONES_USUARIOS: '/eliminacionesusuarios'
}
