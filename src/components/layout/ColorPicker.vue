<script setup lang="ts">
import { useColorFilter } from '@/composables/useColorFilter'
import { useGalleryStore } from '@/stores/gallery'

const galleryStore = useGalleryStore()
const {
  colorPalette,
  isColorMenuOpen,
  hexColor,
  hexInputRef,
  activeColor,
  selectColor,
  applyHexColor,
} = useColorFilter()
</script>

<template>
  <div class="absolute right-1 top-1/2 -translate-y-1/2 z-50">
    <div
      class="dropdown dropdown-bottom dropdown-end"
      :class="{ 'dropdown-open': isColorMenuOpen }"
    >
      <div
        tabindex="0"
        role="button"
        class="btn btn-circle shadow-2xl"
        :class="{ 'btn-disabled': galleryStore.loading }"
        :style="{ backgroundColor: activeColor || 'black' }"
        @click="!galleryStore.loading && (isColorMenuOpen = !isColorMenuOpen)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485a2 2 0 01-1.414.586h-2.828a2 2 0 01-1.414-.586l-1.657-1.657a2 2 0 010-2.828l8.485-8.485z"
          />
        </svg>
      </div>
      <ul
        tabindex="0"
        class="dropdown-content menu p-4 shadow-2xl bg-base-100 rounded-box w-64 gap-3"
      >
        <!-- color grid -->
        <div class="grid grid-cols-4 gap-5">
          <button
            @click="selectColor(null)"
            class="cursor-pointer w-10 h-10 rounded-lg shadow-lg hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="galleryStore.loading"
          >
            <div
              class="w-10 h-10 rounded-lg bg-base-200 flex items-center justify-center"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </button>
          <button
            v-for="color in colorPalette"
            :key="color"
            @click="selectColor(color)"
            class="cursor-pointer w-10 h-10 rounded-lg shadow-lg hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            :style="{ backgroundColor: color }"
            :class="{
              'ring-4 ring-primary ring-offset-2': activeColor === color,
            }"
            :disabled="galleryStore.loading"
          ></button>

          <!-- custom hex input -->
          <input
            ref="hexInputRef"
            v-model="hexColor"
            @keyup.enter="applyHexColor"
            @change="applyHexColor"
            type="text"
            placeholder="#RRGGBB"
            class="col-span-2 h-10 rounded-lg bg-base-200 px-3 text-sm text-base-content/80 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="galleryStore.loading"
            spellcheck="false"
          />
        </div>
      </ul>
    </div>
  </div>
</template>

