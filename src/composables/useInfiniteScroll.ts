import { onMounted, onUnmounted } from 'vue'

export interface InfiniteScrollOptions {
  threshold?: number
  onLoadMore: () => void
  isLoading?: () => boolean
  hasMore?: () => boolean
}

export const useInfiniteScroll = (options: InfiniteScrollOptions) => {
  const {
    threshold = 300,
    onLoadMore,
    isLoading = () => false,
    hasMore = () => true,
  } = options

  const handleScroll = () => {
    if (isLoading() || !hasMore()) return

    const scrollPosition = window.innerHeight + window.scrollY
    const fullHeight = document.documentElement.offsetHeight

    if (scrollPosition >= fullHeight - threshold) {
      onLoadMore()
    }
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
}

