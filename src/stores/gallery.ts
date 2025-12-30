import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Img } from '@/types/media'
import { searchPexels, PexelsApiError } from '@/services/pexelsApi'
import { getLab, COLOR_TOLERANCE, colorDistance } from '@/utils/color'

export const useGalleryStore = defineStore('gallery', () => {
  const photos = ref<Img[]>([])
  const query = ref('art')
  const page = ref(1)
  const loading = ref(false)
  const hasMoreResults = ref(true)
  const error = ref<string | null>(null)
  const retryCount = ref(0)
  const maxRetries = 3
  const activeColor = ref<string | null>(null)
  const isTyping = ref(false)
  const typingTimeout = ref<number | null>(null)

  // Track which "batch" (page) each photo came from
  // This helps us maintain batch order when filtering by color
  const photoBatch = new Map<number, number>()

  const performSearch = async (reset = false) => {
    if (reset) {
      page.value = 1
      photos.value = []
      photoBatch.clear()
      hasMoreResults.value = true
      error.value = null
      retryCount.value = 0
    }

    loading.value = true
    error.value = null

    try {
      const cleanQuery = query.value.trim().toLowerCase() || 'art'

      console.log('[search] fetching', {
        query: cleanQuery,
        page: page.value,
        reset,
      })

      const newPhotosRaw = await searchPexels({
        query: cleanQuery,
        page: page.value,
        perPage: 40,
      })

      const existingIds = new Set(photos.value.map((p) => p.id))
      const newPhotos = newPhotosRaw.filter((p) => !existingIds.has(p.id))

      console.log('[search] received', {
        rawCount: newPhotosRaw.length,
        uniqueCount: newPhotos.length,
        firstId: newPhotos[0]?.id,
        lastId: newPhotos[newPhotos.length - 1]?.id,
      })

      if (newPhotos.length < 40) {
        hasMoreResults.value = false
      }

      // Track which batch (page) each photo came from
      const currentBatch = page.value
      newPhotos.forEach((photo) => {
        photoBatch.set(photo.id, currentBatch)
      })

      photos.value = reset ? newPhotos : [...photos.value, ...newPhotos]

      // load more next page
      if (newPhotos.length > 0) {
        page.value = reset ? 2 : page.value + 1
      }

      // reset
      retryCount.value = 0
    } catch (e: unknown) {
      console.error('Search failed:', e)

      // Handle PexelsApiError with improved error handling
      if (e instanceof PexelsApiError) {
        error.value = e.message

        // Retry logic for retryable errors
        if (e.isRetryable && retryCount.value < maxRetries) {
          retryCount.value++
          console.log(
            `Retrying search (attempt ${retryCount.value}/${maxRetries})`
          )
          // Wait before retrying (exponential backoff)
          setTimeout(
            () => performSearch(reset),
            Math.pow(2, retryCount.value) * 1000
          )
          return // Don't set loading to false yet
        }

        // Don't allow more results if it's a client error (4xx)
        if (e.statusCode && e.statusCode >= 400 && e.statusCode < 500) {
          hasMoreResults.value = false
        }
      } else {
        // Fallback for unexpected errors
        error.value = 'Failed to load images. Please try again.'
        hasMoreResults.value = false
      }
    } finally {
      loading.value = false
      isTyping.value = false
    }
  }

  watch(
    query,
    () => {
      isTyping.value = true
      if (typingTimeout.value) clearTimeout(typingTimeout.value)

      typingTimeout.value = setTimeout(() => {
        performSearch(true) // reset on new query
      }, 300) as unknown as number
    },
    { immediate: false }
  )

  // Manual load more (for scroll or infinite scroll)
  const loadMore = () => {
    if (!loading.value && hasMoreResults.value) {
      performSearch(false)
    }
  }

  const setColorFilter = (color: string | null) => {
    activeColor.value = color
  }

  // Fixed filteredPhotos: maintains distance-based sort within each batch,
  // but batches are kept in order (new batches append at the end)
  const filteredPhotos = computed(() => {
    if (!activeColor.value) return photos.value

    const targetLab = getLab(activeColor.value)
    if (!targetLab) return photos.value

    // Group photos by batch (page they were fetched from)
    const photosByBatch = new Map<number, Array<{ photo: Img; distance: number }>>()

    photos.value.forEach((photo) => {
      const photoLab = getLab(photo.avg_color)
      if (!photoLab) return

      const distance = colorDistance(activeColor.value!, photo.avg_color)
      if (distance > COLOR_TOLERANCE) return

      const batch = photoBatch.get(photo.id) ?? 0
      if (!photosByBatch.has(batch)) {
        photosByBatch.set(batch, [])
      }
      photosByBatch.get(batch)!.push({ photo, distance })
    })

    // Sort each batch by distance, then combine batches in order
    const sortedBatches: Img[] = []
    const batchNumbers = Array.from(photosByBatch.keys()).sort((a, b) => a - b)

    batchNumbers.forEach((batchNum) => {
      const batchPhotos = photosByBatch.get(batchNum)!
      // Sort this batch by distance
      batchPhotos.sort((a, b) => a.distance - b.distance)
      // Append photos from this batch
      sortedBatches.push(...batchPhotos.map(({ photo }) => photo))
    })

    return sortedBatches
  })

  // result count
  const resultCount = computed(() => {
    const list = activeColor.value ? filteredPhotos.value : photos.value
    return list.length
  })

  // init
  // Avoid hitting the external API automatically during unit tests.
  // Vite/Vitest set import.meta.env.MODE === 'test' when running tests.
  if (import.meta.env.MODE !== 'test') {
    performSearch(true)
  }

  return {
    photos,
    filteredPhotos,
    query,
    loading,
    hasMoreResults,
    error,
    isTyping,
    resultCount,
    activeColor,
    performSearch,
    loadMore,
    setColorFilter,
  }
})

