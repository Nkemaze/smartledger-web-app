import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { DonutChart } from '@/components/ui/DonutChart'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/lib/auth/AuthContext'
import { reportService, advisorService, inventoryService } from '@/lib/api'
import type { DashboardData, AdvisorInsight, ApiTransaction } from '@/lib/api'

const n = (v: number | string | null | undefined) => Number(v ?? 0)

const money = (v: number) => `FCFA ${Math.round(v).toLocaleString()}`

function compactMoney(v: number): string {
  if (v >= 1_000_000) return `FCFA ${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `FCFA ${(v / 1_000).toFixed(0)}K`
  return `FCFA ${v}`
}

const EXPENSE_COLORS = ['#006b2c', '#7f3df2', '#e9a800', '#0b6bcb', '#d94841', '#0ca678', '#e8590c', '#364fc7']

function monthLabel(period: string): string {
  const d = new Date(`${period}-01T00:00:00`)
  if (Number.isNaN(d.getTime())) return period
  return d.toLocaleString('en', { month: 'short' })
}

const badgeTone = (status: string) =>
  status === 'Success' ? 'success' : status === 'Pending' ? 'warning' : 'error'

export function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [insight, setInsight] = useState<AdvisorInsight | null>(null)
  const [productCount, setProductCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [d, adv, products] = await Promise.all([
        reportService.dashboard(),
        advisorService.insights(),
        inventoryService.list(),
      ])
      setData(d)
      setInsight(adv.insights[0] ?? null)
      setProductCount(products.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const chart = useMemo(() => {
    if (!data) return { bars: [], max: 1 }
    const revenues = data.salesTrend.map((s) => n(s.revenue))
    return {
      bars: data.salesTrend.map((s) => ({ label: monthLabel(s.period), value: n(s.revenue) })),
      max: Math.max(...revenues, 1),
    }
  }, [data])

  const expenseDonut = useMemo(() => {
    if (!data) return { data: [], total: 0 }
    const total = data.expenseShare.reduce((sum, e) => sum + n(e.amount), 0)
    return {
      total,
      data: data.expenseShare.slice(0, 8).map((e, i) => ({
        name: e.category,
        value: total > 0 ? Math.round((n(e.amount) / total) * 100) : 0,
        color: EXPENSE_COLORS[i % EXPENSE_COLORS.length],
      })),
    }
  }, [data])

  const greeting = `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}`
  const firstName = (user?.name || 'Alex').split(' ')[0]
  const today = new Date().toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })

  const trendText = (() => {
    if (!data) return ''
    const trend = data.salesTrend
    if (trend.length < 2) return ''
    const prev = n(trend[trend.length - 2]?.revenue)
    const curr = n(trend[trend.length - 1]?.revenue)
    if (prev <= 0) return 'this month vs last month'
    const pct = Math.round(((curr - prev) / prev) * 100)
    return `${Math.abs(pct)}% ${pct >= 0 ? 'up' : 'down'} vs last month`
  })()

  const lowStock = data?.lowStockProducts[0] ?? null

  const txCount = n(data?.totals.transactionCount)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isNewUser = productCount === 0 || txCount === 0

  const setupSteps = [
    { label: 'Create your account', done: true, href: '' },
    { label: 'Set up your business', done: true, href: '' },
    { label: 'Add your first product', done: productCount > 0, href: '/setup-products' },
    { label: 'Record your first sale', done: txCount > 0, href: '/sales' },
  ]

  return (
    <div className="space-y-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-label text-label-sm text-on-surface-variant mb-1">{today}</p>
          <h1 className="font-headline text-headline-lg text-on-surface">
            {greeting}, <span className="text-primary">{firstName}</span>
          </h1>
          <p className="font-body text-body-md text-on-surface-variant mt-1">
            {trendText ? (
              <>
                Your sales are <span className="font-bold text-primary">{trendText}</span>. You've recorded{' '}
                <span className="font-bold">{data?.totals.transactionCount ?? 0}</span> transactions so far.
              </>
            ) : (
              'Welcome back to your dashboard.'
            )}
          </p>
        </div>
        <Link
          to="/sales"
          className="hidden lg:flex items-center gap-2 h-12 px-lg bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label text-label-md font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all"
        >
          <Icon name="add_circle" />
          Record New Sale
        </Link>
      </div>

      {isNewUser && (
        <div className="bg-gradient-to-br from-primary/90 to-primary-container rounded-3xl shadow-xl shadow-primary/10 text-on-primary overflow-hidden relative">
          <div className="absolute top-[-40%] right-[-5%] w-[380px] h-[380px] rounded-full bg-on-primary/10 blur-[80px]" />
          <div className="absolute bottom-[-40%] left-[-5%] w-[300px] h-[300px] rounded-full bg-secondary/20 blur-[80px]" />
          <div className="relative z-10 p-xl lg:p-2xl grid lg:grid-cols-[1fr_auto] gap-xl items-center">
            <div className="space-y-lg">
              <div className="flex items-center gap-md">
                <div className="w-12 h-12 rounded-2xl bg-on-primary/15 flex items-center justify-center">
                  <Icon name="rocket_launch" className="text-[26px]" />
                </div>
                <div>
                  <h2 className="font-headline text-headline-md">
                    {productCount === 0 ? 'Welcome! Let&apos;s set up your store' : 'Almost there!'}
                  </h2>
                  <p className="font-label text-label-md text-on-primary/90">
                    {productCount === 0
                      ? 'You have no products yet, so you can\u2019t record a sale or transaction right now.'
                      : `You've added ${productCount} ${productCount === 1 ? 'product' : 'products'} — time to make your first sale.`}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-md">
                {productCount === 0 ? (
                  <>
                    <Link
                      to="/setup-products"
                      className="flex items-center gap-2 h-12 px-lg bg-on-primary text-primary rounded-xl font-label text-label-md font-bold shadow-lg active:scale-[0.98] transition-all"
                    >
                      <Icon name="add_circle" />
                      Add your first product
                    </Link>
                    <Link
                      to="/inventory"
                      className="flex items-center gap-2 h-12 px-lg bg-on-primary/15 hover:bg-on-primary/25 text-on-primary rounded-xl font-label text-label-md font-bold transition-all"
                    >
                      <Icon name="inventory_2" />
                      Go to Inventory
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/sales"
                    className="flex items-center gap-2 h-12 px-lg bg-on-primary text-primary rounded-xl font-label text-label-md font-bold shadow-lg active:scale-[0.98] transition-all"
                  >
                    <Icon name="point_of_sale" />
                    Record your first sale
                  </Link>
                )}
              </div>
            </div>
            <div className="w-full lg:w-[360px] bg-on-primary/10 rounded-2xl p-lg backdrop-blur-sm">
              <p className="font-label text-label-sm uppercase tracking-widest text-on-primary/80 mb-md">Getting started</p>
              <div className="space-y-md">
                {setupSteps.map((s, i) => {
                  const current = !s.done && (i === 0 || setupSteps[i - 1].done)
                  return (
                    <div key={s.label} className="flex items-center gap-md">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold ${
                          s.done
                            ? 'bg-on-primary text-primary'
                            : current
                              ? 'bg-on-primary/25 text-on-primary ring-2 ring-on-primary/40'
                              : 'bg-on-primary/10 text-on-primary/60'
                        }`}
                      >
                        <Icon name={s.done ? 'check' : 'chevron_right'} className="text-[15px]" />
                      </span>
                      {s.href && !s.done ? (
                        <Link to={s.href} className="font-label text-label-md font-bold text-on-primary hover:underline">
                          {s.label}
                        </Link>
                      ) : (
                        <span className={`font-label text-label-md ${s.done ? 'font-semibold' : 'font-bold text-on-primary'}`}>
                          {s.label}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between gap-lg bg-error-container/40 rounded-xl px-lg py-md">
          <div className="flex items-center gap-2">
            <Icon name="error_outline" className="text-error" />
            <p className="font-body text-body-sm text-error">{error}</p>
          </div>
          <button className="font-label text-label-md text-error font-bold hover:underline" onClick={() => void load()}>
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-lg">
        <StatCard
          label="Revenue This Month"
          value={money(n(data?.currentMonth.revenue))}
          icon="payments"
          iconBg="bg-primary/10"
          iconColor="text-primary"
          trend={{ text: trendText || 'current month', color: 'text-primary' }}
        />
        <StatCard
          label="Net Profit"
          value={money(n(data?.currentMonth.profit))}
          icon="account_balance_wallet"
          iconBg="bg-secondary/10"
          iconColor="text-secondary"
          trend={{ text: n(data?.currentMonth.profit) >= 0 ? 'Profitable this month' : 'Below zero', color: n(data?.currentMonth.profit) >= 0 ? 'text-primary' : 'text-error' }}
        />
        <StatCard
          label="Transactions"
          value={String(data?.totals.transactionCount ?? 0)}
          icon="receipt_long"
          iconBg="bg-tertiary/10"
          iconColor="text-tertiary"
          trend={{ text: 'All time', color: 'text-on-surface-variant' }}
        />
        <StatCard
          label="Inventory Health"
          value={(data?.inventory.lowStockCount ?? 0) > 0 ? 'Attention' : 'Stable'}
          icon="inventory_2"
          iconBg="bg-error/10"
          iconColor="text-error"
          trend={{ text: `${data?.inventory.lowStockCount ?? 0} items low stock`, color: (data?.inventory.lowStockCount ?? 0) > 0 ? 'text-warning' : 'text-primary' }}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-xl">
        <div className="xl:col-span-2 space-y-xl">
          <Card>
            <CardHeader
              title="Sales Performance"
              subtitle="Last 6 Months Revenue Trend"
              right={
                <div className="flex items-center gap-lg text-[12px]">
                  <span className="flex items-center gap-1 font-label text-on-surface-variant">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Revenue
                  </span>
                </div>
              }
            />
            <div className="flex items-end gap-3 h-[220px] mt-lg px-md">
              {chart.bars.map((d) => (
                <div key={d.label} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <span className="font-label text-label-sm text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                    {compactMoney(d.value)}
                  </span>
                  <div
                    className="w-full max-w-[48px] rounded-lg transition-all duration-300 group-hover:opacity-100 bg-primary/20 group-hover:bg-primary/40"
                    style={{ height: `${Math.max((d.value / chart.max) * 100, 2)}%` }}
                  />
                  <span className="font-label text-label-sm text-on-surface-variant">{d.label}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Recent Transactions"
              subtitle="Latest activity"
              right={
                <Link to="/sales" className="font-label text-label-md text-primary hover:underline font-bold">
                  View all
                </Link>
              }
            />
            <div className="overflow-x-auto lg:-mx-xl lg:px-xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[12px] uppercase tracking-wider text-outline border-b border-outline-variant/10">
                    <th className="py-3 pr-4 font-semibold">Transaction ID</th>
                    <th className="py-3 pr-4 font-semibold">Customer</th>
                    <th className="py-3 pr-4 font-semibold">Amount</th>
                    <th className="py-3 pr-4 font-semibold">Status</th>
                    <th className="py-3 pr-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentTransactions ?? []).map((t: ApiTransaction) => {
                    const customer = t.customer?.name ?? 'Walk-in'
                    const initials = customer
                      .split(' ')
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                    const status = t.type === 'INCOME' ? 'Success' : 'Pending'
                    const date = new Date(t.occurredAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })
                    return (
                      <tr key={t.id} className="border-b border-outline-variant/5 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 pr-4 font-label text-label-md font-bold text-primary">#{t.id.slice(0, 8).toUpperCase()}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-md">
                            <Avatar initials={initials} size="sm" />
                            <div>
                              <p className="font-label text-label-md font-semibold text-on-surface">{customer}</p>
                              <p className="text-[12px] text-on-surface-variant">{t.category} • {date}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4 font-body text-body-md font-semibold text-on-surface">
                          FCFA {Math.round(n(t.amount)).toLocaleString()}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge tone={badgeTone(status)}>{status}</Badge>
                        </td>
                        <td className="py-3 pr-4">
                          <button className="ml-auto block text-on-surface-variant hover:text-primary transition-colors">
                            <Icon name="more_horiz" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-xl">
          {insight && (
            <Card>
              <CardHeader
                title="AI Advisor Insight"
                subtitle="Live Analysis"
                right={
                  <span className="flex items-center gap-1 font-label text-label-sm text-primary">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    LIVE
                  </span>
                }
              />
              <div className="bg-gradient-to-br from-primary-container/30 to-secondary-container/30 rounded-xl p-lg mb-lg">
                <p className="font-body text-body-md text-on-surface mb-2">{insight.title}</p>
                <p className="text-[12px] text-on-surface-variant">{insight.message}</p>
                {insight.recommendation && (
                  <p className="text-[12px] font-bold text-on-surface mt-2">{insight.recommendation}</p>
                )}
              </div>
              <Link to="/advisor" className="flex items-center gap-1 font-label text-label-md text-primary hover:underline font-bold">
                View Detailed Forecast
                <Icon name="arrow_right_alt" />
              </Link>
            </Card>
          )}

          <Card>
            <CardHeader title="Expense Share" subtitle={`${compactMoney(expenseDonut.total)} Total`} />
            {expenseDonut.data.length > 0 ? (
              <>
                <div className="flex justify-center py-lg">
                  <DonutChart
                    data={expenseDonut.data}
                    size={160}
                    strokeWidth={18}
                    centerValue={compactMoney(expenseDonut.total)}
                    centerLabel="Total"
                  />
                </div>
                <div className="space-y-2 mt-lg">
                  {expenseDonut.data.map((e) => (
                    <div key={e.name} className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-label text-label-md text-on-surface-variant">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: e.color }} />
                        {e.name}
                      </span>
                      <span className="font-label text-label-md font-bold text-on-surface">{e.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="font-body text-body-md text-on-surface-variant py-lg text-center">No expenses recorded yet.</p>
            )}
          </Card>

          {lowStock && (
            <Card className="border-warning/30">
              <CardHeader
                title="Action Required"
                subtitle="Critical Low Stock"
                right={
                  <span className="w-8 h-8 rounded-full bg-warning-container flex items-center justify-center">
                    <Icon name="notification_important" className="text-warning" />
                  </span>
                }
              />
              <p className="font-body text-body-md text-on-surface mb-lg">
                <span className="font-bold text-on-surface">{lowStock.name}</span> is down to{' '}
                <span className="font-bold text-error">{lowStock.stockQuantity} units</span> left (threshold{' '}
                {lowStock.reorderThreshold}).
              </p>
              <Link to="/inventory" className="flex items-center gap-2 h-11 px-lg bg-error text-on-primary rounded-lg font-label text-label-md font-bold hover:bg-error-container transition-colors w-fit">
                Reorder Stock Now
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
