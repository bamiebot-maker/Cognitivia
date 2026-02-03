import { NavLink } from 'react-router-dom'

type DockItem = {
  to: string
  label: string
  icon: React.ReactNode
}

const items: DockItem[] = [
  {
    to: '/',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dock-icon">
        <path
          d="M4 10.5L12 4l8 6.5v7.5a2 2 0 0 1-2 2h-4v-6H10v6H6a2 2 0 0 1-2-2z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    to: '/progress',
    label: 'Progress',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dock-icon">
        <path
          d="M5 12a7 7 0 0 1 14 0"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 12l4-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="dock-icon">
        <path
          d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm8 4-2 1 .2 2.2-2 1.4-1.7-1.4-2 .8-.6 2.2H9.1l-.6-2.2-2-.8-1.7 1.4-2-1.4.2-2.2-2-1 2-1-.2-2.2 2-1.4 1.7 1.4 2-.8.6-2.2h2.8l.6 2.2 2 .8 1.7-1.4 2 1.4-.2 2.2z"
          fill="currentColor"
        />
      </svg>
    ),
  },
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `dock-item ${isActive ? 'dock-item-active' : ''}`

export const FooterNav = () => {
  return (
    <footer className="mobile-dock md:hidden">
      <div className="mobile-dock-bump" />
      <nav className="mobile-dock-nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={navLinkClass}
          >
            <span className="dock-icon-wrap">{item.icon}</span>
            <span className="dock-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </footer>
  )
}
