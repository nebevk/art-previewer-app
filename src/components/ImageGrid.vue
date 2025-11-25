<script setup lang="ts">
import ImageCard from './ImageCard.vue'
import { useBrainsStore } from '../stores/brains'
import { onMounted, onUnmounted } from 'vue'

const store = useBrainsStore()

// Infinite scroll: load more images when near the bottom of the page
const handleScroll = () => {
  if (store.loading || !store.hasMoreResults) return

  const scrollPosition = window.innerHeight + window.scrollY
  const threshold = 300 // px from bottom to trigger load
  const fullHeight = document.documentElement.offsetHeight

  if (scrollPosition >= fullHeight - threshold) {
    store.loadMore()
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div>
    <!-- Loading skeletons -->
    <div v-if="store.loading && store.photos.length === 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
      <div v-for="n in 20" :key="n" class="skeleton h-64 rounded-xl animate-pulse"></div>
    </div>

    <!-- Loading more indicator -->
    <div v-if="store.loading && store.photos.length > 0" class="text-center my-8">
      <div class="flex items-center justify-center gap-3">
        <span class="loading loading-spinner loading-lg"></span>
        <span class="text-lg">Loading more images...</span>
      </div>
    </div>

    <!-- Real images -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
      <ImageCard v-for="photo in store.filteredPhotos" :key="photo.id" :photo="photo" />
    </div>

    <!-- Load More (fallback / manual trigger) -->
    <div class="text-center my-12">
      <button @click="store.loadMore()"
              :disabled="store.loading || !store.hasMoreResults"
              class="btn btn-lg">
        <span v-if="store.loading" class="loading loading-spinner loading-sm"></span>
        <span v-else-if="!store.hasMoreResults" class="font-light">No more results</span>
        <span v-else class="font-light">Load more images</span>
      </button>
    </div>
  </div>
</template>

<style scoped>

</style>