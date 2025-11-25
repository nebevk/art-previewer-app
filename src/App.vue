<script setup lang="ts">
import { useBrainsStore } from './stores/brains'
import ImageGrid from './components/ImageGrid.vue'
import HistorySidebar from './components/HistorySidebar.vue'


const store = useBrainsStore()
const handleTextSearch = () => {
  if (store.activeColor) store.setColorFilter(null)
  store.search(true)
}



const colorPalette = [
  '#ff6b6b', '#f9844a', '#f9c74f', '#90be6d', '#43aa8b',
  '#4d908e', '#577590', '#277da1', '#5e60ce', '#9b5de5',
  '#ff006e', '#8338ec', '#3a86ff', '#06ffa5', '#ffbe0b',
  '#fb5607', '#ff4365', '#00bbf9', '#f15bb5', '#000000', '#ffffff'
]

const clearColorFilter = () => {
  store.setColorFilter(null)
  store.query = 'art'
  store.search(true)
}


</script>

<template>
  <div class="min-h-screen bg-base-200 flex flex-col">
    <!-- Header -->
    <header class="bg-base-300 border-b border-base-100 p-3 sticky top-0 z-10 backdrop-blur">
      <div class=".max-w-screen-2xl mx-auto flex items-center gap-6">
        <h1 class="text-5xl font-light font-outfit">Art Viewer</h1>
        <input v-model="store.query" type="text" placeholder="Search by keywords..." @input="handleTextSearch"
          class="input input-bordered w-full max-w-xs" autofocus />

        <button @click="clearColorFilter" class="btn btn-ghost" :class="{ 'btn-disabled': !store.activeColor }">
          Clear Filter
        </button>

        <!-- Color Palette Bar -->
        <div class="flex gap-3 flex-wrap">
          <template v-for="color in colorPalette" :key="color">
            <button @click="store.setColorFilter(color)"
              class="w-8 h-8 rounded-lg shadow-lg transition-all hover:scale-110" :style="{ backgroundColor: color }"
              :class="{ 'ring-4 ring-white ring-offset-4 ring-offset-base-300': store.activeColor === color }"
              :title="color"></button>
          </template>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <main class="flex-1 p-8 overflow-y-auto">
        <ImageGrid />
      </main>
      <HistorySidebar />
    </div>
  </div>
</template>

<style scoped>

</style>
