<template>
  <EventsWrapper />
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["authenticated"],
});
</script>