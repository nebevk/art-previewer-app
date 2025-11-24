<script setup lang="ts">
import { useBrainsStore } from '../stores/brains'
const store = useBrainsStore()
</script>

<template>

    <aside class="w-80 bg-base-300 border-l border-base-100 p-6 overflow-y-auto">
      <h2 class="text-2xl font-light mb-6">Latest Finds</h2>

      <div v-if="store.downloadHistory.length === 0" class="text-center text-base-content/60 mt-20">
        <p>No downloads yet</p>
        <p class="text-sm mt-2">Drag or click any image</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="photo in store.downloadHistory" :key="photo.id" class="flex gap-3 items-center">
          <img :src="photo.src.medium" class="w-10 h-10 object-cover rounded" />
          <div>
            <p class="text-sm font-medium truncate w-60">{{ photo.alt }}</p>
            <p class="text-xs opacity-60">At {{ new Date(photo.downloadedAt || '').toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</p>
          </div>
        </div>
      </div>
    </aside>

</template>