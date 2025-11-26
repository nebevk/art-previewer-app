import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import axios from 'axios'
import { useBrainsStore, type Img } from './brains'

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

const mockedAxios = axios as unknown as {
  get: ReturnType<typeof vi.fn>
}

describe('brains store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with default state', () => {
    const store = useBrainsStore()

    expect(store.query).toBe('art')
    expect(store.photos).toEqual([])
    expect(store.downloadHistory).toEqual([])
    expect(store.activeColor).toBeNull()
  })

  it('performSearch populates photos and updates flags on success', async () => {
    const store = useBrainsStore()

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        photos: [
          {
            id: 1,
            alt: 'Test image',
            photographer: 'Alice',
            avg_color: '#ffffff',
            src: {
              original: 'https://example.com/original.jpg',
              large2x: 'https://example.com/large2x.jpg',
              medium: 'https://example.com/medium.jpg',
            },
          },
        ],
      },
    } as any)

    await store.performSearch(true)

    expect(mockedAxios.get).toHaveBeenCalledOnce()
    expect(store.photos).toHaveLength(1)
    expect(store.photos[0]?.id).toBe(1)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
    // Only 1 photo mocked, so there are no more pages -> hasMoreResults should be false
    expect(store.hasMoreResults).toBe(false)
  })

  it('addToHistory adds downloadedAt and moves existing entry to top', () => {
    const store = useBrainsStore()

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

  it('setColorFilter updates activeColor and filteredPhotos reacts', () => {
    const store = useBrainsStore()

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


