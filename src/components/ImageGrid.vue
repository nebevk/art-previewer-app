<script setup lang="ts">
import ImageCard from './ImageCard.vue'
import { useBrainsStore } from '../stores/brains'

const store = useBrainsStore()
</script>

<template>
  <div>
    <!-- Loading skeletons -->
    <div v-if="store.loading && store.photos.length === 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
      <div v-for="n in 20" :key="n" class="skeleton h-64 rounded-xl"></div>
    </div>

    <!-- Real images -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
      <ImageCard v-for="photo in store.photos" :key="photo.id" :photo="photo" />
    </div>

    <!-- Load More -->
    <div class="text-center my-12">
      <button @click="store.search()" class="btn btn-lg btn-primary" :disabled="store.loading">
        {{ store.loading ? 'Loading...' : 'Load More' }}
      </button>
    </div>
  </div>
</template>