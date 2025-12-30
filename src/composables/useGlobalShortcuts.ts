import { onMounted, onBeforeUnmount, nextTick } from 'vue'

export interface GlobalShortcutsCallbacks {
  onEscape?: () => void
  onCtrlI?: () => void
  onCtrlF?: () => void
}

export const useGlobalShortcuts = (callbacks: GlobalShortcutsCallbacks) => {
  const handleGlobalKeydown = (event: KeyboardEvent) => {
    // ESC: close color palette (if open) and clear search query
    if (event.key === 'Escape') {
      if (callbacks.onEscape) {
        callbacks.onEscape()
        event.preventDefault()
        event.stopPropagation()
      }
      return
    }

    // Ctrl + I: open color palette and focus custom hex input
    if (event.ctrlKey && (event.key === 'i' || event.key === 'I')) {
      event.preventDefault()
      if (callbacks.onCtrlI) {
        callbacks.onCtrlI()
      }
      return
    }

    // Ctrl + F: focus search input (instead of browser find)
    if (event.ctrlKey && (event.key === 'f' || event.key === 'F')) {
      event.preventDefault()
      if (callbacks.onCtrlF) {
        callbacks.onCtrlF()
      }
    }
  }

  onMounted(() => {
    if (typeof window === 'undefined') return
    window.addEventListener('keydown', handleGlobalKeydown)
  })

  onBeforeUnmount(() => {
    if (typeof window === 'undefined') return
    window.removeEventListener('keydown', handleGlobalKeydown)
  })
}

