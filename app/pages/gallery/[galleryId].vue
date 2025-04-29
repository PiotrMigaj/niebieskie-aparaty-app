<template>
  <div class="container mx-auto p-4">
    <MasonryWall :items="images" :columns="{ default: 1, 768: 2, 1024: 3 }" :gap="16">

      <template #default="{ item, index }">
        <div class="overflow-hidden cursor-pointer hover:opacity-90 transition-opacity shadow-md flex justify-center"
          @click="openImage(index)">
          <img :src="item.thumbnailImageSrc" :alt="item.alt" class="w-full h-auto object-contain" />
        </div>
      </template>
    </MasonryWall>

    <!-- Modal viewer remains unchanged -->
    <div v-if="selectedImage !== null"
      class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div class="relative max-w-[90vw] max-h-[85vh]">
        <button class="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors" @click="closeModal">
          <span class="text-3xl">×</span>
        </button>

        <div class="flex flex-col md:flex-row items-center">
          <button v-if="selectedImage > 0"
            class="hidden md:block md:mr-4 text-white hover:text-gray-300 transition-colors" @click="selectedImage--">
            <span class="text-4xl">←</span>
          </button>

          <div class="flex justify-center">
            <img v-if="images[selectedImage]" :src="images[selectedImage].itemImageSrc" :alt="images[selectedImage].alt"
              class="max-w-full max-h-[70vh] md:max-h-[85vh] object-contain" />
          </div>

          <button v-if="selectedImage < images.length - 1"
            class="hidden md:block md:ml-4 text-white hover:text-gray-300 transition-colors" @click="selectedImage++">
            <span class="text-4xl">→</span>
          </button>
        </div>

        <div class="flex justify-center space-x-12 mt-6 md:hidden">
          <button v-if="selectedImage > 0" class="text-white hover:text-gray-300 transition-colors"
            @click="selectedImage--">
            <span class="text-4xl">←</span>
          </button>
          <button v-if="selectedImage < images.length - 1" class="text-white hover:text-gray-300 transition-colors"
            @click="selectedImage++">
            <span class="text-4xl">→</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
definePageMeta({
  middleware: ["authenticated"],
  layout: "gallery",
});
const route = useRoute()
const selectedImage = ref(null)
const images = ref([])

// Method to open the modal with a specific image
const openImage = (index) => {
  selectedImage.value = index
}

// Method to close the modal
const closeModal = () => {
  selectedImage.value = null
}

// Fetch images when component mounts
onMounted(async () => {
  try {
    const galleryData = await $fetch(`/api/galleries/${route.params.galleryId}`)
    images.value = galleryData.urls.map((url, index) => ({
      itemImageSrc: url,
      thumbnailImageSrc: url,
      alt: `Image ${index + 1}`,
    }))
  } catch (error) {
    console.error('Error fetching gallery:', error)
  }
})

// Handle keyboard navigation
onMounted(() => {
  const handleKeydown = (e) => {
    if (selectedImage.value === null) return

    if (e.key === 'Escape') {
      closeModal()
    } else if (e.key === 'ArrowLeft' && selectedImage.value > 0) {
      selectedImage.value--
    } else if (e.key === 'ArrowRight' && selectedImage.value < images.value.length - 1) {
      selectedImage.value++
    }
  }

  window.addEventListener('keydown', handleKeydown)
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
})
</script>