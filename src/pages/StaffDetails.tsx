import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Icon } from '@/components/ui/Icon'
import { staffService } from '@/lib/api'
import type { StaffPerformance } from '@/lib/api'

const tabs = ['Personal Info', 'Performance']

const roleLabels: Record<string, string> = {
  OWNER: 'Admin',
  CASHIER: 'Cashier',
  ACCOUNTANT: 'Accountant',
}

const money = (v: number | string | null | undefined) => `FCFA ${Math.round(Number(v ?? 0)).toLocaleString()}`

export function StaffDetails() {
  const { id = '' } = useParams()
  const [tab, setTab] = useState('Personal Info')
  const [member, setMember] = useState<StaffPerformance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setMember(await staffService.performance(id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load staff member.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [id])

  const s = member?.stats

  return (
    <div className="space-y-xl">
      <Link to="/staff" className="inline-flex items-center gap-1 font-label text-label-md text-on-surface-variant hover:text-primary transition-colors">
        <Icon name="arrow_back" className="text-[18px]" />
        Back to Team Directory
      </Link>

      {error && (
        <Card className="p-xl flex flex-col items-center justify-center text-center gap-md bg-error-container/30">
          <Icon name="error_outline" className="text-error text-[32px]" />
          <p className="font-body text-body-md text-error">{error}</p>
          <button className="h-10 px-lg bg-primary text-on-primary rounded-xl font-label text-label-md font-bold" onClick={() => void load()}>
            Retry
          </button>
        </Card>
      )}

      {loading && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && !error && member && (
        <>
          <Card className="p-xl">
            <div className="flex flex-col md:flex-row md:items-center gap-lg">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center font-headline text-headline-lg text-primary">
                  {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                {member.isActive && (
                  <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center">
                    <Icon name="verified" className="text-[16px]" />
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h1 className="font-headline text-headline-lg text-on-surface flex items-center gap-md">
                  {member.name}
                  {member.isActive ? (
                    <Badge tone="success" icon="verified">
                      Active
                    </Badge>
                  ) : (
                    <Badge tone="neutral">Inactive</Badge>
                  )}
                </h1>
                <p className="font-label text-label-md text-primary font-bold mb-1">{roleLabels[member.role] ?? member.role}</p>
                <div className="flex items-center gap-lg mt-md text-[12px] text-on-surface-variant flex-wrap">
                  {member.phone && (
                    <span className="flex items-center gap-1">
                      <Icon name="call" className="text-primary" />
                      {member.phone}
                    </span>
                  )}
                  {member.email && (
                    <span className="flex items-center gap-1">
                      <Icon name="mail" className="text-primary" />
                      {member.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Icon name="calendar_today" className="text-primary" />
                    Joined {new Date(member.createdAt).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-md">
                <button className="flex items-center gap-2 h-11 px-lg bg-surface-container rounded-xl font-label text-label-md font-bold text-on-surface hover:bg-surface-container-high transition-colors">
                  <Icon name="chat" className="text-primary" />
                  Message
                </button>
                <button className="flex items-center gap-2 h-11 px-lg bg-primary text-on-primary rounded-xl font-label text-label-md font-bold shadow-lg shadow-primary/25 hover:bg-primary-container transition-colors">
                  <Icon name="edit" />
                  Edit Profile
                </button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            <div className="bg-surface-container-lowest rounded-2xl p-xl shadow-sm">
              <div className="flex items-center justify-between mb-lg">
                <div>
                  <p className="font-label text-label-md text-on-surface-variant mb-1">Sales Generated (Month)</p>
                  <h2 className="font-headline text-headline-lg text-on-surface">{money(s?.monthRevenue)}</h2>
                  <p className="font-label text-label-sm text-on-surface-variant mt-1">{s?.monthTransactions ?? 0} transactions this month</p>
                </div>
                <span className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon name="payments" />
                </span>
              </div>
              {Number(s?.monthlyTarget ?? 0) > 0 && (
                <div>
                  <div className="flex justify-between text-[12px] text-on-surface-variant mb-1">
                    <span>Target: {money(s?.monthlyTarget)}</span>
                    <span className="font-bold text-primary">{s?.targetProgress ?? 0}%</span>
                  </div>
                  <ProgressBar value={Math.min(100, Number(s?.targetProgress ?? 0))} color="bg-primary" height="h-1.5" />
                </div>
              )}
            </div>
            <div className="bg-surface-container-lowest rounded-2xl p-xl shadow-sm">
              <div className="flex items-center justify-between mb-lg">
                <div>
                  <p className="font-label text-label-md text-on-surface-variant mb-1">Total Sales (All Time)</p>
                  <h2 className="font-headline text-headline-lg text-on-surface">{money(s?.totalSales)}</h2>
                  <p className="font-label text-label-sm text-on-surface-variant mt-1">{s?.totalTransactions ?? 0} total transactions</p>
                </div>
                <span className="w-11 h-11 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <Icon name="analytics" />
                </span>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl p-xl shadow-sm">
              <div className="flex items-center justify-between mb-lg">
                <div>
                  <p className="font-label text-label-md text-on-surface-variant mb-1">Average Sale</p>
                  <h2 className="font-headline text-headline-lg text-on-surface">{money(s?.averageSale)}</h2>
                  <p className="font-label text-label-sm text-on-surface-variant mt-1">
                    {s?.targetProgress != null ? `${s.targetProgress}% of monthly target` : 'No monthly target set'}
                  </p>
                </div>
                <span className="w-11 h-11 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center">
                  <Icon name="trending_up" />
                </span>
              </div>
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="px-xl pt-lg border-b border-outline-variant/5">
              <div className="flex items-center gap-md overflow-x-auto pb-0">
                {tabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`whitespace-nowrap pb-3 px-1 font-label text-label-md transition-all border-b-2 -mb-px ${
                      tab === t
                        ? 'border-primary text-primary font-bold'
                        : 'border-transparent text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-xl">
              {tab === 'Personal Info' && (
                <div className="max-w-2xl">
                  <h3 className="font-headline text-title-lg text-on-surface mb-lg">General Information</h3>
                  <div className="space-y-md">
                    {[
                      { label: 'Full Name', value: member.name },
                      { label: 'Phone', value: member.phone },
                      { label: 'Email', value: member.email ?? '—' },
                      { label: 'Role', value: roleLabels[member.role] ?? member.role },
                      { label: 'Joined Date', value: new Date(member.createdAt).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' }) },
                      { label: 'Status', badge: true },
                    ].map((f) => (
                      <div key={f.label} className="flex items-center justify-between py-2 border-b border-outline-variant/5">
                        <span className="font-label text-label-sm text-on-surface-variant">{f.label}</span>
                        {f.badge ? (
                          <Badge tone={member.isActive ? 'success' : 'neutral'}>{member.isActive ? 'Active' : 'Inactive'}</Badge>
                        ) : (
                          <span className="font-label text-label-md font-bold text-on-surface">{f.value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {tab === 'Performance' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-lg max-w-4xl">
                  {[
                    { label: 'Month Transactions', value: (s?.monthTransactions ?? 0).toString(), icon: 'point_of_sale', cls: 'bg-primary/10 text-primary' },
                    { label: 'Total Transactions', value: (s?.totalTransactions ?? 0).toString(), icon: 'receipt_long', cls: 'bg-secondary/10 text-secondary' },
                    { label: 'Average Sale', value: money(s?.averageSale), icon: 'payments', cls: 'bg-tertiary/10 text-tertiary' },
                  ].map((kpi) => (
                    <div key={kpi.label} className="p-lg bg-surface-container-low/60 rounded-xl flex items-center gap-md">
                      <span className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${kpi.cls}`}>
                        <Icon name={kpi.icon} />
                      </span>
                      <div>
                        <p className="font-headline text-title-lg text-on-surface">{kpi.value}</p>
                        <p className="font-label text-label-sm text-on-surface-variant">{kpi.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
