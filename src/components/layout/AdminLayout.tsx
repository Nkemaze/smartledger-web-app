import { NavLink, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/lib/auth/AuthContext'

const navItems = [
  { to: '/admin', label: 'Overview', icon: 'dashboard', end: true },
  { to: '/admin/inbox', label: 'Inbox', icon: 'forum', end: false },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      <header className="sticky top-0 z-30 h-16 bg-surface-container-lowest border-b border-outline-variant/20 flex items-center px-lg gap-lg">
        <div className="flex items-center gap-sm">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-primary text-on-primary flex items-center justify-center">
            <Icon name="shield_person" className="text-[20px]" filled />
          </span>
          <div className="leading-tight hidden sm:block">
            <p className="font-headline font-bold text-[15px]">Platform Console</p>
            <p className="text-[11px] text-on-surface-variant">SmartLedger super-admin</p>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `inline-flex items-center gap-sm px-md py-2 rounded-xl font-label text-label-md transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`
              }
            >
              <Icon name={item.icon} className="text-[20px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-md">
          <span className="hidden md:block text-[13px] text-on-surface-variant">
            {user?.name} · {user?.email}
          </span>
          <button
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-outline-variant/40 text-on-surface-variant hover:bg-error-container hover:text-error transition-colors font-label text-label-md"
          >
            <Icon name="logout" className="text-[18px]" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-gutter py-xl">{children}</main>
    </div>
  )
}
