<template>
  <div v-if="isVisible" class="fixed inset-0 flex items-center justify-center z-[100] p-4">
    <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
      <!-- Close Button -->
      <button 
        @click="closePopup"
        class="absolute top-4 right-4 z-20 bg-white hover:bg-gray-100 text-red-600 rounded-full p-2 transition-all duration-200 shadow-lg"
      >
        <UIcon name="i-heroicons-x-mark" class="text-red-600 text-xl" />
      </button>
      
      <!-- Header with Christmas Theme -->
      <div class="bg-gradient-to-r from-red-600 via-red-700 to-red-600 text-white p-6 pb-4 text-center relative overflow-hidden pr-16">
        <!-- Decorative elements -->
        <div class="absolute top-0 left-0 w-full h-full opacity-10">
          <div class="absolute top-2 left-4 text-2xl animate-pulse">❄️</div>
          <div class="absolute top-6 right-8 text-xl animate-pulse delay-300">⭐</div>
          <div class="absolute bottom-4 left-8 text-lg animate-pulse delay-700">✨</div>
          <div class="absolute bottom-2 right-4 text-2xl animate-pulse delay-500">❄️</div>
        </div>
        
        <h2 class="text-2xl md:text-3xl font-bold mb-2 relative">
          🎄 Sesje Świąteczne 2025
        </h2>
        <p class="text-red-100 text-sm md:text-base relative">
          Magiczne chwile w obiektywie
        </p>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-4">
        <!-- Main Message -->
        <div class="text-center space-y-3">
          <p class="text-gray-700 text-sm md:text-base leading-relaxed">
            Zapraszam na wyjątkowe sesje fotograficzne w klimacie świąt Bożego Narodzenia. 
            Uwiecznię magię świąt w profesjonalnych zdjęciach pełnych ciepła i radości.
          </p>
          
          <!-- Features -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <UIcon name="i-heroicons-camera" class="text-red-600" />
              <span>Profesjonalne studio</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <UIcon name="i-heroicons-sparkles" class="text-red-600" />
              <span>Świąteczne dekoracje</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <UIcon name="i-heroicons-heart" class="text-red-600" />
              <span>Sesje rodzinne</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <UIcon name="i-heroicons-star" class="text-red-600" />
              <span>Wspaniała atmosfera</span>
            </div>
          </div>
        </div>

        <!-- Call to Action -->
        <div class="pt-4 space-y-3">
          <a 
            href="https://niebieskie-aparaty.pl" 
            target="_blank"
            @click="closePopup"
            class="block w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-center py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            Sprawdź ofertę i umów sesję
          </a>
          
          <p class="text-xs text-gray-500 text-center">
            Ograniczona liczba miejsc • Rezerwuj już dziś
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const isVisible = ref(false)

const emit = defineEmits(['close'])

const show = () => {
  isVisible.value = true
}

const closePopup = () => {
  isVisible.value = false
  emit('close')
}

// Close on escape key
onMounted(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape' && isVisible.value) {
      closePopup()
    }
  }
  
  window.addEventListener('keydown', handleEscape)
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape)
  })
})

// Expose show method to parent
defineExpose({
  show
})
</script>

<style scoped>
/* Smooth animations */
.fixed {
  animation: fadeIn 0.3s ease-out;
}

.bg-white {
  animation: slideIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>