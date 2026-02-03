import { Button } from '@heroui/react'
import { NavLink, useNavigate } from 'react-router-dom'
import { BrandLogo } from './BrandLogo'
import { FooterNav } from './FooterNav'
import { ThemeToggle } from './ThemeToggle'
import { ToastHost } from './ToastHost'

type AppLayoutProps = {
  children: React.ReactNode
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `nav-pill text-sm font-medium ${isActive ? 'nav-pill-active' : ''}`

export const AppLayout = ({ children }: AppLayoutProps) => {
  const navigate = useNavigate()

  return (
    <div className="app-shell relative">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="floating-grid h-full w-full" />
      </div>
      <header className="glass-panel sticky-header flex flex-wrap items-center gap-4 border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <BrandLogo />
          <div>
            <div className="text-lg font-semibold text-[color:var(--fg)]">Cognitivia</div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--fg-soft)]">
              Study Intelligence
            </div>
          </div>
        </div>
        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/progress" className={navLinkClass}>
            Progress
          </NavLink>
          <NavLink to="/settings" className={navLinkClass}>
            Settings
          </NavLink>
        </nav>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
          <ThemeToggle compact />
          <Button
            variant="secondary"
            className="bg-white/90 text-black"
            onPress={() => navigate('/')}
          >
            New Session
          </Button>
        </div>
      </header>
      <main className="relative z-10 flex-1 px-6 py-8 pb-24 md:px-10 md:pb-10">
        {children}
      </main>
      <FooterNav />
      <ToastHost />
    </div>
  )
}
