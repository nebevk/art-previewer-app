import { rgb_to_lab, diff } from 'color-diff'

export const COLOR_TOLERANCE = 25

const labCache = new Map<string, any>()

export const hexToRgb = (
  hex: string
): { R: number; G: number; B: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        R: parseInt(result[1] || '0', 16),
        G: parseInt(result[2] || '0', 16),
        B: parseInt(result[3] || '0', 16),
      }
    : null
}

export const getLab = (hex: string) => {
  if (labCache.has(hex)) return labCache.get(hex)
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  const lab = rgb_to_lab(rgb)
  labCache.set(hex, lab)
  return lab
}

export const colorDistance = (color1: string, color2: string): number => {
  const lab1 = getLab(color1)
  const lab2 = getLab(color2)
  if (!lab1 || !lab2) return Infinity
  return diff(lab1, lab2)
}

