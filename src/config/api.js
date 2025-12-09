
// Cambiar esta variable para seleccionar la base de datos
const DATABASE = 'postgresql' // Opciones: 'postgresql' o 'sqlite'

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
  VENTAS_BY_NUMERO: (numeroFactura) => `/ventas/numero/${numeroFactura}`,
  VENTAS_PDF: (id) => `/ventas/${id}/pdf`,
  VENTAS_PDF_BY_NUMERO: (numeroFactura) => `/ventas/numero/${numeroFactura}/pdf`,
  
  // Usuarios
  USUARIOS: '/usuarios',
  USUARIOS_BY_ID: (id) => `/usuarios/${id}`,
  USUARIOS_DESBLOQUEAR: (id) => `/usuarios/${id}/desbloquear`,
  
  // Roles
  ROLES: '/roles',
  
  // Logs (Auditoría)
  LOGS_INTENTOS_LOGIN: '/logs/intentos-login',
  LOGS_INTENTOS_LOGIN_STATS: '/logs/intentos-login/estadisticas',
  LOGS_INTENTOS_LOGIN_PDF: '/logs/intentos-login/pdf',
  LOGS_ERRORES: '/logs/errores',
  LOGS_ERRORES_STATS: '/logs/errores/estadisticas',
  LOGS_ERRORES_PDF: '/logs/errores/pdf',
  LOGS_ERROR_REVISAR: (id) => `/logs/errores/${id}/revisar`,
  
  // Error Logs (Deprecated - usar LOGS_ERRORES)
  ERROR_LOGS: '/errorlogs',
  
  // Eliminaciones de Usuarios
  ELIMINACIONES_USUARIOS: '/eliminacionesusuarios',
  
  // Eliminaciones de Productos
  ELIMINACIONES_PRODUCTOS: '/eliminacionesproductos'
}
