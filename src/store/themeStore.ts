import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark'

function applyDomTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', mode === 'dark')
}

export const useThemeStore = create(
  persist<{
    theme: ThemeMode
    setTheme: (t: ThemeMode) => void
    toggleTheme: () => void
  }>(
    (set, get) => ({
      theme: 'light',
      setTheme: (t) => {
        set({ theme: t })
        applyDomTheme(t)
      },
      toggleTheme: () => {
        const next: ThemeMode = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: next })
        applyDomTheme(next)
      },
    }),
    {
      name: 'exam-platform-theme',
      onRehydrateStorage: () => (state) => {
        if (state?.theme) applyDomTheme(state.theme)
      },
    },
  ),
)
