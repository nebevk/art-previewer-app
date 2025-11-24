<script setup lang="ts">
import { useBrainsStore } from './stores/brains'
import ImageGrid from './components/ImageGrid.vue'
import HistorySidebar from './components/HistorySidebar.vue'


const store = useBrainsStore()
const handleSearch = () => store.search(true)


</script>

<template>
  <div class="min-h-screen bg-base-200 flex flex-col">
    <!-- Header -->
    <header class="bg-base-300 border-b border-base-100 p-6 sticky top-0 z-10 backdrop-blur">
      <div class="max-w-7xl mx-auto flex items-center gap-6">
        <h1 class="text-3xl font-bold">ArtViewer</h1> 
        <input v-model="store.query"
         type="text"
         @input="handleSearch" />
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
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
