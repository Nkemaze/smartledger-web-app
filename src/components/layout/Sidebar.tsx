import { NavLink, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/lib/auth/AuthContext'

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/sales', label: 'Sales', icon: 'receipt_long' },
  { to: '/inventory', label: 'Inventory', icon: 'inventory_2' },
  { to: '/customers', label: 'Customers', icon: 'groups' },
  { to: '/suppliers', label: 'Suppliers', icon: 'local_shipping' },
  { to: '/tax', label: 'Tax & Compliance', icon: 'account_balance' },
  { to: '/advisor', label: 'AI Advisor', icon: 'smart_toy', badge: 'New' },
  { to: '/reports', label: 'Reports', icon: 'bar_chart' },
  { to: '/staff', label: 'Staff', icon: 'badge' },
]

function Logo() {
  return (
    <div className="pt-5 mb-5 h-16 flex items-center px-lg border-b border-outline-variant/5">
      <img
        src="/smartledger-logo.png"
        alt="SmartLedger Logo"
        className="h-8 w-auto object-contain"
      />
    </div>
  )
}

export function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-lowest z-50 flex flex-col border-r border-outline-variant/10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <Logo />
      <nav className="flex-1 py-lg px-md overflow-y-auto space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-md px-md py-3 rounded-xl transition-all group ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={item.icon} className={`text-md group-hover:scale-110 transition-transform ${isActive ? '' : ''}`} />
                <span className={`font-label text-label-md ${item.badge ? 'font-bold' : ''}`}>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-primary text-on-primary text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
        <div className="pt-xl mt-xl border-t border-outline-variant/10">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-md px-md py-3 rounded-xl transition-all group ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`
            }
          >
            <Icon name="settings" className="text-md group-hover:scale-110 transition-transform" />
            <span className="font-label text-label-md">Settings</span>
          </NavLink>
          <div className="my-md mx-md h-px bg-outline-variant/10" />
          <button
            className="w-full flex items-center gap-md px-md py-3 rounded-xl transition-all group text-on-surface-variant hover:bg-error-container hover:text-error"
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
          >
            <Icon name="logout" className="text-md group-hover:scale-110 transition-transform" />
            <span className="font-label text-label-md">Log out</span>
          </button>
        </div>
      </nav>
    </aside>
  )
}
