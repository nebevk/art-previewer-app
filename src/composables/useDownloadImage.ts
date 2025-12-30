import { ref } from 'vue'
import type { Img } from '@/types/media'
import { useHistoryStore } from '@/stores/history'

export const useDownloadImage = () => {
  const historyStore = useHistoryStore()
  const isDownloading = ref(false)
  const downloadError = ref<string | null>(null)

  const download = async (photo: Img) => {
    if (isDownloading.value) return

    isDownloading.value = true
    downloadError.value = null

    try {
      const response = await fetch(photo.src.original, {
        signal: AbortSignal.timeout(15000), // 15 second timeout for downloads
      })

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`)
      }

      const blob = await response.blob()

      // Use file-saver to download
      const { saveAs } = await import('file-saver')
      saveAs(
        blob,
        `${photo.alt.replace(/[^a-z0-9]/gi, '_')}_${photo.id}.jpg`
      )

      // add to history
      historyStore.addToHistory(photo)
    } catch (error: any) {
      console.error('Download failed:', error)
      downloadError.value = error.message || 'Download failed'
      throw error
    } finally {
      isDownloading.value = false
    }
  }

  return {
    isDownloading,
    downloadError,
    download,
  }
}

