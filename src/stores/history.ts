import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Img } from '@/types/media'

export const useHistoryStore = defineStore(
  'history',
  () => {
    const downloadHistory = ref<Img[]>([])

    const addToHistory = (photo: Img) => {
      const existingIndex = downloadHistory.value.findIndex(
        (p) => p.id === photo.id
      )

      const entry: Img = {
        ...photo,
        downloadedAt: new Date().toISOString(),
      }

      if (existingIndex !== -1) {
        // Remove existing entry so the latest download is always at the top
        downloadHistory.value.splice(existingIndex, 1)
      }

      downloadHistory.value.unshift(entry)
      if (downloadHistory.value.length > 100) downloadHistory.value.pop()
    }

    const clearDownloadHistory = () => {
      downloadHistory.value = []
    }

    return {
      downloadHistory,
      addToHistory,
      clearDownloadHistory,
    }
  },
  {
    persist: {
      pick: ['downloadHistory'],
    },
  }
)

