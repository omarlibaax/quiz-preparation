import { useEffect } from 'react'
import { useThemeStore } from '../../store/themeStore'

/** Syncs persisted theme to <html class="dark"> on first paint */
export function ThemeInit() {
  const theme = useThemeStore((s) => s.theme)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  return null
}
