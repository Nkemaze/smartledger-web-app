import { useEffect, useState } from 'react'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { DonutChart } from '@/components/ui/DonutChart'
import { Icon } from '@/components/ui/Icon'
import { taxService } from '@/lib/api'
import type { TaxSummary as TaxSummaryData, ApiFiling } from '@/lib/api'

const n = (v: number | string | null | undefined) => Number(v ?? 0)

const compactMoney = (v: number) =>
  v >= 1_000_000 ? `FCFA ${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `FCFA ${Math.round(v / 1_000)}K` : `FCFA ${v}`

const statusTone = (status: string) => {
  if (status === 'FILED' || status === 'SUBMITTED' || status === 'PAID') return 'success' as const
  if (status === 'DRAFT' || status === 'Pending') return 'warning' as const
  return 'error' as const
}

const statusLabel = (status: string) =>
  status === 'SUBMITTED' || status === 'FILED' || status === 'PAID' ? 'Filed' : status === 'DRAFT' ? 'Pending' : status

function daysFromDue(dueDate?: string | null): string {
  if (!dueDate) return 'No due date'
  const diff = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
  if (diff < 0) return 'Overdue'
  if (diff === 0) return 'Due Today'
  if (diff === 1) return 'In 1 Day'
  return `In ${diff} Days`
}

export function TaxSummary() {
  const [range, setRange] = useState('Last 12 Months')
  const [data, setData] = useState<TaxSummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setData(await taxService.summary())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load tax data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const vatCollected = n(data?.vatCollected)
  const vatPaid = n(data?.vatPaid)
  const vatNet = n(data?.vatNet)
  const totalSales = n(data?.totalSales)
  const vatTotal = vatCollected + vatPaid

  const distribution = [
    { name: 'VAT Collected', value: vatTotal > 0 ? Math.round((vatCollected / vatTotal) * 100) : 0, color: '#006b2c' },
    { name: 'VAT Paid', value: vatTotal > 0 ? Math.round((vatPaid / vatTotal) * 100) : 0, color: '#0051d5' },
  ]

  const calendarItems = (data?.filings ?? [])
    .slice(0, 3)
    .map((f) => ({
      icon: 'receipt_long',
      color: 'bg-primary/10 text-primary',
      title: `VAT Filing – ${f.period}`,
      due: daysFromDue(f.dueDate),
      body: `Net VAT ${compactMoney(n(f.vatCollected) - n(f.vatPaid))} • Status: ${statusLabel(f.status)}`,
    }))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-xl">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-lg">
        <div>
          <div className="flex items-center gap-md mb-1">
            <h1 className="font-headline text-headline-lg text-on-surface">Tax Summary & Compliance</h1>
            <Badge tone="info" icon="verified_user">
              Default VAT Rate: {data?.defaultVatRate != null ? `${n(data.defaultVatRate)}%` : 'Not set'}
            </Badge>
          </div>
          <p className="font-body text-body-md text-on-surface-variant mt-1">
            Real-time monitoring of your tax liabilities, VAT reconciliation, and statutory filing deadlines.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-md">
          <button className="flex items-center gap-2 h-11 px-lg bg-surface-container-lowest text-on-surface rounded-xl font-label text-label-md font-bold shadow-sm hover:bg-surface-container-high transition-colors">
            <Icon name="history" className="text-primary" />
            Archive
          </button>
          <button className="flex items-center gap-2 h-11 px-lg bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label text-label-md font-bold shadow-lg shadow-primary/25 transition-all">
            <Icon name="description" />
            Generate Tax Report
          </button>
        </div>
      </div>

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
          label="VAT Collected (Sales)"
          value={compactMoney(vatCollected)}
          icon="trending_up"
          iconBg="bg-primary/10"
          iconColor="text-primary"
          footnote="From taxable sales"
        />
        <StatCard
          label="VAT Paid (Expenses)"
          value={compactMoney(vatPaid)}
          icon="receipt_long"
          iconBg="bg-secondary/10"
          iconColor="text-secondary"
          footnote="Input tax on purchases"
        />
        <StatCard
          label="Net VAT Payable"
          value={compactMoney(vatNet)}
          icon="payments"
          iconBg="bg-tertiary/10"
          iconColor="text-tertiary"
          trend={{ text: vatNet >= 0 ? 'You owe' : 'Refundable', color: vatNet >= 0 ? 'text-primary' : 'text-warning' }}
          footnote="After offsetting input credits"
        />
        <StatCard
          label="Taxable Sales"
          value={compactMoney(totalSales)}
          icon="account_balance"
          iconBg="bg-error/10"
          iconColor="text-error"
          footnote="Total transaction volume"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-xl">
        <Card>
          <CardHeader
            title="VAT Distribution"
            subtitle="Collected vs paid"
            right={
              <div className="flex bg-surface-container-low rounded-full p-1">
                {['Last 12 Months', 'Last Quarter'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                      range === r ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            }
          />
          <div className="px-xl pb-xl flex flex-col items-center">
            <DonutChart data={distribution} size={170} strokeWidth={20} centerValue={compactMoney(vatTotal)} centerLabel="Total" />
            <div className="w-full space-y-2 mt-lg">
              {distribution.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-label text-label-md text-on-surface-variant">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                    {d.name}
                  </span>
                  <span className="font-label text-label-md font-bold text-on-surface">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Compliance Calendar"
            subtitle="Upcoming statutory deadlines"
            right={
              <span className="flex items-center gap-1 font-label text-label-sm text-primary">
                <Icon name="calendar_month" className="text-[16px]" />
              </span>
            }
          />
          <div className="px-xl pb-xl space-y-md">
            {calendarItems.length > 0 ? (
              calendarItems.map((item) => (
                <div key={item.title} className="flex items-start gap-md p-md bg-surface-container-low/50 rounded-xl">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <Icon name={item.icon} />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-label text-label-md font-bold text-on-surface">{item.title}</p>
                      <Badge tone={item.due.startsWith('In 4') || item.due.startsWith('Due Today') || item.due === 'Overdue' ? 'error' : 'warning'}>{item.due}</Badge>
                    </div>
                    <p className="text-[12px] text-on-surface-variant mt-1">{item.body}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="font-body text-body-md text-on-surface-variant py-lg text-center">No filings scheduled yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Tax Optimization Insight"
            subtitle="AI-powered recommendation"
            right={
              <span className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Icon name="auto_awesome" className="text-on-primary" />
              </span>
            }
          />
          <div className="px-xl pb-xl">
            <p className="font-body text-body-md text-on-surface mb-lg">
              Your net VAT position is{' '}
              <span className="font-headline text-headline-md text-primary">{compactMoney(vatNet)}</span>. Keep every
              expense receipt uploaded to the archive so you can fully reclaim Input VAT credits and lower your
              statutory bill.
            </p>
            <button className="flex items-center gap-2 h-11 px-lg bg-primary text-on-primary rounded-xl font-label text-label-md font-bold shadow-lg shadow-primary/25 hover:bg-primary-container transition-colors">
              <Icon name="lightbulb" />
              View Strategy
            </button>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader
          title="Recent Filings"
          subtitle="History of submitted statutory filings"
          right={
            <button className="flex items-center gap-2 p-2 text-on-surface-variant hover:text-primary transition-colors">
              <Icon name="filter_list" />
            </button>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] md:min-w-[800px] text-left">
            <thead>
              <tr className="text-[12px] uppercase tracking-wider text-outline border-y border-outline-variant/10 bg-surface-container-low/40">
                <th className="py-3 px-xl font-semibold">Period</th>
                <th className="py-3 px-4 font-semibold hidden md:table-cell">Tax Type</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold hidden md:table-cell">Submission Date</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {(data?.filings ?? []).map((f: ApiFiling) => (
                <tr key={f.id} className="border-b border-outline-variant/5 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-4 px-xl">
                    <span className="font-label text-label-md font-bold text-on-surface">{f.period}</span>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    <div className="flex items-center gap-2 font-label text-label-md text-on-surface">
                      <Icon name="receipt" className="text-primary" />
                      VAT Return
                    </div>
                  </td>
                  <td className="py-4 px-4 font-body text-body-md font-semibold text-on-surface">
                    {compactMoney(n(f.vatCollected) - n(f.vatPaid))}
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell text-[12px] text-on-surface-variant">
                    {f.submittedAt ? new Date(f.submittedAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td className="py-4 px-4">
                    <Badge tone={statusTone(f.status)}>{statusLabel(f.status)}</Badge>
                  </td>
                  <td className="py-4 px-4 text-right">
                    {f.status === 'FILED' || f.status === 'SUBMITTED' || f.status === 'PAID' ? (
                      <button className="inline-flex items-center gap-1 font-label text-label-sm text-primary font-bold hover:underline">
                        <Icon name="picture_as_pdf" className="text-[16px]" />
                        Receipt
                      </button>
                    ) : (
                      <button className="inline-flex items-center gap-1 h-9 px-3 bg-primary text-on-primary rounded-lg font-label text-label-sm font-bold hover:bg-primary-container transition-colors">
                        Prepare
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && (data?.filings ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="py-2xl text-center">
                    <p className="font-body text-body-md text-on-surface-variant">No filings yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
