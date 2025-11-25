<script setup lang="ts">
import { useBrainsStore } from './stores/brains'
import ImageGrid from './components/ImageGrid.vue'
import HistorySidebar from './components/HistorySidebar.vue'
import { ref } from 'vue'

const store = useBrainsStore()

// Speed Dial (FAB) state
const isColorMenuOpen = ref(false)

const colorPalette = [
  '#ff6b6b', '#f9844a', '#f9c74f', '#90be6d', '#43aa8b',
  '#4d908e', '#577590', '#277da1', '#5e60ce', '#9b5de5',
  '#ff006e', '#8338ec', '#3a86ff', '#06ffa5', '#ffbe0b',
  '#fb5607', '#ff4365', '#00bbf9', '#f15bb5', '#000000', '#ffffff'
]

const selectColor = (color: string | null) => {
  store.setColorFilter(color)
  isColorMenuOpen.value = false
}

const clearFilters = () => {
  store.setColorFilter(null)
  isColorMenuOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-base-200 flex flex-col">
    <!-- header -->
    <header class="bg-base-300/95 border-b border-base-100 py-6 sticky top-0 z-50 backdrop-blur-xl">
      <div class="max-w-screen-2xl mx-auto px-6">

        <!-- Centered Row -->
        <div class="flex items-center justify-center gap-6 relative">

          <!-- Title (left-aligned but centered in layout) -->
          <h1 class="absolute left-0 text-4xl font-light font-outfit tracking-tight">
            Art Viewer
          </h1>


          <div class="flex-1 max-w-2xl">
            <div class="relative">
              <input v-model="store.query" type="text" placeholder="Search millions of art, photos, illustrations..."
                class="input input-lg input-bordered rounded-full shadow-lg w-full pr-16 text-lg" autofocus spellcheck="false" />


              <div v-if="store.activeColor"
                class="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg shadow-lg border-2 border-white"
                :style="{ backgroundColor: store.activeColor }"></div>
            </div>
          </div>

          <!-- DaisyUI Speed Dial FAB (right of input) -->
          <div class="right-8 top-20 z-50">
            <div class="dropdown dropdown-bottom dropdown-end">
              <div tabindex="0" role="button" class="btn btn-circle btn-primary shadow-2xl"
                :class="{ 'btn-disabled': store.loading }">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485a2 2 0 01-1.414.586h-2.828a2 2 0 01-1.414-.586l-1.657-1.657a2 2 0 010-2.828l8.485-8.485z" />
                </svg>
              </div>
              <ul tabindex="0" class="dropdown-content menu p-4 shadow-2xl bg-base-100 rounded-box w-64 gap-3">

                <!-- Color Grid -->
                <div class="grid grid-cols-4 gap-5">
                  <button @click="selectColor(null)"
                    class="w-10 h-10 rounded-lg shadow-lg hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="store.loading">
                    <div class="w-10 h-10 rounded-lg bg-base-200 flex items-center justify-center">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                          d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </button>
                  <button v-for="color in colorPalette" :key="color" @click="selectColor(color)"
                    class="w-10 h-10 rounded-lg shadow-lg hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    :style="{ backgroundColor: color }"
                    :class="{ 'ring-4 ring-primary ring-offset-2': store.activeColor === color }"
                    :disabled="store.loading">
                  </button>

                </div>
              </ul>
            </div>
          </div>

          <!-- stats -->
          <div class="relative right-0 bottom-0 text-sm opacity-70 flex items-center gap-3">
            <span v-if="store.isTyping" class="flex items-center gap-2">
              <span class="loading loading-spinner loading-xs"></span>
              Searching...
            </span>
            <span v-else-if="store.error" class="text-error">
              {{ store.error }}
            </span>
            <span v-else>
              {{ store.resultCount.toLocaleString() }} results
            </span>
            <!--<button @click="clearFilters" class="link link-hover text-xs"
              :class="{ 'opacity-50': !store.activeColor && store.query === 'art' }">
              Clear all
            </button>  -->
          </div>
        </div>
      </div>
    </header>

    <!--main -->
    <div class="flex-1 flex overflow-hidden">
      <main class="flex-1 p-8 overflow-y-auto">
        <ImageGrid />
      </main>
      <HistorySidebar />
    </div>
  </div>
</template>

<style scoped>
.font-outfit {
  font-family: 'Outfit7', system-ui, sans-serif;
}
</style>