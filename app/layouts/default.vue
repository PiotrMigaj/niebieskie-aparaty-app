<template>
    <div class="min-h-screen bg-gray-50">
        <Navbar />
        <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-25">
            <slot />
        </main>
        <!-- Christmas Popup - COMMENTED OUT FOR NEXT YEAR -->
        <!-- <ChristmasPopup ref="christmasPopup" @close="handlePopupClose" /> -->
    </div>
</template>

<script setup>
// Christmas popup logic - COMMENTED OUT FOR NEXT YEAR
/*
const christmasPopup = ref(null)

onMounted(() => {
  // Check if popup should be shown after login
  if (process.client) {
    const shouldShow = localStorage.getItem('showChristmasPopup')
    if (shouldShow === 'true') {
      // Small delay to ensure page is loaded
      setTimeout(() => {
        christmasPopup.value?.show()
      }, 500)
    }
  }
})

const handlePopupClose = () => {
  // Mark popup as shown so it doesn't appear again
  if (process.client) {
    localStorage.setItem('showChristmasPopup', 'false')
  }
}
*/
</script>