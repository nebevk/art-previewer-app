<script setup lang="ts">
import { useBrainsStore } from './stores/brains'
import ImageGrid from './components/ImageGrid.vue'
import HistorySidebar from './components/HistorySidebar.vue'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const store = useBrainsStore()

// UI state
const isColorMenuOpen = ref(false)

const colorPalette = [
  '#ff6b6b', '#f9844a', '#f9c74f', '#90be6d', '#43aa8b',
  '#4d908e', '#577590', '#277da1', '#5e60ce', '#9b5de5',
  '#ff006e', '#8338ec', '#3a86ff', '#06ffa5', '#ffbe0b',
  '#fb5607', '#ff4365', '#00bbf9', '#f15bb5', '#000000', '#ffffff'
]

const hexColor = ref('')
const hexInputRef = ref<HTMLInputElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

const selectColor = (color: string | null) => {
  store.setColorFilter(color)
  isColorMenuOpen.value = false
}

const normalizeHex = (value: string): string | null => {
  let v = value.trim()
  if (!v) return null

  // Remove leading '#', support 3 or 6 hex chars
  if (v.startsWith('#')) v = v.slice(1)

  if (v.length === 3) {
    // Expand short hex (#abc -> #aabbcc)
    v = v.split('').map((ch) => ch + ch).join('')
  }

  if (!/^[0-9a-fA-F]{6}$/.test(v)) return null

  return `#${v.toLowerCase()}`
}

const applyHexColor = async () => {
  const normalized = normalizeHex(hexColor.value)
  if (!normalized) return
  hexColor.value = normalized
  selectColor(normalized)

  await nextTick()
  hexInputRef.value?.select()
}

// Info modal state
const isInfoOpen = ref(false)

// Theme (light / dark) state
const theme = ref<'light' | 'dark'>('dark')

const applyTheme = (value: 'light' | 'dark') => {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', value)
}

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  applyTheme(theme.value)
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('theme', theme.value)
  }
}

const handleGlobalKeydown = (event: KeyboardEvent) => {
  // ESC: close color palette (if open) and clear search query
  if (event.key === 'Escape') {
    let handled = false

    if (isColorMenuOpen.value) {
      isColorMenuOpen.value = false
      handled = true
    }

    if (store.query) {
      store.query = ''
      handled = true
    }

    if (handled) {
      event.preventDefault()
      event.stopPropagation()
    }

    return
  }

  // Ctrl + I: open color palette and focus custom hex input
  if (event.ctrlKey && (event.key === 'i' || event.key === 'I')) {
    event.preventDefault()
    isColorMenuOpen.value = true

    nextTick(() => {
      hexInputRef.value?.focus()
      hexInputRef.value?.select()
    })

    return
  }

  // Ctrl + F: focus search input (instead of browser find)
  if (event.ctrlKey && (event.key === 'f' || event.key === 'F')) {
    event.preventDefault()
    searchInputRef.value?.focus()
    searchInputRef.value?.select()
  }
}

onMounted(() => {
  if (typeof window === 'undefined') return

  const stored = window.localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') {
    theme.value = stored
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme.value = 'dark'
  } else {
    theme.value = 'light'
  }

  applyTheme(theme.value)

  window.addEventListener('keydown', handleGlobalKeydown)
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<template>
  <div class="min-h-screen bg-base-200 flex flex-col">
    <!-- header -->
    <header class="bg-base-300/95 border-b border-base-100 py-6 sticky top-0 z-50 backdrop-blur-xl">
      <div class="w-full mx-auto px-6">

        <!-- Centered Row -->
        <div class="flex items-center justify-center gap-6 relative">


          <h1 class="hidden lg:block absolute left-0 text-3xl xl:text-4xl font-light font-outfit tracking-tight">
            Art Viewer
          </h1>


          <div class="flex-1 w-full max-w-full lg:max-w-2xl">
            <div class="relative">
              <input
                ref="searchInputRef"
                v-model="store.query"
                type="text"
                placeholder="Beautiful artwork awaits..."
                class="input rounded-full shadow-lg w-full pr-12 border-none text-base sm:text-lg lg:input-lg lg:pr-16"
                autofocus
                spellcheck="false"
              />


              <!-- color pallete -->
              <div class="absolute right-1 top-1/2 -translate-y-1/2 z-50">
                <div
                  class="dropdown dropdown-bottom dropdown-end"
                  :class="{ 'dropdown-open': isColorMenuOpen }"
                >
                  <div
                    tabindex="0"
                    role="button"
                    class="btn btn-circle shadow-2xl"
                    :class="{ 'btn-disabled': store.loading }"
                    :style="{ backgroundColor: store.activeColor || 'black' }"
                    @click="!store.loading && (isColorMenuOpen = !isColorMenuOpen)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485a2 2 0 01-1.414.586h-2.828a2 2 0 01-1.414-.586l-1.657-1.657a2 2 0 010-2.828l8.485-8.485z" />
                    </svg>
                  </div>
                  <ul tabindex="0" class="dropdown-content menu p-4 shadow-2xl bg-base-100 rounded-box w-64 gap-3">

                    <!-- color grid -->
                    <div class="grid grid-cols-4 gap-5">
                      <button @click="selectColor(null)"
                        class="cursor-pointer w-10 h-10 rounded-lg shadow-lg hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="store.loading">
                        <div class="w-10 h-10 rounded-lg bg-base-200 flex items-center justify-center">
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                              d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      </button>
                      <button v-for="color in colorPalette" :key="color" @click="selectColor(color)"
                        class="cursor-pointer w-10 h-10 rounded-lg shadow-lg hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        :style="{ backgroundColor: color }"
                        :class="{ 'ring-4 ring-primary ring-offset-2': store.activeColor === color }"
                        :disabled="store.loading">
                      </button>

                      <!-- custom hex input -->
                      <input
                        ref="hexInputRef"
                        v-model="hexColor"
                        @keyup.enter="applyHexColor"
                        @change="applyHexColor"
                        type="text"
                        placeholder="#RRGGBB"
                        class="col-span-2 h-10 rounded-lg bg-base-200 px-3 text-sm text-base-content/80 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="store.loading"
                        spellcheck="false"
                      />

                    </div>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div class="absolute right-0 flex items-center gap-2">
            <!-- Info modal trigger -->
            <button
              class="btn btn-circle btn-ghost"
              type="button"
              aria-label="About this app"
              @click="isInfoOpen = true"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
            </button>

            <!-- Theme toggle -->
            <button
              class="btn btn-circle btn-ghost"
              type="button"
              :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
              @click="toggleTheme"
            >
              <!-- Sun icon when in dark mode (suggests going to light) -->
              <svg v-if="theme === 'dark'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364l-1.414-1.414M7.05 7.05L5.636 5.636m0 12.728l1.414-1.414M17.95 7.05l1.414-1.414M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
              <!-- Moon icon when in light mode (suggests going to dark) -->
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            </button>
          </div>



          <!-- stats -->
          <div class="relative w-32 right-0 bottom-0 text-sm opacity-70 flex items-center gap-3">
            <span v-if="store.isTyping" class="flex items-center gap-2">
              <span class="font-light loading loading-spinner loading-xs"></span>
              Searching...
            </span>
            <span v-else-if="store.error" class="font-light text-error">
              {{ store.error }}
            </span>
            <span v-else class="font-light">
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

      <HistorySidebar class="hidden xl:block" />
    </div>

    <!-- Info modal -->
    <div v-if="isInfoOpen" class="modal modal-open">
      <div class="modal-box max-w-xl">
        <h3 class="font-bold text-xl mb-4">Some useful tips</h3>
        <div class="space-y-4 text-sm leading-relaxed">
          <div class="space-y-2">
            <p>
              Use the search bar to describe the kind of artwork you&apos;d like to see. Results update as you refine your prompt.
            </p>
            <p>
              The color picker lets you filter results by a dominant color, and the custom
              <span class="font-mono text-xs">#RRGGBB</span> input accepts any hex color. Each image also have average color swatch that you can click to copy the hex color to clipboard.
            </p>
            <p>
              The history panel keeps track of your recent downloads. Thubmnails can be clicked to redownload the image.
            </p>
          </div>

          <div>
            <h4 class="font-semibold mb-1">Keyboard shortcuts</h4>
            <ul class="list-disc list-inside space-y-1 text-xs sm:text-sm">
              <li><kbd class="kbd kbd-xs">Esc</kbd> – Close the color palette (if open) and clear the search query.</li>
              <li><kbd class="kbd kbd-xs">Ctrl</kbd> + <kbd class="kbd kbd-xs">I</kbd> – Open the color palette and focus the custom hex input.</li>
              <li><kbd class="kbd kbd-xs">Ctrl</kbd> + <kbd class="kbd kbd-xs">F</kbd> – Focus the main search input.</li>
            </ul>
          </div>
        </div>
        <div class="modal-action">
          <button class="btn rounded-full" type="button" @click="isInfoOpen = false">
            Got it
          </button>
        </div>
      </div>
      <button class="modal-backdrop" type="button" aria-label="Close info" @click="isInfoOpen = false"></button>
    </div>
  </div>
</template>

<style scoped>
.font-outfit {
  font-family: 'Outfit7', system-ui, sans-serif;
}
</style>