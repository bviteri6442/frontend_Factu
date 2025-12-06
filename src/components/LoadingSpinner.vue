<template>
  <div v-if="show" class="loading-overlay">
    <div class="loading-content">
      <div class="spinner"></div>
      <p v-if="message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: 'Cargando...'
  }
})
</script>

<style scoped>
.loading-content {
  text-align: center;
  color: white;
}

.loading-content p {
  margin-top: 15px;
  font-size: 16px;
  font-weight: 600;
}
</style>
