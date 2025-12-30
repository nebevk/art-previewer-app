export interface Img {
  id: number
  alt: string
  photographer: string
  avg_color: string
  src: {
    original: string
    large2x: string
    medium: string
  }
  downloadedAt?: string
}

