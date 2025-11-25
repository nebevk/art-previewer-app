<script setup lang="ts">
import type { Img } from '../stores/brains'
import { useBrainsStore } from '../stores/brains'
import { computed } from 'vue'

const store = useBrainsStore()
const ONE_DAY = 24 * 60 * 60 * 1000

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

const downloadsToday = computed(() => {
  const now = new Date()
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  )
  const startOfTomorrow = new Date(startOfToday.getTime() + ONE_DAY)

  return store.downloadHistory.filter((photo) => {
    if (!photo.downloadedAt) return false
    const d = new Date(photo.downloadedAt)
    return d >= startOfToday && d < startOfTomorrow
  }).length
})

const downloadsYesterday = computed(() => {
  const now = new Date()
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  )
  const startOfYesterday = new Date(startOfToday.getTime() - ONE_DAY)

  return store.downloadHistory.filter((photo) => {
    if (!photo.downloadedAt) return false
    const d = new Date(photo.downloadedAt)
    return d >= startOfYesterday && d < startOfToday
  }).length
})

const todayVsYesterday = computed(() => {
  const today = downloadsToday.value
  const yesterday = downloadsYesterday.value

  if (yesterday === 0) {
    return {
      delta: today,
      percent: null as number | null,
      direction: today > 0 ? 'up' : 'flat' as 'up' | 'down' | 'flat'
    }
  }

  const delta = today - yesterday
  const percent = Math.round((delta / yesterday) * 100)

  return {
    delta,
    percent,
    direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat' as 'up' | 'down' | 'flat'
  }
})
</script>

<template>
  <aside class="w-80 bg-base-300 border-l border-base-100 p-3 overflow-y-auto">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-light">Your latest finds</h2>
      <button v-if="store.downloadHistory.length" type="button" class="btn btn-ghost btn-xs btn-circle"
        @click="store.clearDownloadHistory()">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor"
          stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 .49-9.5L1 10" />
        </svg>
      </button>
    </div>

    <div class="mb-4">
      <div
        class="stats stats-vertical sm:stats-horizontal shadow bg-base-200 text-center w-full max-w-full"
      >
        <div class="stat">
          <div class="stat-title text-xs opacity-70">
            Downloads today
          </div>
          <div class="stat-value text-lg font-medium font-outfit">
            {{ downloadsToday }}
          </div>
          <div class="stat-desc flex items-center justify-center gap-1 text-[10px] whitespace-normal">
            <span
              v-if="todayVsYesterday.percent !== null"
              :class="{
                'text-success': todayVsYesterday.direction === 'up',
                'text-error': todayVsYesterday.direction === 'down',
                'text-base-content/60': todayVsYesterday.direction === 'flat'
              }"
              class="flex items-center gap-1"
            >
              <svg
                v-if="todayVsYesterday.direction === 'up'"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                class="w-3 h-3"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
              <svg
                v-else-if="todayVsYesterday.direction === 'down'"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                class="w-3 h-3"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <span>
                {{ todayVsYesterday.delta > 0 ? '+' : '' }}{{ todayVsYesterday.percent }}%
              </span>
            </span>
            <span v-else class="opacity-60">
              No data for yesterday
            </span>
          </div>
        </div>

        <div class="stat">
          <div class="stat-title text-xs opacity-70">
            Yesterday
          </div>
          <div class="stat-value text-lg font-medium font-outfit">
            {{ downloadsYesterday }}
          </div>
          <div class="stat-desc text-[10px] opacity-70 whitespace-normal">
            Baseline for comparison
          </div>
        </div>
      </div>
    </div>

    <div v-if="store.downloadHistory.length === 0" class="text-center text-base-content/60 mt-8">
      <p>No downloads yet</p>
      <p class="text-sm mt-2">Drag or click any image</p>
    </div>

    <div v-else class="space-y-4 pb-6">
      <div v-for="photo in store.downloadHistory" :key="photo.id" class="flex gap-3 items-center">
        <button type="button" class="relative group w-10 h-10 rounded overflow-hidden shrink-0"
          @click="redownload(photo)">
          <img :src="photo.src.medium" class="cursor-pointer w-full h-full object-cover" />
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