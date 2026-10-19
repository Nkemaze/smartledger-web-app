import { NavLink, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/lib/auth/AuthContext'

type NavItem = {
  to: string
  label: string
  icon: string
  end?: boolean
  badge?: string
}

const navGroups: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
      { to: '/sales', label: 'Sales', icon: 'receipt_long' },
      { to: '/inventory', label: 'Inventory', icon: 'inventory_2' },
      { to: '/inbox', label: 'Inbox', icon: 'forum' },
    ],
  },
  {
    title: 'Relationships',
    items: [
      { to: '/customers', label: 'Customers', icon: 'groups' },
      { to: '/suppliers', label: 'Suppliers', icon: 'local_shipping' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { to: '/advisor', label: 'AI Advisor', icon: 'psychology', badge: 'New' },
      { to: '/reports', label: 'Reports', icon: 'bar_chart' },
      { to: '/tax', label: 'Tax & Compliance', icon: 'account_balance' },
    ],
  },
  {
    title: 'Administration',
    items: [
      { to: '/staff', label: 'Staff', icon: 'badge' },
      { to: '/permissions', label: 'Permissions', icon: 'admin_panel_settings' },
    ],
  },
]

const roleLabels: Record<string, string> = {
  OWNER: 'Administrator',
  SUPERADMIN: 'Platform Admin',
  CASHIER: 'Cashier',
  ACCOUNTANT: 'Accountant',
}

export function Sidebar({
  mobileOpen = false,
  onClose,
}: {
  mobileOpen?: boolean
  onClose?: () => void
}) {
  const { user, business, logout } = useAuth()
  const navigate = useNavigate()

  const initial = (business?.name || user?.name || 'S').charAt(0).toUpperCase()
  const shopType = business?.shopType
    ? business.shopType.charAt(0).toUpperCase() + business.shopType.slice(1)
    : 'Business account'

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative flex items-center gap-md px-md py-2.5 rounded-xl transition-all group ${
      isActive
        ? 'bg-primary/10 text-primary font-semibold'
        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
    }`

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[45] bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-surface-container-lowest z-50 flex flex-col border-r border-outline-variant/20 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center gap-md px-lg border-b border-outline-variant/20 flex-shrink-0">
          <img src="/smartledger-logo.png" alt="SmartLedger" className="h-8 w-auto object-contain" />
          <button
            className="lg:hidden ml-auto p-1.5 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors"
            onClick={onClose}
            aria-label="Close menu"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Business identity */}
        <div className="px-md pt-md flex-shrink-0">
          <div className="flex items-center gap-md px-md py-sm rounded-xl bg-surface-container-low border border-outline-variant/20">
            <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center font-headline font-bold text-[15px] flex-shrink-0">
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-label text-label-md font-bold text-on-surface truncate">
                {business?.name ?? 'My Business'}
              </p>
              <p className="text-[11px] text-on-surface-variant truncate">{shopType}</p>
            </div>
            <Icon name="unfold_more" className="text-[18px] text-on-surface-variant flex-shrink-0" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-md py-md space-y-lg">
          {navGroups.map((group, gi) => (
            <div key={group.title ?? `group-${gi}`} className="space-y-1">
              {group.title && (
                <p className="px-md pb-1 font-label text-[10px] font-bold uppercase tracking-[0.12em] text-outline">
                  {group.title}
                </p>
              )}
              {group.items.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} onClick={onClose} className={linkClass}>
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute -left-md top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-primary" />
                      )}
                      <Icon
                        name={item.icon}
                        filled={isActive}
                        className="text-[21px] transition-transform group-hover:scale-105"
                      />
                      <span className="font-label text-label-md">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-primary text-on-primary text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer account */}
        <div className="border-t border-outline-variant/20 px-md py-md flex-shrink-0 space-y-1">
          <NavLink to="/settings" onClick={onClose} className={linkClass}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute -left-md top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-primary" />
                )}
                <Icon name="settings" filled={isActive} className="text-[21px] transition-transform group-hover:scale-105" />
                <span className="font-label text-label-md">Settings</span>
              </>
            )}
          </NavLink>

          <div className="flex items-center gap-md px-md py-2">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[13px] flex-shrink-0">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-label text-label-md font-semibold text-on-surface truncate">
                {user?.name ?? 'User'}
              </p>
              <p className="text-[11px] text-on-surface-variant truncate">
                {roleLabels[user?.role ?? 'OWNER'] ?? user?.role}
              </p>
            </div>
            <button
              className="p-1.5 rounded-full text-on-surface-variant hover:bg-error-container hover:text-error transition-colors flex-shrink-0"
              title="Log out"
              onClick={() => {
                onClose?.()
                logout()
                navigate('/login', { replace: true })
              }}
            >
              <Icon name="logout" className="text-[20px]" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
