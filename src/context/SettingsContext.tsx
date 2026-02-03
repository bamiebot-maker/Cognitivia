import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Settings } from '../data/types'

const SETTINGS_KEY = 'study-buddy-settings'

const defaultSettings: Settings = {
  theme: 'dark',
  difficulty: 'medium',
  apiKey: '',
  apiUrl: '',
  model: 'auto',
}

const loadSettings = (): Settings => {
  if (typeof localStorage === 'undefined') {
    return defaultSettings
  }
  const raw = localStorage.getItem(SETTINGS_KEY)
  if (!raw) {
    return defaultSettings
  }
  try {
    const parsed = JSON.parse(raw) as Partial<Settings>
    return { ...defaultSettings, ...parsed }
  } catch {
    return defaultSettings
  }
}

const saveSettings = (settings: Settings) => {
  if (typeof localStorage === 'undefined') {
    return
  }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

type SettingsContextValue = {
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export const SettingsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => loadSettings())

  useEffect(() => {
    saveSettings(settings)
    const root = document.documentElement
    if (settings.theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }

    const iconHref = settings.theme === 'dark' ? '/cognitivia-dark.png' : '/cognitivia-light.png'
    const iconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null
    if (iconLink) {
      iconLink.href = iconHref
    }
    const appleLink = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null
    if (appleLink) {
      appleLink.href = iconHref
    }
  }, [settings])

  const value = useMemo(
    () => ({
      settings,
      updateSettings: (updates: Partial<Settings>) =>
        setSettings((current) => ({ ...current, ...updates })),
      resetSettings: () => setSettings(defaultSettings),
    }),
    [settings],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}
