import { useEffect, useMemo, useState } from 'react'
import { useSettings } from '../context/SettingsContext'

export const BrandLogo = () => {
  const [useFallback, setUseFallback] = useState(false)
  const { settings } = useSettings()

  const logoSrc = useMemo(
    () => (settings.theme === 'dark' ? '/cognitivia-dark.png' : '/cognitivia-light.png'),
    [settings.theme],
  )

  useEffect(() => {
    setUseFallback(false)
  }, [logoSrc])

  return (
    <div className="logo-frame flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl shadow-lg">
      {!useFallback ? (
        <img
          src={logoSrc}
          alt="Cognitivia logo"
          className="logo-image h-full w-full object-contain"
          onError={() => setUseFallback(true)}
        />
      ) : (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M5 5.5C5 4.12 6.12 3 7.5 3H11.5C12.33 3 13 3.67 13 4.5V20.5C13 21.05 12.55 21.5 12 21.5H7.5C6.12 21.5 5 20.38 5 19V5.5Z"
            fill="white"
            fillOpacity="0.92"
          />
          <path
            d="M19 5.5C19 4.12 17.88 3 16.5 3H12.5C11.67 3 11 3.67 11 4.5V20.5C11 21.05 11.45 21.5 12 21.5H16.5C17.88 21.5 19 20.38 19 19V5.5Z"
            fill="white"
            fillOpacity="0.75"
          />
          <path d="M11.5 6H18" stroke="#0f172a" strokeOpacity="0.25" strokeWidth="1.4" />
          <path d="M11.5 9H18" stroke="#0f172a" strokeOpacity="0.25" strokeWidth="1.4" />
        </svg>
      )}
    </div>
  )
}
