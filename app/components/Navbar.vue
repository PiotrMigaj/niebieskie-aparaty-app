<template>
  <nav class="fixed top-0 w-full bg-white bg-opacity-95 shadow-sm z-50">
    <div class="container mx-auto px-4 lg:px-8">
      <div class="flex justify-between items-center h-[76px]">
        <!-- Brand/Logo -->
        <NuxtLink to="/" class="font-serif text-[1.8rem] tracking-[2px]">
          NIEBIESKIE APARATY
        </NuxtLink>

        <!-- Desktop Logout Button -->
        <button @click="logout"
          class="hidden lg:block uppercase text-[0.8rem] tracking-[1.5px] font-medium mx-3 py-2 relative hover:text-gray-700">
          Logout
        </button>

        <!-- Mobile Toggle Button -->
        <button class="lg:hidden focus:outline-none" @click="isMenuOpen = !isMenuOpen" aria-label="Toggle navigation">
          <UIcon name="i-heroicons-bars-3" class="text-black text-2xl" />
        </button>
      </div>
    </div>

    <!-- Mobile Menu (with Logout) -->
    <div v-if="isMenuOpen" class="lg:hidden bg-white shadow-lg pb-4">
      <ul class="container mx-auto px-4">
        <li class="border-b border-gray-100 last:border-0">
          <button @click="logout" class="block py-3 uppercase text-[0.8rem] tracking-[1.5px] font-medium">
            Logout
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
const { clear: clearSession } = useUserSession();
const isMenuOpen = ref(false);

const logout = async () => {
  await clearSession();
  await navigateTo("/login");
};

// Close mobile menu when changing routes
watch(() => useRoute().fullPath, () => {
  isMenuOpen.value = false;
});
</script>

<style scoped>
/* Optional: Hover underline effect */
button:hover {
  text-decoration: underline;
}
</style>