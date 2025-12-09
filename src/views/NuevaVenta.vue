<template>
  <div class="nueva-venta-page">
    <div class="page-header">
      <h1 class="page-title">Nueva Factura</h1>
      <router-link to="/ventas" class="btn btn-secondary">
        Volver a Facturas
      </router-link>
    </div>

    <!-- Cliente Selection Card -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Cliente</h3>
        <button @click="showClienteModal = true" class="btn btn-primary">
          Agregar Cliente
        </button>
      </div>
      <div class="card-body">
        <div v-if="!selectedCliente" class="empty-client-state">
          <span class="empty-icon">👤</span>
          <p>No se ha seleccionado cliente</p>
          <small>Click en "Agregar Cliente" o se usará Consumidor Final por defecto</small>
        </div>
        <div v-else class="selected-client-card">
          <div class="client-info">
            <div class="client-header">
              <h4>{{ selectedCliente.nombre }}</h4>
              <button @click="clearCliente" class="btn btn-sm btn-danger" title="Quitar cliente">
                ✕
              </button>
            </div>
            <div class="client-details">
              <span><strong>Documento:</strong> {{ selectedCliente.documento }}</span>
              <span v-if="selectedCliente.telefono"><strong>Teléfono:</strong> {{ selectedCliente.telefono }}</span>
              <span v-if="selectedCliente.email"><strong>Email:</strong> {{ selectedCliente.email }}</span>
            </div>
            <div v-if="selectedCliente.direccion" class="client-address">
              <strong>Dirección:</strong> {{ selectedCliente.direccion }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Productos Table -->
    <div class="card mt-3">
      <div class="card-header">
        <h3 class="card-title">Productos en la Factura</h3>
        <button @click="showProductoModal = true" class="btn btn-success">
          Agregar Producto
        </button>
      </div>

      <div v-if="detalles.length === 0" class="empty-state">
        <p>No hay productos agregados. Click en "Agregar Producto" para comenzar.</p>
      </div>

      <div v-else>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th class="text-right" style="width: 120px;">Cantidad</th>
                <th class="text-right" style="width: 140px;">Precio Unit.</th>
                <th class="text-right" style="width: 120px;">Descuento (%)</th>
                <th class="text-right" style="width: 140px;">Subtotal</th>
                <th style="width: 100px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(detalle, index) in detalles" :key="index">
                <td>
                  <strong>{{ detalle.productoNombre }}</strong>
                </td>
                <td>
                  <input 
                    v-model.number="detalle.cantidad" 
                    type="number" 
                    class="form-control form-control-sm" 
                    min="1"
                    :max="getMaxStock(detalle.productoId)"
                    @input="validateCantidad(detalle, index)"
                  />
                </td>
                <td class="text-right">{{ formatCurrency(detalle.precioUnitario) }}</td>
                <td>
                  <input 
                    v-model.number="detalle.descuento" 
                    type="number" 
                    class="form-control form-control-sm text-right" 
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </td>
                <td class="text-right"><strong>{{ formatCurrency(calculateDetalleTotal(detalle)) }}</strong></td>
                <td>
                  <button 
                    @click="removeProducto(index)" 
                    class="btn btn-sm btn-danger"
                    title="Eliminar"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Totales -->
        <div class="totals-section">
          <div class="totals-row">
            <span>Subtotal:</span>
            <strong>{{ formatCurrency(subtotal) }}</strong>
          </div>
          <div class="totals-row">
            <span>IVA (12%):</span>
            <strong>{{ formatCurrency(totalIVA) }}</strong>
          </div>
          <div class="totals-row total">
            <span>TOTAL:</span>
            <strong>{{ formatCurrency(total) }}</strong>
          </div>
        </div>

        <!-- Observaciones -->
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">Observaciones (Opcional)</label>
            <textarea
              v-model="observaciones"
              class="form-control"
              rows="3"
              maxlength="500"
              placeholder="Notas adicionales sobre la factura..."
            ></textarea>
          </div>

          <div class="action-buttons">
            <button @click="cancelVenta" class="btn btn-danger btn-lg">
              Cancelar Factura
            </button>
            <button 
              @click="guardarVenta" 
              class="btn btn-primary btn-lg"
              :disabled="saving || detalles.length === 0"
            >
              {{ saving ? 'Guardando...' : 'Guardar Factura' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Producto -->
    <Modal :show="showProductoModal" @close="closeProductoModal" title="Agregar Producto" size="large">
      <ProductoAutocomplete 
        v-model="selectedTempProducto"
        @select="onProductoSelected"
      />

      <div v-if="selectedTempProducto" class="producto-form">
        <h4>{{ selectedTempProducto.nombre }}</h4>
        <div class="form-row">
          <div class="form-group">
            <label>Cantidad</label>
            <input 
              v-model.number="tempCantidad" 
              type="number" 
              class="form-control" 
              min="1"
              :max="selectedTempProducto.stock"
            />
            <small class="form-text">Disponible: {{ selectedTempProducto.stock }}</small>
          </div>
          <div class="form-group">
            <label>Descuento (%)</label>
            <input 
              v-model.number="tempDescuento" 
              type="number" 
              class="form-control" 
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </div>
        <div class="form-summary">
          <p><strong>Precio Unitario:</strong> {{ formatCurrency(selectedTempProducto.precio) }}</p>
          <p><strong>Subtotal:</strong> {{ formatCurrency(calcularSubtotalTemp()) }}</p>
        </div>
        <button @click="agregarProductoAlCarrito" class="btn btn-primary btn-block">
          Agregar al Carrito
        </button>
      </div>
    </Modal>

    <!-- Modal Cliente -->
    <Modal :show="showClienteModal" @close="showClienteModal = false" title="Seleccionar Cliente" size="large">
      <ClienteAutocomplete 
        v-model="selectedCliente"
        @select="onClienteSelected"
      />
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductoStore } from '@/stores/productoStore'
import { ventaService } from '@/services/ventaService'
import { formatCurrency, calculateIVA } from '@/utils/helpers'
import Modal from '@/components/Modal.vue'
import SearchBox from '@/components/SearchBox.vue'
import ClienteAutocomplete from '@/components/ClienteAutocomplete.vue'
import ProductoAutocomplete from '@/components/ProductoAutocomplete.vue'
import Swal from 'sweetalert2'

const router = useRouter()
const productoStore = useProductoStore()

// Cliente selection
const selectedCliente = ref(null)
const showClienteModal = ref(false)

// Producto selection
const showProductoModal = ref(false)
const selectedTempProducto = ref(null)
const tempCantidad = ref(1)
const tempDescuento = ref(0)

// Venta data
const detalles = ref([])
const observaciones = ref('')
const saving = ref(false)

// Computed
const subtotal = computed(() => {
  return detalles.value.reduce((sum, detalle) => sum + calculateDetalleTotal(detalle), 0)
})

const totalIVA = computed(() => calculateIVA(subtotal.value, 12))
const total = computed(() => subtotal.value + totalIVA.value)

// Methods
const onClienteSelected = (cliente) => {
  showClienteModal.value = false
}

const clearCliente = () => {
  selectedCliente.value = null
}

const onProductoSelected = (producto) => {
  if (isProductoInCart(producto.id)) {
    Swal.fire({
      icon: 'warning',
      title: 'Producto ya agregado',
      text: 'Este producto ya está en el carrito'
    })
    return
  }
  
  selectedTempProducto.value = producto
  tempCantidad.value = 1
  tempDescuento.value = 0
}

const closeProductoModal = () => {
  showProductoModal.value = false
  selectedTempProducto.value = null
  tempCantidad.value = 1
  tempDescuento.value = 0
}

const isProductoInCart = (productoId) => {
  return detalles.value.some(d => d.productoId === productoId)
}

const getMaxStock = (productoId) => {
  const producto = productosDisponibles.value.find(p => p.id === productoId)
  return producto?.stockActual || 1
}

const validateCantidad = (detalle, index) => {
  const maxStock = getMaxStock(detalle.productoId)
  if (detalle.cantidad > maxStock) {
    detalle.cantidad = maxStock
    Swal.fire({
      icon: 'warning',
      title: 'Stock Insuficiente',
      text: `Solo hay ${maxStock} unidades disponibles`,
      toast: true,
      position: 'top-end',
      timer: 3000,
      showConfirmButton: false
    })
  }
  if (detalle.cantidad < 1) {
    detalle.cantidad = 1
  }
}

const calcularSubtotalTemp = () => {
  if (!selectedTempProducto.value) return 0
  const precioVenta = selectedTempProducto.value.precio || selectedTempProducto.value.precioVenta
  const subtotalItem = precioVenta * tempCantidad.value
  const descuentoAmount = (subtotalItem * tempDescuento.value) / 100
  return subtotalItem - descuentoAmount
}

const agregarProductoAlCarrito = () => {
  if (!selectedTempProducto.value || tempCantidad.value <= 0) return

  const stockDisponible = selectedTempProducto.value.stock || selectedTempProducto.value.stockActual

  if (tempCantidad.value > stockDisponible) {
    Swal.fire({
      icon: 'error',
      title: 'Stock Insuficiente',
      text: `Solo hay ${stockDisponible} unidades disponibles`
    })
    return
  }

  const precioVenta = selectedTempProducto.value.precio || selectedTempProducto.value.precioVenta

  detalles.value.push({
    productoId: selectedTempProducto.value.id,
    productoNombre: selectedTempProducto.value.nombre,
    cantidad: tempCantidad.value,
    precioUnitario: precioVenta,
    descuento: tempDescuento.value
  })

  Swal.fire({
    icon: 'success',
    title: 'Producto agregado',
    toast: true,
    position: 'top-end',
    timer: 2000,
    showConfirmButton: false
  })

  closeProductoModal()
}

const calculateDetalleTotal = (detalle) => {
  const subtotalItem = detalle.cantidad * detalle.precioUnitario
  const descuentoAmount = (subtotalItem * detalle.descuento) / 100
  return subtotalItem - descuentoAmount
}

const removeProducto = (index) => {
  detalles.value.splice(index, 1)
}

const guardarVenta = async () => {
  if (detalles.value.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Sin Productos',
      text: 'Debe agregar al menos un producto a la factura'
    })
    return
  }

  const result = await Swal.fire({
    title: '¿Confirmar Factura?',
    html: `
      <p><strong>Total a cobrar:</strong> ${formatCurrency(total.value)}</p>
      <p>¿Deseas confirmar esta factura?</p>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#FF7713',
    cancelButtonColor: '#95a5a6',
    confirmButtonText: 'Sí, confirmar',
    cancelButtonText: 'Cancelar'
  })

  if (!result.isConfirmed) return

  saving.value = true
  try {
    const ventaData = {
      clienteId: selectedCliente.value?.id || null,
      detalles: detalles.value.map(d => ({
        productoId: d.productoId,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        descuento: d.descuento
      })),
      observaciones: observaciones.value || null
    }

    await ventaService.create(ventaData)

    await Swal.fire({
      icon: 'success',
      title: 'Factura Registrada',
      html: `
        <p>La factura se registró correctamente</p>
        <p><strong>Total:</strong> ${formatCurrency(total.value)}</p>
      `,
      confirmButtonColor: '#FF7713'
    })

    router.push('/ventas')
  } catch (error) {
    console.error('Error al guardar venta:', error)
    const message = error.response?.data?.message || error.message || 'Error al guardar la venta'
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message
    })
  } finally {
    saving.value = false
  }
}

const cancelVenta = async () => {
  const result = await Swal.fire({
    title: '¿Cancelar Venta?',
    text: 'Se perderán todos los datos ingresados',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#180A01',
    cancelButtonColor: '#95a5a6',
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'No'
  })

  if (result.isConfirmed) {
    router.push('/ventas')
  }
}

onMounted(async () => {
  try {
    // Solo cargamos los productos, los clientes se buscan bajo demanda
    await productoStore.fetchProductos()
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudieron cargar los productos'
    })
  }
})
</script>

<style scoped>
.nueva-venta-page {
  max-width: 1400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.page-title {
  font-size: 32px;
  color: var(--secondary-color);
  margin: 0;
}

/* Cliente Card Styles */
.empty-client-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
  color: #6c757d;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-client-state p {
  margin: 8px 0 4px 0;
  font-size: 16px;
  font-weight: 500;
}

.empty-client-state small {
  color: #94a3b8;
  font-size: 14px;
}

.selected-client-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.client-info {
  width: 100%;
}

.client-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.client-header h4 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: white;
}

.client-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 8px;
  font-size: 14px;
}

.client-details span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.client-address {
  font-size: 14px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #6c757d;
  font-size: 16px;
}

.totals-section {
  padding: 20px 25px;
  background-color: #f8f9fa;
  border-top: 2px solid var(--primary-color);
}

.totals-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 16px;
}

.totals-row.total {
  font-size: 24px;
  color: var(--primary-color);
  border-top: 2px solid var(--primary-color);
  padding-top: 10px;
  margin-top: 10px;
  font-weight: 700;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-top: 20px;
}

.btn-lg {
  padding: 15px 30px;
  font-size: 18px;
}

.modal-search {
  margin-bottom: 20px;
}

.modal-list {
  max-height: 400px;
  overflow-y: auto;
}

.list-item {
  padding: 15px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.list-item:hover:not(.disabled) {
  border-color: var(--primary-color);
  background-color: rgba(255, 119, 19, 0.05);
}

.list-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f8f9fa;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-details {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: #6c757d;
}

.item-warning {
  margin-top: 8px;
  padding: 5px 10px;
  background-color: #fff3cd;
  color: #856404;
  border-radius: 4px;
  font-size: 12px;
}

.empty-message {
  padding: 40px;
  text-align: center;
  color: #6c757d;
}

.producto-form {
  margin-top: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.producto-form h4 {
  margin-bottom: 15px;
  color: var(--secondary-color);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.form-summary {
  padding: 15px;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 15px;
}

.form-summary p {
  margin: 5px 0;
  display: flex;
  justify-content: space-between;
}

.table input.form-control-sm {
  text-align: center;
  padding: 4px 8px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
