import { useEffect, useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'
const storageKey = 'legacy-wealth-theme'
const themeEvent = 'legacy-wealth-theme-change'
let fallbackTheme: Theme = 'light'
function readTheme(): Theme {
  try { return localStorage.getItem(storageKey) === 'dark' ? 'dark' : 'light' } catch { return fallbackTheme }
}
function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === storageKey || event.key === null) onChange() }
  window.addEventListener(themeEvent, onChange)
  window.addEventListener('storage', onStorage)
  return () => { window.removeEventListener(themeEvent, onChange); window.removeEventListener('storage', onStorage) }
}
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => 'light' as const)
  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
  return { theme, toggleTheme: () => {
    fallbackTheme = readTheme() === 'light' ? 'dark' : 'light'
    try { localStorage.setItem(storageKey, fallbackTheme) } catch { /* Works without device storage. */ }
    window.dispatchEvent(new Event(themeEvent))
  } }
}
