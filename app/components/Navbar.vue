<template>
  <!-- Christmas Invitation Banner - COMMENTED OUT FOR NEXT YEAR -->
  <!--
  <div class="fixed top-0 w-full bg-gradient-to-r from-red-600 via-red-700 to-red-600 text-white z-50 shadow-lg">
    <div class="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
      <div class="hidden sm:flex items-center justify-center text-center">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-sparkles" class="text-yellow-300 text-lg animate-pulse" />
          <span class="font-medium text-sm md:text-base">
            🎄 Zapraszam na świąteczne sesje fotograficzne!
          </span>
          <a
            href="https://niebieskie-aparaty.pl"
            target="_blank"
            class="ml-2 bg-white text-red-700 px-3 py-1 rounded-full text-sm font-semibold hover:bg-red-50 transition-colors duration-300 shadow-sm"
          >
            Dowiedz się więcej
          </a>
          <UIcon name="i-heroicons-sparkles" class="text-yellow-300 text-lg animate-pulse" />
        </div>
      </div>

      <div class="flex sm:hidden flex-col items-center text-center gap-2">
        <div class="flex items-center gap-1">
          <UIcon name="i-heroicons-sparkles" class="text-yellow-300 text-sm animate-pulse" />
          <span class="font-medium text-xs">
            🎄 Sesje świąteczne!
          </span>
          <UIcon name="i-heroicons-sparkles" class="text-yellow-300 text-sm animate-pulse" />
        </div>
        <a
          href="https://niebieskie-aparaty.pl"
          target="_blank"
          class="bg-white text-red-700 px-2 py-1 rounded-full text-xs font-semibold hover:bg-red-50 transition-colors duration-300 shadow-sm"
        >
          Sprawdź
        </a>
      </div>
    </div>
  </div>
  -->

  <nav class="fixed top-0 w-full bg-white bg-opacity-95 shadow-sm z-40">
    <div class="container mx-auto px-4 lg:px-8">
      <div class="flex justify-between items-center h-[76px]">
        <!-- Brand/Logo -->
        <NuxtLink to="/" class="font-italiana text-[1.8rem] tracking-[2px]">
          NIEBIESKIE APARATY
        </NuxtLink>

        <!-- Desktop Links -->
        <div class="hidden lg:flex items-center gap-4">
          <NuxtLink to="/"
            class="uppercase text-[0.8rem] tracking-[1.5px] font-medium mx-3 py-2 relative hover:text-gray-700">
            Home
          </NuxtLink>
          <button @click="handleLogout"
            class="uppercase text-[0.8rem] tracking-[1.5px] font-medium mx-3 py-2 relative hover:text-gray-700">
            Logout
          </button>
        </div>

        <!-- Mobile Toggle Button -->
        <button class="lg:hidden focus:outline-none" @click="isMenuOpen = !isMenuOpen" aria-label="Toggle navigation">
          <UIcon name="i-heroicons-bars-3" class="text-black text-2xl" />
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="isMenuOpen" class="lg:hidden bg-white shadow-lg pb-4">
      <ul class="container mx-auto px-4">
        <li class="border-b border-gray-100">
          <NuxtLink to="/" class="block py-3 uppercase text-[0.8rem] tracking-[1.5px] font-medium">
            Home
          </NuxtLink>
        </li>
        <li class="border-b border-gray-100 last:border-0">
          <button @click="handleLogout" class="block py-3 uppercase text-[0.8rem] tracking-[1.5px] font-medium">
            Logout
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
const isMenuOpen = ref(false);
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
};

// Auto-close mobile menu on route change
watch(() => useRoute().fullPath, () => {
  isMenuOpen.value = false;
});
</script>

<style scoped>
/* Optional hover effect */
button:hover,
a:hover {
  text-decoration: underline;
}
</style>