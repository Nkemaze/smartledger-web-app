import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardHeader } from '@/components/ui/Card'
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

const badgeTone = (type: string) => (type === 'INCOME' ? 'success' : 'warning')

function Sparkline({ values, color = '#006b2c' }: { values: number[]; color?: string }) {
  const pts = values.length > 1 ? values : [0, 0]
  const max = Math.max(...pts, 1)
  const min = Math.min(...pts, 0)
  const range = max - min || 1
  const w = 100
  const h = 34
  const step = w / (pts.length - 1)
  const coords = pts.map((v, i) => [i * step, h - ((v - min) / range) * (h - 4) - 2] as const)
  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const area = `${line} L${w} ${h} L0 ${h} Z`
  const gid = `spark-${color.replace('#', '')}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-full">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Kpi({
  label,
  value,
  icon,
  accent,
  trend,
  spark,
  progress,
}: {
  label: string
  value: string
  icon: string
  accent: string
  trend?: { text: string; tone: 'up' | 'down' | 'neutral' }
  spark?: number[]
  progress?: { value: number; color: string }
}) {
  return (
    <div className="group relative overflow-hidden bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-xl shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:shadow-[0_8px_24px_rgba(16,24,40,0.08)] transition-all">
      <div className="flex items-start justify-between gap-md">
        <div className="min-w-0 flex-1">
          <p className="font-label text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">{label}</p>
          <p className="mt-2 font-headline text-[26px] leading-tight font-bold text-on-surface tabular-nums truncate">
            {value}
          </p>
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accent}14`, color: accent }}
        >
          <Icon name={icon} className="text-[22px]" />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {trend && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
              trend.tone === 'up'
                ? 'bg-primary/10 text-primary'
                : trend.tone === 'down'
                  ? 'bg-error-container/60 text-error'
                  : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            {trend.tone !== 'neutral' && (
              <Icon name={trend.tone === 'up' ? 'trending_up' : 'trending_down'} className="text-[13px]" />
            )}
            {trend.text}
          </span>
        )}
        {spark && (
          <div className="ml-auto w-20 h-8 opacity-80 group-hover:opacity-100 transition-opacity">
            <Sparkline values={spark} color={accent} />
          </div>
        )}
      </div>

      {progress && (
        <div className="mt-4 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(100, Math.max(0, progress.value))}%`, backgroundColor: progress.color }}
          />
        </div>
      )}
    </div>
  )
}

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

  const chartData = useMemo(() => {
    if (!data) return []
    return data.salesTrend.map((s) => ({ label: monthLabel(s.period), revenue: n(s.revenue) }))
  }, [data])

  const sparkValues = useMemo(() => chartData.map((d) => d.revenue), [chartData])

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
  const today = new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })

  const trend = (() => {
    if (!data || data.salesTrend.length < 2) return null
    const arr = data.salesTrend
    const prev = n(arr[arr.length - 2]?.revenue)
    const curr = n(arr[arr.length - 1]?.revenue)
    if (prev <= 0) return null
    const pct = Math.round(((curr - prev) / prev) * 100)
    return { pct, up: pct >= 0 }
  })()

  const lowStockCount = data?.inventory.lowStockCount ?? 0
  const txCount = n(data?.totals.transactionCount)
  const margin = n(data?.currentMonth.revenue) > 0
    ? Math.round((n(data?.currentMonth.profit) / n(data?.currentMonth.revenue)) * 100)
    : 0

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
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-lg">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label text-[11px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Live overview
            </span>
            <span className="font-label text-[12px] text-on-surface-variant">{today}</span>
          </div>
          <h1 className="font-headline text-headline-lg text-on-surface tracking-tight">
            {greeting}, <span className="text-primary">{firstName}</span>
          </h1>
          <p className="font-body text-body-md text-on-surface-variant mt-1">
            {trend ? (
              <>
                Revenue is{' '}
                <span className={`font-bold ${trend.up ? 'text-primary' : 'text-error'}`}>
                  {trend.up ? 'up' : 'down'} {Math.abs(trend.pct)}%
                </span>{' '}
                vs last month across {txCount} transactions.
              </>
            ) : (
              "Here's what's happening with your business today."
            )}
          </p>
        </div>
        <div className="flex items-center gap-sm">
          <Link
            to="/inventory"
            className="hidden sm:flex items-center gap-2 h-11 px-lg bg-surface-container-lowest border border-outline-variant/40 text-on-surface rounded-xl font-label text-label-md font-semibold hover:bg-surface-container-low transition-colors"
          >
            <Icon name="inventory_2" className="text-[20px]" />
            Inventory
          </Link>
          <Link
            to="/sales"
            className="flex items-center gap-2 h-11 px-lg bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label text-label-md font-bold shadow-lg shadow-primary/20 hover:shadow-primary/35 active:scale-[0.98] transition-all"
          >
            <Icon name="add" className="text-[20px]" />
            Record Sale
          </Link>
        </div>
      </div>

      {/* Onboarding */}
      {isNewUser && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-container text-on-primary shadow-xl shadow-primary/15">
          <div className="absolute -top-24 -right-16 w-[340px] h-[340px] rounded-full bg-on-primary/10 blur-[70px]" />
          <div className="absolute -bottom-28 left-1/4 w-[280px] h-[280px] rounded-full bg-secondary/25 blur-[80px]" />
          <div className="relative z-10 p-xl lg:p-2xl grid lg:grid-cols-[1fr_auto] gap-xl items-center">
            <div className="space-y-lg">
              <div className="flex items-center gap-md">
                <div className="w-12 h-12 rounded-2xl bg-on-primary/15 flex items-center justify-center">
                  <Icon name="rocket_launch" className="text-[26px]" />
                </div>
                <div>
                  <h2 className="font-headline text-headline-md">
                    {productCount === 0 ? "Welcome! Let's set up your store" : 'Almost there!'}
                  </h2>
                  <p className="font-label text-label-md text-on-primary/85">
                    {productCount === 0
                      ? 'Add a product to start recording sales and tracking profit.'
                      : `You've added ${productCount} ${productCount === 1 ? 'product' : 'products'} — make your first sale.`}
                  </p>
                </div>
              </div>
              <Link
                to={productCount === 0 ? '/setup-products' : '/sales'}
                className="inline-flex items-center gap-2 h-11 px-lg bg-on-primary text-primary rounded-xl font-label text-label-md font-bold shadow-lg active:scale-[0.98] transition-all w-fit"
              >
                <Icon name={productCount === 0 ? 'add_circle' : 'point_of_sale'} />
                {productCount === 0 ? 'Add your first product' : 'Record your first sale'}
              </Link>
            </div>
            <div className="w-full lg:w-[340px] bg-on-primary/10 rounded-2xl p-lg backdrop-blur-sm">
              <p className="font-label text-[11px] uppercase tracking-widest text-on-primary/70 mb-md">
                Getting started
              </p>
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
                        <span
                          className={`font-label text-label-md ${s.done ? 'font-semibold' : 'font-bold text-on-primary'}`}
                        >
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
        <div className="flex items-center justify-between gap-lg bg-error-container/40 border border-error/20 rounded-xl px-lg py-md">
          <div className="flex items-center gap-2">
            <Icon name="error_outline" className="text-error" />
            <p className="font-body text-body-sm text-error">{error}</p>
          </div>
          <button className="font-label text-label-md text-error font-bold hover:underline" onClick={() => void load()}>
            Retry
          </button>
        </div>
      )}

      {/* KPI bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md">
        <Kpi
          label="Revenue This Month"
          value={money(n(data?.currentMonth.revenue))}
          icon="payments"
          accent="#006b2c"
          trend={trend ? { text: `${Math.abs(trend.pct)}% vs last month`, tone: trend.up ? 'up' : 'down' } : { text: 'Current month', tone: 'neutral' }}
          spark={sparkValues}
        />
        <Kpi
          label="Net Profit"
          value={money(n(data?.currentMonth.profit))}
          icon="account_balance_wallet"
          accent="#0051d5"
          trend={{ text: `${margin}% margin`, tone: n(data?.currentMonth.profit) >= 0 ? 'up' : 'down' }}
          progress={{ value: Math.max(0, Math.min(100, margin)), color: n(data?.currentMonth.profit) >= 0 ? '#0051d5' : '#ba1a1a' }}
        />
        <Kpi
          label="Transactions"
          value={String(txCount)}
          icon="receipt_long"
          accent="#825100"
          trend={{ text: 'All time', tone: 'neutral' }}
        />
        <Kpi
          label="Inventory Health"
          value={lowStockCount > 0 ? 'Attention' : 'Stable'}
          icon="inventory_2"
          accent={lowStockCount > 0 ? '#ba1a1a' : '#006b2c'}
          trend={{
            text: lowStockCount > 0 ? `${lowStockCount} low stock` : 'All stocked',
            tone: lowStockCount > 0 ? 'down' : 'up',
          }}
          progress={{
            value: productCount > 0 ? Math.max(0, 100 - (lowStockCount / Math.max(productCount, 1)) * 100) : 100,
            color: lowStockCount > 0 ? '#ba1a1a' : '#006b2c',
          }}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-xl">
        <div className="xl:col-span-2 space-y-xl">
          {/* Sales chart */}
          <Card className="p-xl">
            <div className="flex items-start justify-between gap-md mb-lg">
              <div>
                <h3 className="font-headline text-[17px] font-bold text-on-surface">Sales Performance</h3>
                <p className="font-body text-[13px] text-on-surface-variant mt-0.5">Revenue trend over the last 6 months</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Revenue
              </div>
            </div>
            {chartData.length > 0 ? (
              <div className="h-[260px] -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#006b2c" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="#006b2c" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#bdcaba" strokeOpacity={0.25} vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: '#3e4a3d' }}
                      dy={8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#6e7b6c' }}
                      width={54}
                      tickFormatter={(v) => compactMoney(Number(v)).replace('FCFA ', '')}
                    />
                    <Tooltip
                      cursor={{ stroke: '#006b2c', strokeOpacity: 0.2, strokeWidth: 1 }}
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid rgba(189,202,186,0.4)',
                        fontSize: 12,
                        boxShadow: '0 8px 24px rgba(16,24,40,0.1)',
                      }}
                      formatter={(value: number) => [money(Number(value)), 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#006b2c"
                      strokeWidth={2.5}
                      fill="url(#revFill)"
                      dot={{ r: 3, fill: '#006b2c', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-body-sm text-on-surface-variant">
                No sales data yet.
              </div>
            )}
          </Card>

          {/* Recent transactions */}
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
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-outline border-b border-outline-variant/20">
                    <th className="py-3 px-lg font-semibold">Transaction</th>
                    <th className="py-3 pr-lg font-semibold">Customer</th>
                    <th className="py-3 pr-lg font-semibold text-right">Amount</th>
                    <th className="py-3 pr-lg font-semibold">Status</th>
                    <th className="py-3 pr-lg text-right font-semibold">Action</th>
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
                      <tr
                        key={t.id}
                        className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low/60 transition-colors"
                      >
                        <td className="py-3 px-lg font-label text-label-md font-bold text-primary">
                          #{t.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="py-3 pr-lg">
                          <div className="flex items-center gap-md">
                            <Avatar initials={initials} />
                            <div>
                              <p className="font-label text-label-md font-semibold text-on-surface">{customer}</p>
                              <p className="text-[12px] text-on-surface-variant">
                                {t.category} • {date}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-lg text-right font-body text-body-md font-semibold text-on-surface tabular-nums">
                          {money(n(t.amount))}
                        </td>
                        <td className="py-3 pr-lg">
                          <Badge tone={badgeTone(t.type)}>{status}</Badge>
                        </td>
                        <td className="py-3 pr-lg">
                          <button className="ml-auto block text-on-surface-variant hover:text-primary transition-colors">
                            <Icon name="more_horiz" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {(data?.recentTransactions ?? []).length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-body-sm text-on-surface-variant">
                        No transactions yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-xl">
          {insight && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary/10 via-surface-container-lowest to-secondary/5 border border-secondary/15 p-xl shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
              <div className="absolute top-0 left-0 h-full w-1 bg-secondary" />
              <div className="flex items-center justify-between mb-md">
                <div className="flex items-center gap-sm">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                    <Icon name="psychology" className="text-[19px] text-white" />
                  </div>
                  <div>
                    <p className="font-headline text-[15px] font-bold text-on-surface">Smart Advisor</p>
                    <p className="text-[11px] text-on-surface-variant">Live analysis</p>
                  </div>
                </div>
                <Badge tone="info" dot pulse>
                  Live
                </Badge>
              </div>
              <p className="font-body text-[15px] leading-relaxed text-on-surface">{insight.title}</p>
              <p className="text-[13px] text-on-surface-variant mt-1.5">{insight.message}</p>
              {insight.recommendation && (
                <div className="mt-md rounded-xl bg-surface-container-lowest/70 border border-secondary/10 px-md py-2.5">
                  <p className="text-[12px] font-semibold text-on-surface">{insight.recommendation}</p>
                </div>
              )}
              <Link
                to="/advisor"
                className="mt-lg inline-flex items-center justify-center gap-1.5 w-full h-10 bg-secondary text-on-secondary rounded-xl font-label text-label-md font-bold hover:opacity-90 active:scale-[0.98] transition-all"
              >
                View Detailed Forecast
                <Icon name="arrow_forward" className="text-[18px]" />
              </Link>
            </div>
          )}

          <Card className="p-xl">
            <div className="flex items-start justify-between mb-md">
              <div>
                <h3 className="font-headline text-[17px] font-bold text-on-surface">Expense Share</h3>
                <p className="font-body text-[13px] text-on-surface-variant mt-0.5">
                  {compactMoney(expenseDonut.total)} total
                </p>
              </div>
            </div>
            {expenseDonut.data.length > 0 ? (
              <>
                <div className="flex justify-center py-md">
                  <DonutChart
                    data={expenseDonut.data}
                    size={168}
                    strokeWidth={18}
                    centerValue={compactMoney(expenseDonut.total)}
                    centerLabel="Total"
                  />
                </div>
                <div className="space-y-2.5 mt-md">
                  {expenseDonut.data.map((e) => (
                    <div key={e.name} className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-label text-label-md text-on-surface-variant">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: e.color }} />
                        {e.name}
                      </span>
                      <span className="font-label text-label-md font-bold text-on-surface tabular-nums">{e.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="font-body text-body-md text-on-surface-variant py-lg text-center">No expenses recorded yet.</p>
            )}
          </Card>

          {lowStockCount > 0 && (
            <Card className="p-xl border-warning/40 bg-warning-container/20">
              <div className="flex items-center justify-between mb-md">
                <div className="flex items-center gap-sm">
                  <span className="w-9 h-9 rounded-full bg-warning-container flex items-center justify-center">
                    <Icon name="notification_important" className="text-warning text-[19px]" />
                  </span>
                  <div>
                    <p className="font-headline text-[15px] font-bold text-on-surface">Action Required</p>
                    <p className="text-[11px] text-on-surface-variant">Critical low stock</p>
                  </div>
                </div>
                <span className="font-headline text-headline-md text-warning">{lowStockCount}</span>
              </div>
              {data?.lowStockProducts.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2.5 border-b border-outline-variant/20 last:border-0"
                >
                  <span className="font-label text-label-md font-semibold text-on-surface truncate">{p.name}</span>
                  <span className="font-label text-[12px] font-bold text-error flex-shrink-0">
                    {p.stockQuantity} left
                  </span>
                </div>
              ))}
              <Link
                to="/inventory"
                className="mt-md flex items-center justify-center gap-2 h-10 bg-error text-on-primary rounded-xl font-label text-label-md font-bold hover:opacity-90 transition-opacity w-full"
              >
                <Icon name="shopping_cart_checkout" className="text-[18px]" />
                Reorder Stock
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
