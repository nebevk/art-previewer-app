import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePreferencesStore = defineStore(
  'preferences',
  () => {
    const theme = ref<'light' | 'dark'>('dark')

    const setTheme = (value: 'light' | 'dark') => {
      theme.value = value
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', value)
      }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('theme', value)
      }
    }

    const initTheme = () => {
      if (typeof window === 'undefined') return

      const stored = window.localStorage.getItem('theme')
      if (stored === 'light' || stored === 'dark') {
        setTheme(stored)
      } else if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        setTheme('dark')
      } else {
        setTheme('light')
      }
    }

    return {
      theme,
      setTheme,
      initTheme,
    }
  },
  {
    persist: {
      pick: ['theme'],
    },
  }
)

