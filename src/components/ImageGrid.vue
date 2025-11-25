<script setup lang="ts">
import ImageCard from './ImageCard.vue'
import { useBrainsStore } from '../stores/brains'

const store = useBrainsStore()
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

    <!-- Load More -->
    <div class="text-center my-12">
      <button @click="store.loadMore()"
              :disabled="store.loading || !store.hasMoreResults || !!store.activeColor"
              class="btn btn-lg btn-primary">
        <span v-if="store.loading" class="loading loading-spinner loading-sm"></span>
        <span v-else-if="!store.hasMoreResults">No more results</span>
        <span v-else-if="store.activeColor">Load more disabled during color filter</span>
        <span v-else>Load More ({{ store.resultCount }} results)</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.btn-primary {
  background-color: #007bff;
  color: white;
}
</style>