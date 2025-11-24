<script setup lang="ts">
import type { Img } from '../stores/brains'

const props = defineProps<{ photo: Img }>()
</script>

<template>
  <div>
    <img :src="photo.src.large2x" :alt="photo.alt" class="w-full aspect-video object-cover" loading="lazy" />
    
  </div>
</template>