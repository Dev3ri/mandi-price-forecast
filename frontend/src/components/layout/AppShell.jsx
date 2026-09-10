import { BarChart3, Bell, MapPin, Scale, Sprout } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/', label: 'Rates', icon: BarChart3, end: true },
  { to: '/compare', label: 'Compare', icon: Scale },
  { to: '/nearby', label: 'Nearby', icon: MapPin },
]

function navClass({ isActive }) {
  return cn(
    'flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-white/15 text-white' : 'text-brand-100 hover:bg-white/10 hover:text-white',
  )
}

export function AppShell({ children, onSetAlert }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 bg-brand-800 text-white shadow-sm">
        <div className="container flex h-16 items-center gap-3">
          <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <Sprout className="size-6 text-accent-400" />
            <span className="text-lg tracking-tight">Mandi Setu</span>
          </NavLink>
          <nav className="ml-4 hidden items-center gap-1 sm:flex">
            {NAV.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={navClass}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto">
            <Button variant="accent" size="sm" onClick={onSetAlert}>
              <Bell />
              <span className="hidden sm:inline">Price alert</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container flex-1 pb-24 pt-4 sm:pb-10">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 backdrop-blur sm:hidden">
        <div className="grid grid-cols-3">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 py-2.5 text-xs font-medium',
                  isActive ? 'text-brand-800' : 'text-muted-foreground',
                )
              }
            >
              <Icon className="size-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <footer className="hidden border-t border-border bg-white py-6 text-center text-xs text-muted-foreground sm:block">
        Prices in ₹ per quintal, sourced from Agmarknet records for Punjab mandis. Forecasts are estimates,
        not guarantees.
      </footer>
    </div>
  )
}
