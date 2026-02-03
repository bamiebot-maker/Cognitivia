import { useSettings } from '../context/SettingsContext'

type ThemeToggleProps = {
  compact?: boolean
}

export const ThemeToggle = ({ compact }: ThemeToggleProps) => {
  const { settings, updateSettings } = useSettings()
  const isDark = settings.theme === 'dark'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={!isDark}
      className={`theme-toggle ${compact ? 'theme-toggle-compact' : ''}`}
      data-theme={isDark ? 'dark' : 'light'}
      onClick={() => updateSettings({ theme: isDark ? 'light' : 'dark' })}
    >
      {!compact && (
        <span className="theme-toggle-label">{isDark ? 'Dark mode' : 'Light mode'}</span>
      )}
      <span className="theme-toggle-track">
        <span className="theme-toggle-thumb" />
      </span>
    </button>
  )
}
