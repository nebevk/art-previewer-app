<script setup lang="ts">
import type { Img } from '../stores/brains'
import { useBrainsStore } from '../stores/brains'

const store = useBrainsStore()

const redownload = async (photo: Img) => {
  try {
    const response = await fetch(photo.src.original, {
      signal: AbortSignal.timeout(15000)
    })

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`)
    }

    const blob = await response.blob()
    const { saveAs } = await import('file-saver')
    saveAs(
      blob,
      `${photo.alt.replace(/[^a-z0-9]/gi, '_')}_${photo.id}.jpg`
    )

    store.addToHistory(photo)
  } catch (error) {
    console.error('Redownload from history failed:', error)
  }
}
</script>

<template>
  <aside class="w-80 bg-base-300 border-l border-base-100 p-6 overflow-y-auto">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-light">Latest Finds</h2>
      <button v-if="store.downloadHistory.length" type="button" class="btn btn-ghost btn-xs btn-circle"
        @click="store.clearDownloadHistory()">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor"
          stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 .49-9.5L1 10" />
        </svg>
      </button>
    </div>

    <div v-if="store.downloadHistory.length === 0" class="text-center text-base-content/60 mt-20">
      <p>No downloads yet</p>
      <p class="text-sm mt-2">Drag or click any image</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="photo in store.downloadHistory" :key="photo.id" class="flex gap-3 items-center">
        <button type="button" class="relative group w-10 h-10 rounded overflow-hidden flex-shrink-0"
          @click="redownload(photo)">
          <img :src="photo.src.medium" class="w-full h-full object-cover" />
          <div
            class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4 text-white" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3v14" />
              <polyline points="6 11 12 17 18 11" />
              <path d="M5 21h14" />
            </svg>
          </div>
        </button>
        <div class="flex-1">
          <p class="text-sm font-medium truncate w-60">
            {{ photo.alt }}
          </p>
          <p class="text-xs opacity-60">
            At
            {{
              new Date(photo.downloadedAt || '').toLocaleString(
                'en-US',
                {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }
              )
            }}
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>