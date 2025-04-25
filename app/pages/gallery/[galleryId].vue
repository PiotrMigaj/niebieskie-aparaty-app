<template>
  <div class="card flex justify-center">
    <!-- Galleria with custom configuration -->
    <Galleria
      v-model:activeIndex="activeIndex"
      v-model:visible="displayCustom"
      :value="galleryImages"
      :responsiveOptions="responsiveOptions"
      :numVisible="7"
      containerStyle="max-width: 1250px"
      :circular="false"
      :fullScreen="true"
      :showItemNavigators="true"
      :showThumbnails="false"
      maskClass="blurred-background-mask"
    >
      <template #item="slotProps">
        <img
          :src="slotProps.item.itemImageSrc"
          :alt="slotProps.item.alt"
          class="full-screen-image"
        />
      </template>
      <template #thumbnail="slotProps">
        <img
          :src="slotProps.item.thumbnailImageSrc"
          :alt="slotProps.item.alt"
          style="display: block"
        />
      </template>
    </Galleria>

    <!-- Thumbnail grid -->
    <div v-if="galleryImages" class="grid grid-cols-8 gap-4" style="max-width: 1600px">
      <div v-for="(image, index) of galleryImages" :key="index" class="col-span-4">
        <img
          :src="image.thumbnailImageSrc"
          :alt="image.alt"
          style="cursor: pointer"
          @click="imageClick(index)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router'; // Make sure you have this for routing
import Galleria from 'primevue/galleria';

const activeIndex = ref(0);  // Initialize active index
const displayCustom = ref(false);  // Initialize display flag
const galleryImages = ref([]); // Gallery images array
const responsiveOptions = ref([
  { breakpoint: '1024px', numVisible: 5 },
  { breakpoint: '768px', numVisible: 3 },
  { breakpoint: '560px', numVisible: 1 }
]);

// Fetch gallery data onMounted
onMounted(async () => {
  const galleryId = useRoute().params.galleryId; // Assuming you're passing galleryId in the URL
  
  try {
    const galleryData = await $fetch(`/api/galleries/${galleryId}`);
    
    // Map fetched gallery data to the required structure
    galleryImages.value = galleryData.urls.map((url, index) => ({
      itemImageSrc: url,
      thumbnailImageSrc: url,
      alt: `Image ${index + 1}`,
    }));
  } catch (error) {
    console.error('Error fetching gallery:', error);
  }
});

// Handle image click to display the full-screen view
const imageClick = (index) => {
  activeIndex.value = index;
  displayCustom.value = true;
};
</script>

<style scoped>
/* Global styles */
.blurred-background-mask {
  backdrop-filter: blur(8px) !important;
  background-color: rgba(0, 0, 0, 0.7) !important;
}
</style>

<style scoped>
.card {
  padding: 2rem;
}

.full-screen-image {
  width: 100vw;
  height: 100vh;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}
</style>
