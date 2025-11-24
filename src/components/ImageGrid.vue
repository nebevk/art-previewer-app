<script setup lang="ts">
import ImageCard from './ImageCard.vue'
import { useBrainsStore } from '../stores/brains'

const store = useBrainsStore()
</script>

<template> 
  <div>
    <ImageCard v-for="photo in store.photos" :key="photo.id" :photo="photo" />
  </div>
 </template>