<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage transition="page" />
    </NuxtLayout>
  </UApp>
</template>

<script setup>
useHead({
  title: 'Photo Gallery – Niebieskie Aparaty',
  meta: [
    { name: 'description', content: 'Client photo gallery by Niebieskie Aparaty – private, elegant, and easy to explore.' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:title', content: 'Photo Gallery – Niebieskie Aparaty' },
    { property: 'og:description', content: 'Private and stylish photo gallery for photography clients by Niebieskie Aparaty.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://app.niebieskie-aparaty.pl' },
    { property: 'og:image', content: 'https://app.niebieskie-aparaty.pl/og-image.jpg' }, // Optional: Replace with your cover image
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Photo Gallery – Niebieskie Aparaty' },
    { name: 'twitter:description', content: 'Explore your private photography gallery by Niebieskie Aparaty.' },
    { name: 'twitter:image', content: 'https://app.niebieskie-aparaty.pl/og-image.jpg' } // Optional
  ],
  htmlAttrs: {
    lang: 'en'
  },
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'canonical', href: 'https://app.niebieskie-aparaty.pl' }
  ]
});
</script>