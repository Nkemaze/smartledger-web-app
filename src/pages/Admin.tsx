import { useEffect, useState, useCallback } from 'react'
import { Icon } from '@/components/ui/Icon'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { adminService } from '@/lib/api'
import type {
  AdminStats,
  AdminBusinessRow,
  AdminUserRow,
  ApiSubscriptionRecord,
} from '@/lib/api'

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function planLabel(sub: ApiSubscriptionRecord | null) {
  if (!sub) return { text: 'No plan', tone: 'neutral' as const }
  const now = Date.now()
  const until = sub.plan === 'FREE_TRIAL' ? sub.trialEndsAt : sub.periodEndsAt
  const active = until ? new Date(until).getTime() > now : false
  if (sub.plan === 'FREE_TRIAL') return active ? { text: 'Trial', tone: 'warning' as const } : { text: 'Trial ended', tone: 'error' as const }
  return active ? { text: sub.plan, tone: 'success' as const } : { text: 'Expired', tone: 'error' as const }
}

type Tab = 'businesses' | 'users'

export function Admin() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [tab, setTab] = useState<Tab>('businesses')
  const [search, setSearch] = useState('')
  const [businesses, setBusinesses] = useState<AdminBusinessRow[]>([])
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [s, b, u] = await Promise.all([
        adminService.stats(),
        adminService.businesses({ search: search || undefined }),
        adminService.users({ search: search || undefined }),
      ])
      setStats(s)
      setBusinesses(b.data)
      setUsers(u.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [load])

  const extend = async (id: string) => {
    setBusyId(id)
    try {
      await adminService.extendSubscription(id, 30)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extend subscription')
    } finally {
      setBusyId(null)
    }
  }

  const toggleActive = async (u: AdminUserRow) => {
    setBusyId(u.id)
    try {
      await adminService.setUserActive(u.id, !u.isActive)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-xl">
        <div>
          <h1 className="font-headline text-[28px] font-bold">Platform overview</h1>
          <p className="text-on-surface-variant mt-1">
            Every business, user, and subscription across SmartLedger.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-error-container text-on-error-container px-lg py-md flex items-center gap-sm">
            <Icon name="error" className="text-[20px]" />
            <p className="font-label text-label-md flex-1">{error}</p>
            <button onClick={load} className="font-label text-label-md font-bold underline">
              Retry
            </button>
          </div>
        )}

        {/* KPI grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-lg">
          <StatCard label="Businesses" value={stats?.totalBusinesses ?? '—'} icon="storefront" footnote={`${stats?.newBusinesses30d ?? 0} new in last 30 days`} />
          <StatCard label="Users" value={stats?.totalUsers ?? '—'} icon="group" iconBg="bg-secondary-container" iconColor="text-secondary" />
          <StatCard label="Active subscriptions" value={stats?.activeSubscriptions ?? '—'} icon="verified" />
          <StatCard
            label="Expiring soon"
            value={stats?.subscriptionsExpiringSoon ?? '—'}
            icon="schedule"
            iconBg="bg-amber-100"
            iconColor="text-amber-700"
            footnote={`${stats?.trialingBusinesses ?? 0} on free trial`}
          />
        </div>

        {/* Tabs + search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-md">
          <div className="inline-flex bg-surface-container rounded-full p-1">
            {(['businesses', 'users'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-lg py-1.5 rounded-full font-label text-label-md capitalize transition-colors ${
                  tab === t ? 'bg-surface-container-lowest text-primary font-bold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-sm">
            <Icon name="search" className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tab === 'businesses' ? 'Search businesses…' : 'Search users…'}
              className="w-full pl-11 pr-md py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body text-body-md"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-2xl">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tab === 'businesses' ? (
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container-low/50 text-on-surface-variant font-label text-[11px] uppercase tracking-[0.08em]">
                  <th className="text-left px-lg py-md font-bold">Business</th>
                  <th className="text-left px-lg py-md font-bold">Owner</th>
                  <th className="text-left px-lg py-md font-bold">Subscription</th>
                  <th className="text-left px-lg py-md font-bold">Joined</th>
                  <th className="text-right px-lg py-md font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {businesses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-lg py-2xl text-center text-on-surface-variant">
                      No businesses found.
                    </td>
                  </tr>
                ) : (
                  businesses.map((b) => {
                    const owner = b.users.find((u) => u.role === 'OWNER') ?? b.users[0]
                    const plan = planLabel(b.subscription)
                    return (
                      <tr key={b.id} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="px-lg py-md">
                          <p className="font-label text-label-md font-bold text-on-surface">{b.name}</p>
                          <p className="text-[12px] text-on-surface-variant capitalize">{b.shopType} · {b.currency}</p>
                        </td>
                        <td className="px-lg py-md">
                          {owner ? (
                            <>
                              <p className="font-label text-label-md text-on-surface">{owner.name}</p>
                              <p className="text-[12px] text-on-surface-variant">{owner.email ?? owner.phone}</p>
                            </>
                          ) : (
                            <span className="text-on-surface-variant">—</span>
                          )}
                        </td>
                        <td className="px-lg py-md">
                          <Badge tone={plan.tone}>{plan.text}</Badge>
                        </td>
                        <td className="px-lg py-md text-on-surface-variant">{formatDate(b.createdAt)}</td>
                        <td className="px-lg py-md text-right">
                          <button
                            disabled={busyId === b.id}
                            onClick={() => extend(b.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/40 text-primary hover:bg-primary/10 transition-colors font-label text-label-sm font-bold disabled:opacity-50"
                          >
                            <Icon name="add_circle" className="text-[16px]" />
                            Extend 30d
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container-low/50 text-on-surface-variant font-label text-[11px] uppercase tracking-[0.08em]">
                  <th className="text-left px-lg py-md font-bold">User</th>
                  <th className="text-left px-lg py-md font-bold">Business</th>
                  <th className="text-left px-lg py-md font-bold">Role</th>
                  <th className="text-left px-lg py-md font-bold">Status</th>
                  <th className="text-right px-lg py-md font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-lg py-2xl text-center text-on-surface-variant">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-lg py-md">
                        <p className="font-label text-label-md font-bold text-on-surface">{u.name}</p>
                        <p className="text-[12px] text-on-surface-variant">{u.email ?? u.phone}</p>
                      </td>
                      <td className="px-lg py-md text-on-surface-variant">
                        {u.business?.name ?? <span className="italic">Platform account</span>}
                      </td>
                      <td className="px-lg py-md">
                        <Badge tone={u.platformAdmin ? 'info' : 'neutral'}>
                          {u.platformAdmin ? 'Platform admin' : u.role}
                        </Badge>
                      </td>
                      <td className="px-lg py-md">
                        <Badge tone={u.isActive ? 'success' : 'error'} dot>
                          {u.isActive ? 'Active' : 'Suspended'}
                        </Badge>
                      </td>
                      <td className="px-lg py-md text-right">
                        <button
                          disabled={busyId === u.id || u.platformAdmin}
                          onClick={() => toggleActive(u)}
                          title={u.platformAdmin ? 'Platform admins cannot be suspended' : undefined}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors font-label text-label-sm font-bold disabled:opacity-40 ${
                            u.isActive
                              ? 'border-error/30 text-error hover:bg-error-container/60'
                              : 'border-primary/30 text-primary hover:bg-primary/10'
                          }`}
                        >
                          <Icon name={u.isActive ? 'block' : 'check_circle'} className="text-[16px]" />
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
