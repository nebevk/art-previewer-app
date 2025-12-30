import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useHistoryStore } from '@/stores/history'
import type { Img } from '@/types/media'

describe('history store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with empty history', () => {
    const store = useHistoryStore()

    expect(store.downloadHistory).toEqual([])
  })

  it('addToHistory adds downloadedAt and moves existing entry to top', () => {
    const store = useHistoryStore()

    const base: Img = {
      id: 42,
      alt: 'History test',
      photographer: 'Bob',
      avg_color: '#000000',
      src: {
        original: 'orig',
        large2x: 'large',
        medium: 'medium',
      },
    }

    store.addToHistory(base)
    expect(store.downloadHistory).toHaveLength(1)
    expect(store.downloadHistory[0]?.id).toBe(42)
    expect(store.downloadHistory[0]?.downloadedAt).toBeDefined()

    // Add again – should not duplicate, but move to top
    store.addToHistory(base)
    expect(store.downloadHistory).toHaveLength(1)
    expect(store.downloadHistory[0]?.id).toBe(42)
  })

  it('clearDownloadHistory removes all history', () => {
    const store = useHistoryStore()

    const photo: Img = {
      id: 1,
      alt: 'Test',
      photographer: 'Test',
      avg_color: '#000000',
      src: {
        original: 'orig',
        large2x: 'large',
        medium: 'medium',
      },
    }

    store.addToHistory(photo)
    expect(store.downloadHistory).toHaveLength(1)

    store.clearDownloadHistory()
    expect(store.downloadHistory).toHaveLength(0)
  })
})

