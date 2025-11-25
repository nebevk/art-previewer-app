<script setup lang="ts">
import type { Img } from '../stores/brains'
import { useBrainsStore } from '../stores/brains'
import { ref } from 'vue'

const props = defineProps<{ photo: Img }>()
const store = useBrainsStore()
const isDownloading = ref(false)
const downloadError = ref<string | null>(null)
const copied = ref(false)
const copyTimeout = ref<number | null>(null)

const startDrag = (e: DragEvent) => {
  if (!e.dataTransfer) return
  const url = props.photo.src.original
  const filename = `${props.photo.alt.replace(/[^a-z0-9]/gi, '_')}_${props.photo.id}.jpg`
  e.dataTransfer.setData('DownloadURL', `image/jpeg:${filename}:${url}`)
}

const download = async () => {
  if (isDownloading.value) return

  isDownloading.value = true
  downloadError.value = null

  try {
    const response = await fetch(props.photo.src.original, {
      signal: AbortSignal.timeout(15000) // 15 second timeout for downloads
    })

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`)
    }

    const blob = await response.blob()

    // Use file-saver to download
    const { saveAs } = await import('file-saver')
    saveAs(blob, `${props.photo.alt.replace(/[^a-z0-9]/gi, '_')}_${props.photo.id}.jpg`)

    // add to history
    store.addToHistory(props.photo)

  } catch (error: any) {
    console.error("Download failed:", error)
    downloadError.value = error.message || "Download failed"
  } finally {
    isDownloading.value = false
  }
}

const copyColorToClipboard = async (event: MouseEvent) => {
  event.stopPropagation()

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(props.photo.avg_color)
    } else {
      // Fallback for very old browsers
      const textarea = document.createElement('textarea')
      textarea.value = props.photo.avg_color
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }

    copied.value = true
    if (copyTimeout.value) {
      clearTimeout(copyTimeout.value)
    }
    copyTimeout.value = window.setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch (err) {
    console.error('Failed to copy color to clipboard', err)
  }
}
</script>

<template>
  <div
    class="group relative rounded-sm overflow-hidden shadow-2xl transition-all hover:scale-[1.02]"
    :class="{
      'cursor-grab active:cursor-grabbing': !isDownloading,
      'cursor-wait': isDownloading
    }"
    :draggable="!isDownloading"
    @dragstart="startDrag"
    @click="download">

    <!-- Download loading overlay -->
    <div v-if="isDownloading"
         class="absolute inset-0 bg-black/70 flex items-center justify-center z-10 rounded-sm">
      <div class="flex flex-col items-center gap-2 text-white">
        <span class="loading loading-spinner loading-lg"></span>
        <span class="text-sm font-medium">Downloading...</span>
      </div>
    </div>

    <!-- Error overlay -->
    <div v-else-if="downloadError"
         class="absolute inset-0 bg-red-500/90 flex items-center justify-center z-10 rounded-sm">
      <div class="flex flex-col items-center gap-2 text-white text-center px-4">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span class="text-sm font-medium">{{ downloadError }}</span>
        <button @click.stop="downloadError = null; download()"
                class="btn btn-xs btn-outline btn-white mt-2">
          Retry
        </button>
      </div>
    </div>

    <div class="absolute top-2 left-2 space-y-1 z-10">
      <button
        type="button"
        @click.stop="copyColorToClipboard"
        class="w-6 h-6 rounded-full shadow-2xl border border-white/40 cursor-pointer hover:scale-110 transition-transform"
        :style="{ backgroundColor: photo.avg_color }"
        aria-label="Copy average color to clipboard">
      </button>
      <div
        v-if="copied"
        class="px-2 py-0.5 rounded-full bg-black/80 text-[10px] font-medium text-white shadow-lg">
        Copied
      </div>
    </div>

    <img :src="photo.src.large2x" :alt="photo.alt" class="w-full aspect-video object-cover" loading="lazy" />

    <div
      class="absolute inset-0 bg-linear-to-t from-black/90 via-transparent opacity-0 group-hover:opacity-100 transition pointer-events-none"
      :class="{ 'opacity-100': isDownloading }">
      <div class="absolute bottom-4 left-4 right-4 text-white">
        <p class="font-light text-md truncate">{{ photo.alt }}</p>
        <p v-if="!isDownloading && !downloadError" class="text-xs mt-2 opacity-70">
          Click or drag to download.
        </p>
        <p v-if="isDownloading" class="text-xs mt-2 opacity-70 flex items-center gap-2">
          <span class="loading loading-spinner loading-xs"></span>
          Downloading...
        </p>
        <p v-if="downloadError" class="text-xs mt-2 opacity-70 text-red-300">
          Download failed - click to retry
        </p>
      </div>
    </div>
  </div>
</template>