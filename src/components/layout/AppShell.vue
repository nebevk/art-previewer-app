<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from './AppHeader.vue'
import ImageGrid from '@/components/gallery/ImageGrid.vue'
import HistorySidebar from '@/components/history/HistorySidebar.vue'
import InfoModal from '@/components/common/InfoModal.vue'

const isInfoOpen = ref(false)

const handleInfoOpen = () => {
  isInfoOpen.value = true
}

const handleInfoClose = () => {
  isInfoOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-base-200 flex flex-col">
    <AppHeader @open-info="handleInfoOpen" />

    <!--main -->
    <div class="flex-1 flex overflow-hidden">
      <main class="flex-1 p-8 overflow-y-auto">
        <ImageGrid />
      </main>

      <HistorySidebar class="hidden xl:block" />
    </div>

    <InfoModal :is-open="isInfoOpen" @close="handleInfoClose" />
  </div>
</template>

