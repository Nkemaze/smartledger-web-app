import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { SubscriptionBanner } from './SubscriptionBanner'
import { useAuth } from '@/lib/auth/AuthContext'

export function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { user } = useAuth()

  // Platform super-admins belong in the platform console, not a store shell.
  if (user?.platformAdmin) {
    return <Navigate to="/admin" replace />
  }

  return (
    <div className="min-h-screen bg-surface font-body text-body-md text-on-surface">
      <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <Topbar onMenuClick={() => setMobileNavOpen(true)} />
      <main className="relative lg:pl-72 pt-16 min-h-screen">
        <div className="mx-auto max-w-[1400px] px-gutter py-xl">
          <SubscriptionBanner />
          <Outlet />
        </div>
      </main>
    </div>
  )
}
