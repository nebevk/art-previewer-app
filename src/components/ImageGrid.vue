<script setup lang="ts">
import ImageCard from './ImageCard.vue'
</script>

<template> 
  <div>
    <ImageCard v-for="n in 20" :key="n" />
  </div>
 </template>