<script setup lang="ts">
import { useBrainsStore } from '../stores/brains'
const store = useBrainsStore()
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold">History</h2>
    <div v-for="photo in store.downloadHistory" :key="photo.id">
      <img :src="photo.src.medium" :alt="photo.alt" />
    </div>
  </div>
</template>