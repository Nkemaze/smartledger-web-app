import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-surface font-body text-body-md text-on-surface">
      <Sidebar />
      <Topbar />
      <main className="relative pl-72 pt-16 min-h-screen">
        <div className="mx-auto max-w-[1400px] px-gutter py-xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
