<script setup lang="ts">
import { ref } from 'vue'
import { useGalleryStore } from '@/stores/gallery'
import ColorPicker from './ColorPicker.vue'

const galleryStore = useGalleryStore()
const searchInputRef = ref<HTMLInputElement | null>(null)

defineExpose({
  searchInputRef,
})
</script>

<template>
  <div class="flex-1 w-full max-w-full lg:max-w-2xl">
    <div class="relative">
      <input
        ref="searchInputRef"
        v-model="galleryStore.query"
        type="text"
        placeholder="Beautiful artwork awaits..."
        class="input rounded-full shadow-lg w-full pr-12 border-none text-base sm:text-lg lg:input-lg lg:pr-16"
        autofocus
        spellcheck="false"
      />

      <ColorPicker />
    </div>
  </div>
</template>

