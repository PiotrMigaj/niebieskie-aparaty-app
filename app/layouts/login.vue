<template>
    <div class="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 bg-cover bg-center opacity-50" style="background-image: url('https://picsum.photos/1920/1080');"></div>
      <div class="relative z-10 w-full max-w-md p-8 bg-white shadow-lg">
        <slot />
      </div>
    </div>
  </template>
  