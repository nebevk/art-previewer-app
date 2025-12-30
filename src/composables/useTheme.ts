import { onMounted } from 'vue'
import { usePreferencesStore } from '@/stores/preferences'

export const useTheme = () => {
  const preferencesStore = usePreferencesStore()

  onMounted(() => {
    preferencesStore.initTheme()
  })

  const toggleTheme = () => {
    const newTheme = preferencesStore.theme === 'dark' ? 'light' : 'dark'
    preferencesStore.setTheme(newTheme)
  }

  return {
    theme: preferencesStore.theme,
    toggleTheme,
    setTheme: preferencesStore.setTheme,
  }
}

