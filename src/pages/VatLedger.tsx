import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { Pagination } from '@/components/ui/Pagination'
import { taxService } from '@/lib/api'
import type { TaxSummary as TaxSummaryData, VatEntry } from '@/lib/api'

const n = (v: number | string | null | undefined) => Number(v ?? 0)

const dateRanges = ['Current Quarter (Q3 2024)', 'Previous Month', 'Financial Year 2023-24', 'Custom Range']
const types = ['All Transactions', 'Sales (Output)', 'Expenses (Input)']

const compactMoney = (v: number) =>
  v >= 1_000_000 ? `FCFA ${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `FCFA ${Math.round(v / 1_000)}K` : `FCFA ${Math.round(v)}`

function monthPeriod(offset: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function periodFor(range: string): string | undefined {
  if (range === 'Current Quarter (Q3 2024)' || range === 'Previous Month') return monthPeriod(-1)
  return undefined
}

const statusTone = (status: string) =>
  status === 'Verified' ? 'success' : status === 'Zero Rated' ? 'info' : 'warning'

const statusIcon = (status: string) =>
  status === 'Verified' ? 'check_circle' : status === 'Zero Rated' ? 'verified_user' : 'pending'

function entryStatus(v: VatEntry): string {
  if (n(v.vatRate) === 0) return 'Zero Rated'
  return 'Verified'
}

const PAGE_SIZE = 8

export function VatLedger() {
  const [range, setRange] = useState(dateRanges[0])
  const [type, setType] = useState(types[0])
  const [page, setPage] = useState(1)
  const [summary, setSummary] = useState<TaxSummaryData | null>(null)
  const [entries, setEntries] = useState<VatEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [s, e] = await Promise.all([taxService.summary(), taxService.vatLedger(periodFor(range))])
      setSummary(s)
      setEntries(e)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load VAT ledger.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [range])

  const filtered = useMemo(
    () =>
      entries.filter((e) => {
        if (type === 'Sales (Output)') return e.type === 'INCOME'
        if (type === 'Expenses (Input)') return e.type === 'EXPENSE'
        return true
      }),
    [entries, type]
  )

  const rateSplit = useMemo(() => {
    const standard = entries.filter((e) => n(e.vatRate) > 0).length
    const total = entries.length || 1
    return { standard: Math.round((standard / total) * 100), exempt: 100 - Math.round((standard / total) * 100) }
  }, [entries])

  const nextFiling = (summary?.filings ?? []).find((f) => f.dueDate)

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pages)
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

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
          <div className="flex items-center gap-1 text-[12px] text-on-surface-variant mb-1">
            <span>Compliance & Tax</span>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-on-surface font-semibold">VAT Ledger</span>
          </div>
          <h1 className="font-headline text-headline-lg text-on-surface">VAT Ledger</h1>
          <p className="font-body text-body-md text-on-surface-variant mt-1 max-w-2xl">
            Real-time monitoring of your value-added tax liabilities and reclaimable credits across all business
            operations.
          </p>
        </div>
        <div className="flex items-center gap-md flex-wrap">
          <div className="relative">
            <select
              value={range}
              onChange={(e) => {
                setRange(e.target.value)
                setPage(1)
              }}
              className="h-11 px-lg pr-10 bg-surface-container-lowest rounded-xl appearance-none font-label text-label-md text-on-surface cursor-pointer shadow-sm"
            >
              {dateRanges.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <Icon name="expand_more" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
          </div>
          <div className="relative">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value)
                setPage(1)
              }}
              className="h-11 px-lg pr-10 bg-surface-container-lowest rounded-xl appearance-none font-label text-label-md text-on-surface cursor-pointer shadow-sm"
            >
              {types.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <Icon name="expand_more" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
          </div>
          <button className="h-11 px-lg bg-surface-container-lowest rounded-xl font-label text-label-md font-bold text-on-surface shadow-sm hover:bg-surface-container-high transition-colors flex items-center gap-2">
            <Icon name="filter_list" />
            Filters
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        <div className="bg-surface-container-lowest rounded-2xl p-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-label text-label-md text-on-surface-variant mb-1">Output VAT</p>
              <h2 className="font-headline text-headline-lg text-on-surface">{compactMoney(n(summary?.vatCollected))}</h2>
              <p className="font-label text-label-sm text-primary font-bold mt-1 flex items-center gap-1">
                <Icon name="trending_up" className="text-[16px]" />
                Collected
              </p>
            </div>
            <span className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Icon name="trending_up" />
            </span>
          </div>
          <p className="font-label text-label-sm text-on-surface-variant mt-2">Total tax collected on sales</p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-label text-label-md text-on-surface-variant mb-1">Input VAT</p>
              <h2 className="font-headline text-headline-lg text-on-surface">{compactMoney(n(summary?.vatPaid))}</h2>
              <p className="font-label text-label-sm text-error font-bold mt-1 flex items-center gap-1">
                <Icon name="trending_down" className="text-[16px]" />
                Paid
              </p>
            </div>
            <span className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <Icon name="shopping_cart" />
            </span>
          </div>
          <p className="font-label text-label-sm text-on-surface-variant mt-2">Total tax paid on purchases</p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-label text-label-md text-on-surface-variant mb-1">Net Payable</p>
              <h2 className="font-headline text-headline-lg text-on-surface">{compactMoney(n(summary?.vatNet))}</h2>
              <p className="font-label text-label-sm text-primary font-bold mt-1">After offsetting</p>
            </div>
            <div className="relative">
              <span className="w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center">
                <Icon name="account_balance" />
              </span>
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center">
                <Icon name="verified_user" className="text-[12px]" />
              </span>
            </div>
          </div>
          <p className="font-label text-label-sm text-on-surface-variant mt-2">After offsetting input credits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-xl items-start">
        <Card className="p-xl xl:col-span-2 space-y-lg">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Icon name="info" className="text-[16px]" />
            </span>
            <h3 className="font-headline text-headline-md text-on-surface">Rate Distribution</h3>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden">
            <div className="bg-primary" style={{ width: `${rateSplit.standard}%` }} />
            <div className="bg-surface-container-highest" style={{ width: `${rateSplit.exempt}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-md">
            <div>
              <p className="font-headline text-headline-md text-on-surface">{rateSplit.standard}%</p>
              <p className="text-[12px] text-on-surface-variant">Standard (7.5%)</p>
            </div>
            <div>
              <p className="font-headline text-headline-md text-on-surface">{rateSplit.exempt}%</p>
              <p className="text-[12px] text-on-surface-variant">Zero-rated (0%)</p>
            </div>
          </div>
          <div className="bg-secondary-container/20 rounded-xl p-lg flex items-start gap-md">
            <Icon name="lightbulb" className="text-secondary" />
            <p className="font-body text-body-md text-on-surface">
              <span className="font-bold">Pro Tip:</span> Ensure all expense receipts are uploaded to claim Input VAT
              credits and optimize your tax position.
            </p>
          </div>
        </Card>

        <div className="space-y-xl">
          <Card className="p-xl">
            <div className="flex items-center justify-between mb-lg">
              <div>
                <p className="font-label text-label-md text-on-surface-variant mb-1">Compliance Score</p>
                <h3 className="font-headline text-headline-lg text-primary">98%</h3>
              </div>
              <Icon name="verified_user" className="text-[32px] text-primary" />
            </div>
            <p className="font-body text-body-md text-on-surface-variant">
              Your business is fully compliant with current DGI regulations. No immediate actions required.
            </p>
          </Card>
          <Card className="p-xl">
            <div className="flex items-center gap-md mb-lg">
              <span className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
                <Icon name="event_note" />
              </span>
              <h3 className="font-headline text-headline-md text-on-surface">Upcoming Filing</h3>
            </div>
            <p className="font-label text-label-md font-bold text-on-surface mb-2">
              Value Added Tax (VAT) {nextFiling ? `– ${nextFiling.period}` : ''}
            </p>
            <div className="flex items-center justify-between bg-surface-container-low rounded-xl p-md mb-lg">
              <span className="font-label text-label-sm text-on-surface-variant">Due Date</span>
              <span className="font-label text-label-md font-bold text-on-surface">
                {nextFiling?.dueDate ? new Date(nextFiling.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
              </span>
            </div>
            <button className="w-full h-11 bg-primary text-on-primary rounded-xl font-label text-label-md font-bold shadow-lg shadow-primary/25 hover:bg-primary-container transition-colors">
              Remind Me
            </button>
          </Card>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="px-xl py-lg flex flex-col md:flex-row md:items-center gap-lg justify-between border-b border-outline-variant/5">
          <div>
            <h3 className="font-headline text-headline-md text-on-surface">Detailed Transactions</h3>
            <p className="font-label text-label-sm text-on-surface-variant">Showing {filtered.length} entries</p>
          </div>
          <div className="flex items-center gap-md">
            <button className="flex items-center gap-2 h-10 px-lg bg-surface-container-low rounded-lg font-label text-label-md font-bold text-on-surface hover:bg-surface-container-high transition-colors">
              <Icon name="download" />
              Export CSV
            </button>
            <button className="flex items-center gap-2 h-10 px-lg bg-surface-container-low rounded-lg font-label text-label-md font-bold text-on-surface hover:bg-surface-container-high transition-colors">
              <Icon name="print" />
              Print Report
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] md:min-w-[820px] text-left">
            <thead>
              <tr className="text-[12px] uppercase tracking-wider text-outline border-b border-outline-variant/10 bg-surface-container-low/40">
                <th className="py-3 px-xl font-semibold">Reference</th>
                <th className="py-3 px-4 font-semibold hidden md:table-cell">Date</th>
                <th className="py-3 px-4 font-semibold">Net Amount</th>
                <th className="py-3 px-4 font-semibold hidden md:table-cell">VAT (7.5%)</th>
                <th className="py-3 px-4 font-semibold">Total</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((v) => {
                const status = entryStatus(v)
                const total = n(v.amount) + n(v.vatAmount)
                return (
                  <tr key={v.id} className="border-b border-outline-variant/5 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 px-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-label text-label-md font-bold text-on-surface">#{v.id.slice(0, 8).toUpperCase()}</span>
                        {v.type === 'EXPENSE' && (
                          <Badge tone="outline" className="text-[10px]">
                            Expense
                          </Badge>
                        )}
                      </div>
                      <p className="text-[12px] text-on-surface-variant">{v.description ?? v.category}</p>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell text-[12px] text-on-surface-variant">
                      {new Date(v.occurredAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-4 font-body text-body-md font-semibold text-on-surface">
                      FCFA {Math.round(n(v.amount)).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell font-body text-body-md text-on-surface">
                      FCFA {Math.round(n(v.vatAmount)).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 font-body text-body-md font-bold text-on-surface">
                      FCFA {Math.round(total).toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <Badge tone={statusTone(status)} icon={statusIcon(status)}>
                        {status}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Pagination
          page={safePage}
          pages={pages}
          showing={`Showing 1 to ${visible.length} of ${filtered.length} entries`}
          onPage={setPage}
        />
      </Card>
    </div>
  )
}
