import * as yup from 'yup'

// Validation Messages in Spanish
yup.setLocale({
  mixed: {
    required: 'Este campo es requerido',
    notType: 'Formato inválido'
  },
  string: {
    email: 'Debe ser un correo electrónico válido',
    min: 'Debe tener al menos ${min} caracteres',
    max: 'Debe tener máximo ${max} caracteres'
  },
  number: {
    min: 'Debe ser mayor o igual a ${min}',
    max: 'Debe ser menor o igual a ${max}',
    positive: 'Debe ser un número positivo'
  }
})

// Custom validation rules
export const validationRules = {
  // Email validation
  email: yup.string()
    .email()
    .required('El correo es requerido'),
  
  // Password validation (4-10 chars, uppercase, lowercase, number, special char)
  password: yup.string()
    .required('La contraseña es requerida')
    .min(4, 'La contraseña debe tener entre 4 y 10 caracteres')
    .max(10, 'La contraseña debe tener entre 4 y 10 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      'Debe contener mayúscula, minúscula, número y símbolo (@$!%*?&)'
    ),
  
  // Cedula validation (6-10 digits)
  cedula: yup.string()
    .required('La cédula es requerida')
    .matches(/^\d{6,10}$/, 'La cédula debe contener entre 6 y 10 dígitos'),
  
  // Documento validation (6-20 digits)
  documento: yup.string()
    .required('El documento es requerido')
    .matches(/^\d{6,20}$/, 'El documento debe contener entre 6 y 20 dígitos'),
  
  // Name validation (only letters and spaces)
  name: yup.string()
    .required('El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras'),
  
  // Phone validation
  phone: yup.string()
    .matches(/^[0-9]{7,15}$/, 'El teléfono debe contener entre 7 y 15 dígitos'),
  
  // Positive number
  positiveNumber: yup.number()
    .required('Este campo es requerido')
    .positive('Debe ser un número positivo')
    .typeError('Debe ser un número válido'),
  
  // Stock validation
  stock: yup.number()
    .required('El stock es requerido')
    .integer('Debe ser un número entero')
    .min(0, 'El stock no puede ser negativo')
    .typeError('Debe ser un número válido'),
  
  // Price validation
  price: yup.number()
    .required('El precio es requerido')
    .positive('El precio debe ser mayor a 0')
    .typeError('Debe ser un número válido')
}

// Form Schemas
export const schemas = {
  // Login Schema
  login: yup.object({
    correo: validationRules.email,
    contrasena: yup.string().required('La contraseña es requerida')
  }),
  
  // Cliente Schema
  cliente: yup.object({
    nombre: validationRules.name,
    documento: validationRules.documento,
    email: validationRules.email.notRequired(),
    telefono: validationRules.phone.notRequired(),
    direccion: yup.string().max(300, 'La dirección no puede exceder 300 caracteres').notRequired()
  }),
  
  // Producto Schema
  producto: yup.object({
    nombre: yup.string()
      .required('El nombre es requerido')
      .min(3, 'Debe tener al menos 3 caracteres')
      .max(200, 'No puede exceder 200 caracteres'),
    codigoBarra: yup.string()
      .required('El código de barra es requerido')
      .min(3, 'Debe tener al menos 3 caracteres')
      .max(50, 'No puede exceder 50 caracteres'),
    descripcion: yup.string()
      .max(500, 'No puede exceder 500 caracteres').notRequired(),
    precioCosto: validationRules.price,
    precioVenta: validationRules.price,
    stockActual: validationRules.stock,
    stockMinimo: yup.number()
      .min(0, 'No puede ser negativo')
      .typeError('Debe ser un número válido')
      .notRequired()
  }),
  
  // Usuario Schema
  usuario: yup.object({
    cedula: validationRules.cedula,
    correo: validationRules.email,
    nombreCompleto: validationRules.name,
    contrasena: validationRules.password,
    rolId: yup.string().required('El rol es requerido')
  })
}

export default validationRules
