import { ref, nextTick } from 'vue'
import { useGalleryStore } from '@/stores/gallery'

const COLOR_PALETTE = [
  '#ff6b6b',
  '#f9844a',
  '#f9c74f',
  '#90be6d',
  '#43aa8b',
  '#4d908e',
  '#577590',
  '#277da1',
  '#5e60ce',
  '#9b5de5',
  '#ff006e',
  '#8338ec',
  '#3a86ff',
  '#06ffa5',
  '#ffbe0b',
  '#fb5607',
  '#ff4365',
  '#00bbf9',
  '#f15bb5',
  '#000000',
  '#ffffff',
]

export const useColorFilter = () => {
  const galleryStore = useGalleryStore()
  const isColorMenuOpen = ref(false)
  const hexColor = ref('')
  const hexInputRef = ref<HTMLInputElement | null>(null)

  const normalizeHex = (value: string): string | null => {
    let v = value.trim()
    if (!v) return null

    // Remove leading '#', support 3 or 6 hex chars
    if (v.startsWith('#')) v = v.slice(1)

    if (v.length === 3) {
      // Expand short hex (#abc -> #aabbcc)
      v = v
        .split('')
        .map((ch) => ch + ch)
        .join('')
    }

    if (!/^[0-9a-fA-F]{6}$/.test(v)) return null

    return `#${v.toLowerCase()}`
  }

  const selectColor = (color: string | null) => {
    galleryStore.setColorFilter(color)
    isColorMenuOpen.value = false
  }

  const applyHexColor = async () => {
    const normalized = normalizeHex(hexColor.value)
    if (!normalized) return
    hexColor.value = normalized
    selectColor(normalized)

    await nextTick()
    hexInputRef.value?.select()
  }

  return {
    colorPalette: COLOR_PALETTE,
    isColorMenuOpen,
    hexColor,
    hexInputRef,
    activeColor: galleryStore.activeColor,
    selectColor,
    applyHexColor,
    normalizeHex,
  }
}

