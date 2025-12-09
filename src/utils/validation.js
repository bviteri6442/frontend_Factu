import * as yup from 'yup'

// Mensajes de validación personalizados en español
yup.setLocale({
  mixed: {
    required: '⚠️ Este campo es obligatorio',
    notType: '❌ El formato ingresado no es válido',
    oneOf: '❌ El valor debe coincidir con uno de los valores permitidos'
  },
  string: {
    email: '📧 Por favor ingresa un correo electrónico válido',
    min: '📏 Debe contener al menos ${min} caracteres',
    max: '📏 No puede exceder ${max} caracteres',
    length: '📏 Debe tener exactamente ${length} caracteres',
    matches: '❌ El formato ingresado no es válido',
    url: '🔗 Debe ser una URL válida'
  },
  number: {
    min: '🔢 El valor mínimo permitido es ${min}',
    max: '🔢 El valor máximo permitido es ${max}',
    positive: '➕ Debe ser un número positivo mayor a 0',
    negative: '➖ Debe ser un número negativo',
    integer: '🔢 Debe ser un número entero (sin decimales)'
  },
  date: {
    min: '📅 La fecha debe ser posterior a ${min}',
    max: '📅 La fecha debe ser anterior a ${max}'
  }
})

// Reglas de validación personalizadas
export const validationRules = {
  // Validación de email
  email: yup.string()
    .email('📧 Ingresa un correo válido (ejemplo: usuario@dominio.com)')
    .required('📧 El correo electrónico es obligatorio'),
  
  // Validación de contraseña (4-10 caracteres, mayúscula, minúscula, número, símbolo)
  password: yup.string()
    .required('🔒 La contraseña es obligatoria')
    .min(4, '🔒 La contraseña debe tener entre 4 y 10 caracteres')
    .max(10, '🔒 La contraseña debe tener entre 4 y 10 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      '🔒 La contraseña debe incluir: mayúscula, minúscula, número y símbolo (@$!%*?&)'
    ),
  
  // Validación de cédula ecuatoriana (exactamente 10 dígitos)
  cedula: yup.string()
    .required('🪪 La cédula es obligatoria')
    .matches(/^\d{10}$/, '🪪 La cédula debe contener exactamente 10 dígitos numéricos'),
  
  // Validación de documento (6-20 dígitos)
  documento: yup.string()
    .required('📄 El número de documento es obligatorio')
    .matches(/^\d{6,20}$/, '📄 El documento debe contener entre 6 y 20 dígitos'),
  
  // Validación de nombre (solo letras y espacios)
  name: yup.string()
    .required('👤 El nombre es obligatorio')
    .min(3, '👤 El nombre debe tener al menos 3 caracteres')
    .max(200, '👤 El nombre no puede exceder 200 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, '👤 El nombre solo puede contener letras y espacios'),
  
  // Validación de teléfono
  phone: yup.string()
    .matches(/^[0-9]{7,15}$/, '📱 El teléfono debe contener entre 7 y 15 dígitos numéricos'),
  
  // Número positivo
  positiveNumber: yup.number()
    .required('🔢 Este campo numérico es obligatorio')
    .positive('➕ El valor debe ser un número positivo mayor a 0')
    .typeError('🔢 Ingresa un número válido'),
  
  // Validación de stock
  stock: yup.number()
    .required('📦 El stock es obligatorio')
    .integer('📦 El stock debe ser un número entero (sin decimales)')
    .min(0, '📦 El stock no puede ser negativo')
    .typeError('📦 Ingresa un número válido para el stock'),
  
  // Validación de precio
  price: yup.number()
    .required('💰 El precio es obligatorio')
    .positive('💰 El precio debe ser mayor a 0')
    .typeError('💰 Ingresa un precio válido (número con o sin decimales)')
}

// Esquemas de formularios
export const schemas = {
  // Esquema de Login
  login: yup.object({
    correo: validationRules.email,
    contrasena: yup.string().required('🔒 La contraseña es obligatoria para iniciar sesión')
  }),
  
  // Esquema de Cliente
  cliente: yup.object({
    nombre: validationRules.name,
    documento: validationRules.documento,
    email: validationRules.email.notRequired(),
    telefono: validationRules.phone.notRequired(),
    direccion: yup.string()
      .max(300, '📍 La dirección no puede exceder 300 caracteres')
      .notRequired()
  }),
  
  // Esquema de Producto
  producto: yup.object({
    nombre: yup.string()
      .required('📦 El nombre del producto es obligatorio')
      .min(3, '📦 El nombre debe tener al menos 3 caracteres')
      .max(200, '📦 El nombre no puede exceder 200 caracteres'),
    codigoBarra: yup.string()
      .required('🏷️ El código de barra es obligatorio')
      .min(3, '🏷️ El código debe tener al menos 3 caracteres')
      .max(50, '🏷️ El código no puede exceder 50 caracteres'),
    descripcion: yup.string()
      .max(500, '📝 La descripción no puede exceder 500 caracteres')
      .notRequired(),
    precioCosto: yup.number()
      .required('💵 El precio de costo es obligatorio')
      .positive('💵 El precio de costo debe ser mayor a 0')
      .typeError('💵 Ingresa un precio de costo válido'),
    precioVenta: yup.number()
      .required('💰 El precio de venta es obligatorio')
      .positive('💰 El precio de venta debe ser mayor a 0')
      .typeError('💰 Ingresa un precio de venta válido'),
    stockActual: validationRules.stock,
    stockMinimo: yup.number()
      .min(0, '📦 El stock mínimo no puede ser negativo')
      .integer('📦 El stock mínimo debe ser un número entero')
      .typeError('📦 Ingresa un stock mínimo válido')
      .notRequired()
  }),
  
  // Esquema de Usuario
  usuario: yup.object({
    cedula: validationRules.cedula,
    correo: validationRules.email,
    nombreCompleto: validationRules.name,
    contrasena: validationRules.password,
    rolId: yup.string().required('👥 El rol de usuario es obligatorio')
  })
}

export default validationRules
