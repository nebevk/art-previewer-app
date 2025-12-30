<script setup lang="ts">
import ImageCard from './ImageCard.vue'
import { useGalleryStore } from '@/stores/gallery'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'

const galleryStore = useGalleryStore()

useInfiniteScroll({
  threshold: 300,
  onLoadMore: () => galleryStore.loadMore(),
  isLoading: () => galleryStore.loading,
  hasMore: () => galleryStore.hasMoreResults,
})
</script>

<template>
  <div>
    <!-- Loading skeletons -->
    <div
      v-if="galleryStore.loading && galleryStore.photos.length === 0"
      class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8"
    >
      <div
        v-for="n in 20"
        :key="n"
        class="skeleton h-64 rounded-xl animate-pulse"
      ></div>
    </div>

    <!-- Loading more indicator -->
    <div
      v-if="galleryStore.loading && galleryStore.photos.length > 0"
      class="text-center my-8"
    >
      <div class="flex items-center justify-center gap-3">
        <span class="loading loading-spinner loading-lg"></span>
        <span class="text-lg">Loading more images...</span>
      </div>
    </div>

    <!-- Real images -->
    <div
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8"
    >
      <ImageCard
        v-for="photo in galleryStore.filteredPhotos"
        :key="photo.id"
        :photo="photo"
      />
    </div>

    <!-- Load More (fallback / manual trigger) -->
    <div class="text-center my-12">
      <button
        @click="galleryStore.loadMore()"
        :disabled="galleryStore.loading || !galleryStore.hasMoreResults"
        class="btn btn-lg rounded-full"
      >
        <span
          v-if="galleryStore.loading"
          class="loading loading-spinner loading-sm"
        ></span>
        <span v-else-if="!galleryStore.hasMoreResults" class="font-light">
          No more results
        </span>
        <span v-else class="font-light">Load more images</span>
      </button>
    </div>
  </div>
</template>

