<script setup lang="ts">
import { ref } from 'vue'
import { useGalleryStore } from '@/stores/gallery'
import { useGlobalShortcuts } from '@/composables/useGlobalShortcuts'
import { useColorFilter } from '@/composables/useColorFilter'
import SearchBar from './SearchBar.vue'
import ThemeToggle from './ThemeToggle.vue'

const emit = defineEmits<{
  'open-info': []
}>()

const galleryStore = useGalleryStore()
const { isColorMenuOpen, hexInputRef } = useColorFilter()
const searchBarRef = ref<InstanceType<typeof SearchBar> | null>(null)

const handleEscape = () => {
  if (isColorMenuOpen.value) {
    isColorMenuOpen.value = false
  }
  if (galleryStore.query) {
    galleryStore.query = ''
  }
}

const handleCtrlI = () => {
  isColorMenuOpen.value = true
  // Focus will be handled by ColorPicker after nextTick
  setTimeout(() => {
    hexInputRef.value?.focus()
    hexInputRef.value?.select()
  }, 0)
}

const handleCtrlF = () => {
  searchBarRef.value?.searchInputRef?.focus()
  searchBarRef.value?.searchInputRef?.select()
}

useGlobalShortcuts({
  onEscape: handleEscape,
  onCtrlI: handleCtrlI,
  onCtrlF: handleCtrlF,
})

defineExpose({
  searchInputRef: searchBarRef,
})
</script>

<template>
  <header
    class="bg-base-300/95 border-b border-base-100 py-6 sticky top-0 z-50 backdrop-blur-xl"
  >
    <div class="w-full mx-auto px-6">
      <!-- Centered Row -->
      <div class="flex items-center justify-center gap-6 relative">
        <h1
          class="hidden lg:block absolute left-0 text-3xl xl:text-4xl font-light tracking-tight lobster-regular" 
        >
          Pick'a Pic
        </h1>

        <SearchBar ref="searchBarRef" />

        <div class="absolute right-0 flex items-center gap-2">
          <!-- Info modal trigger -->
          <button
            class="btn btn-circle btn-ghost"
            type="button"
            aria-label="About this app"
            @click="emit('open-info')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
              />
            </svg>
          </button>

          <ThemeToggle />
        </div>

        <!-- stats -->
        <div
          class="relative w-32 right-0 bottom-0 text-sm opacity-70 flex items-center gap-3"
        >
          <span
            v-if="galleryStore.isTyping"
            class="flex items-center gap-2"
          >
            <span class="font-light loading loading-spinner loading-xs"></span>
            Searching...
          </span>
          <span v-else-if="galleryStore.error" class="font-light text-error">
            {{ galleryStore.error }}
          </span>
          <span v-else class="font-light">
            {{ galleryStore.resultCount.toLocaleString() }} results
          </span>
        </div>
      </div>
    </div>
  </header>
</template>

