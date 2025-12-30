import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { searchPexels } from '@/services/pexelsApi'
import { useGalleryStore } from '@/stores/gallery'
import type { Img } from '@/types/media'

vi.mock('@/services/pexelsApi', () => ({
  searchPexels: vi.fn(),
}))

const mockedSearchPexels = searchPexels as ReturnType<typeof vi.fn>

describe('gallery store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with default state', () => {
    const store = useGalleryStore()

    expect(store.query).toBe('art')
    expect(store.photos).toEqual([])
    expect(store.activeColor).toBeNull()
  })

  it('performSearch populates photos and updates flags on success', async () => {
    const store = useGalleryStore()

    const mockPhoto: Img = {
      id: 1,
      alt: 'Test image',
      photographer: 'Alice',
      avg_color: '#ffffff',
      src: {
        original: 'https://example.com/original.jpg',
        large2x: 'https://example.com/large2x.jpg',
        medium: 'https://example.com/medium.jpg',
      },
    }

    mockedSearchPexels.mockResolvedValueOnce([mockPhoto])

    await store.performSearch(true)

    expect(mockedSearchPexels).toHaveBeenCalledOnce()
    expect(store.photos).toHaveLength(1)
    expect(store.photos[0]?.id).toBe(1)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
    // Only 1 photo mocked, so there are no more pages -> hasMoreResults should be false
    expect(store.hasMoreResults).toBe(false)
  })

  it('setColorFilter updates activeColor and filteredPhotos reacts', () => {
    const store = useGalleryStore()

    const img: Img = {
      id: 7,
      alt: 'Color test',
      photographer: 'Carol',
      avg_color: '#ffffff',
      src: {
        original: 'orig',
        large2x: 'large',
        medium: 'medium',
      },
    }

    // manually seed photos
    store.photos = [img]

    // no active color → filteredPhotos should equal photos
    expect(store.filteredPhotos).toHaveLength(1)

    store.setColorFilter('#ffffff')
    expect(store.activeColor).toBe('#ffffff')

    // With a matching color, image should still be present
    expect(store.filteredPhotos).toHaveLength(1)
    expect(store.filteredPhotos[0]?.id).toBe(7)
  })
})

