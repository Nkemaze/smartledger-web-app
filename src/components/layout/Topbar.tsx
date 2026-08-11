import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/lib/auth/AuthContext'
import { notificationService } from '@/lib/api'

const roleLabels: Record<string, string> = {
  OWNER: 'Admin',
  CASHIER: 'Cashier',
  ACCOUNTANT: 'Accountant',
}

export function Topbar({
  searchPlaceholder = 'Search transactions, inventory or customers...',
  onMenuClick,
}: {
  searchPlaceholder?: string
  onMenuClick?: () => void
}) {
  const { user, business, logout } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    notificationService
      .unreadCount()
      .then((r) => setUnread(Number(r.count)))
      .catch(() => {})
  }, [])

  const firstName = (user?.name || 'Store Owner').split(' ')[0]
  const initial = (user?.name || 'S').charAt(0).toUpperCase()

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface/80 backdrop-blur-xl z-40 px-md sm:px-xl flex items-center justify-between border-b border-outline-variant/5 shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
      <button
        className="lg:hidden p-2 -ml-sm text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Icon name="menu" />
      </button>
      <div className="flex-1 max-w-xl mx-auto hidden md:block">
        <div className="relative flex items-center group">
          <Icon
            name="search"
            className="absolute left-md text-on-surface-variant group-focus-within:text-primary transition-colors"
          />
          <input
            className="w-full bg-surface-container-low border-none rounded-full py-2 pl-12 pr-md focus:ring-2 focus:ring-primary/20 text-body-md transition-all"
            placeholder={searchPlaceholder}
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-sm sm:gap-lg ml-auto md:ml-xl">
        <button className="md:hidden p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
          <Icon name="search" />
        </button>
        <button className="relative p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
          <Icon name="notifications" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-on-error text-[10px] font-bold flex items-center justify-center ring-2 ring-surface">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
        <div className="relative">
          <div className="flex items-center gap-md pl-lg border-l border-outline-variant/20 group cursor-pointer" onClick={() => setMenuOpen((v) => !v)}>
            <div className="text-right hidden lg:block">
              <p className="font-label text-label-md font-bold text-on-surface">{firstName}</p>
              <p className="text-[11px] text-on-surface-variant">
                {roleLabels[user?.role ?? 'OWNER']} • {business?.name ?? 'HQ Branch'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all flex-shrink-0 flex items-center justify-center bg-primary-container text-primary font-headline font-bold">
              {initial}
            </div>
          </div>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 z-20 w-56 bg-surface-container-lowest rounded-xl shadow-xl ring-1 ring-outline-variant/20 overflow-hidden">
                <div className="px-md py-sm border-b border-outline-variant/20">
                  <p className="font-label text-label-md font-bold text-on-surface">{user?.name}</p>
                  <p className="text-[11px] text-on-surface-variant">{user?.email || user?.phone}</p>
                </div>
                <button
                  className="w-full flex items-center gap-2 px-md py-2.5 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors font-label text-label-md"
                  onClick={() => {
                    setMenuOpen(false)
                    navigate('/settings')
                  }}
                >
                  <Icon name="settings" className="text-[18px]" />
                  Settings
                </button>
                <button
                  className="w-full flex items-center gap-2 px-md py-2.5 text-error hover:bg-error-container/30 transition-colors font-label text-label-md"
                  onClick={() => {
                    setMenuOpen(false)
                    logout()
                    navigate('/login', { replace: true })
                  }}
                >
                  <Icon name="logout" className="text-[18px]" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
