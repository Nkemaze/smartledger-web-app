import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { reportService, taxService } from '@/lib/api'
import type { PnlData, BalanceSheetData, TaxSummary } from '@/lib/api'

const n = (v: number | string | null | undefined) => Number(v ?? 0)

const compactMoney = (v: number) =>
  v >= 1_000_000 ? `FCFA ${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `FCFA ${Math.round(v / 1_000).toLocaleString()}K` : `FCFA ${Math.round(v)}`

const fullMoney = (v: number) => `FCFA ${Math.round(v).toLocaleString()}`

function ReportShell({
  icon,
  iconClass,
  title,
  badge,
  badgeTone,
  description,
  children,
  action,
}: {
  icon: string
  iconClass: string
  title: string
  badge?: string
  badgeTone?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  description: string
  children?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <Card className="p-xl flex flex-col gap-lg h-full">
      <div className="flex items-start justify-between gap-md">
        <div className="flex items-center gap-md">
          <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconClass}`}>
            <Icon name={icon} className="text-[24px]" />
          </span>
          <div>
            <h3 className="font-headline text-headline-md text-on-surface">{title}</h3>
          </div>
        </div>
        {badge && <Badge tone={badgeTone}>{badge}</Badge>}
      </div>
      <p className="font-body text-body-md text-on-surface-variant">{description}</p>
      {children}
      {action}
    </Card>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-outline-variant/5 last:border-0">
      <span className="font-label text-label-sm text-on-surface-variant">{label}</span>
      <span className="font-headline text-title-lg text-on-surface">{value}</span>
    </div>
  )
}

export function ComplianceReports() {
  const [pnl, setPnl] = useState<PnlData | null>(null)
  const [sheet, setSheet] = useState<BalanceSheetData | null>(null)
  const [tax, setTax] = useState<TaxSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [p, b, t] = await Promise.all([reportService.pnl(), reportService.balanceSheet(), taxService.summary()])
      setPnl(p)
      setSheet(b)
      setTax(t)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load reports.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const nextFiling = (tax?.filings ?? []).find((f) => f.dueDate)
  const readiness = (tax?.filings ?? []).some((f) => f.status === 'DRAFT') ? 94 : 98
  const vatNet = n(tax?.vatCollected) - n(tax?.vatPaid)

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
            <span>Regulatory Intelligence</span>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-on-surface font-semibold">Compliance Reports</span>
          </div>
          <h1 className="font-headline text-headline-lg text-on-surface">Compliance Reports</h1>
          <p className="font-body text-body-md text-on-surface-variant mt-1 max-w-2xl">
            Review and finalize your statutory filings. Your transactions are cross-referenced for audit readiness.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-md">
          <button className="flex items-center gap-2 h-11 px-lg bg-surface-container-lowest text-on-surface rounded-xl font-label text-label-md font-bold shadow-sm hover:bg-surface-container-high transition-colors">
            <Icon name="history" className="text-primary" />
            Archive
          </button>
          <button className="flex items-center gap-2 h-11 px-lg bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label text-label-md font-bold shadow-lg shadow-primary/25 transition-all">
            <Icon name="file_download" />
            Batch Export (PDF/XLS)
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
        <ReportShell
          icon="verified_user"
          iconClass="bg-primary/10 text-primary"
          title="Filing Readiness Score"
          badge={readiness >= 98 ? 'Ready' : 'Attention'}
          badgeTone={readiness >= 98 ? 'success' : 'warning'}
          description="Your business readiness for statutory filings, based on draft filings still to be prepared."
        >
          <div className="flex items-center gap-xl">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 96 96" className="w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="42" fill="none" stroke="#e5eeff" strokeWidth="10" />
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  fill="none"
                  stroke="#006b2c"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(readiness / 100) * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-headline text-headline-lg text-primary">{readiness}</span>
              </div>
            </div>
            <div>
              <p className="font-label text-label-sm text-on-surface-variant mb-1">of 100</p>
              <p className="font-body text-body-md text-on-surface">
                You have <span className="font-bold text-warning">{(tax?.filings ?? []).filter((f) => f.status === 'DRAFT').length} items</span> still
                in draft.
              </p>
            </div>
          </div>
        </ReportShell>

        <ReportShell
          icon="calendar_month"
          iconClass="bg-secondary/10 text-secondary"
          title="Next Deadline"
          badge={nextFiling ? 'Scheduled' : 'None'}
          badgeTone="warning"
          description="Keep every transaction reconciled before submission deadlines."
        >
          <div className="bg-secondary-container/30 rounded-xl p-lg flex items-center justify-between">
            <div>
              <p className="font-headline text-title-lg text-on-surface">
                VAT Return {nextFiling ? `– ${nextFiling.period}` : ''}
              </p>
              <p className="font-label text-label-md text-on-surface-variant">
                {nextFiling?.dueDate
                  ? `Due ${new Date(nextFiling.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`
                  : 'No upcoming filing'}
              </p>
            </div>
            <button className="flex items-center gap-2 h-10 px-lg bg-secondary text-on-primary rounded-lg font-label text-label-md font-bold hover:bg-secondary-container transition-colors">
              <Icon name="notifications_active" />
              Remind Staff
            </button>
          </div>
        </ReportShell>

        <ReportShell
          icon="payments"
          iconClass="bg-primary/10 text-primary"
          title="Profit & Loss (Tax View)"
          badge="Ready for Filing"
          badgeTone="success"
          description="Revenue vs expenses before and after VAT, used to calculate your final tax position."
          action={
            <button className="flex items-center gap-1 font-label text-label-md text-primary hover:underline font-bold w-fit">
              View Detailed Adjustments
              <Icon name="arrow_forward" />
            </button>
          }
        >
          <div className="rounded-xl bg-surface-container-low/60 p-lg space-y-1">
            <StatRow label="Gross Income" value={fullMoney(n(pnl?.revenue))} />
            <StatRow label="Gross Profit" value={fullMoney(n(pnl?.grossProfit))} />
            <StatRow label="Net Profit" value={fullMoney(n(pnl?.netProfit))} />
          </div>
        </ReportShell>

        <ReportShell
          icon="account_balance"
          iconClass="bg-warning/10 text-warning"
          title="Balance Sheet"
          badge="Available"
          badgeTone="info"
          description="A snapshot of your financial position (Assets, Liabilities, Equity) for lenders and annual returns."
        >
          <div className="rounded-xl bg-surface-container-low/60 p-lg space-y-1">
            <StatRow label="Total Assets" value={fullMoney(n(sheet?.assets.total))} />
            <StatRow label="Total Liabilities" value={fullMoney(n(sheet?.liabilities.total))} />
            <StatRow label="Equity" value={fullMoney(n(sheet?.equity))} />
          </div>
        </ReportShell>

        <ReportShell
          icon="receipt_long"
          iconClass="bg-tertiary/10 text-tertiary"
          title="VAT Return"
          badge="Calculated"
          badgeTone="info"
          description="Aggregates VAT collected on sales vs. VAT paid on inputs."
          action={
            <button className="flex items-center gap-1 font-label text-label-md text-primary hover:underline font-bold w-fit">
              Review Box-by-Box
              <Icon name="arrow_forward" />
            </button>
          }
        >
          <div className="grid grid-cols-2 gap-md">
            <div className="bg-surface-container-low/60 rounded-xl p-lg">
              <p className="font-label text-label-sm text-on-surface-variant mb-1">Net VAT</p>
              <p className="font-headline text-headline-md text-primary">{compactMoney(vatNet)}</p>
            </div>
            <div className="bg-surface-container-low/60 rounded-xl p-lg space-y-2">
              <div className="flex justify-between text-[12px]">
                <span className="text-on-surface-variant">Output VAT</span>
                <span className="font-bold text-on-surface">{compactMoney(n(tax?.vatCollected))}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-on-surface-variant">Input VAT</span>
                <span className="font-bold text-on-surface">{compactMoney(n(tax?.vatPaid))}</span>
              </div>
            </div>
          </div>
        </ReportShell>

        <ReportShell
          icon="history_edu"
          iconClass="bg-secondary/10 text-secondary"
          title="Annual Audit Trail"
          badge="Logs Active"
          badgeTone="success"
          description="Comprehensive record of every change made to financial data, providing proof of origin for tax inspectors."
          action={
            <button className="flex items-center gap-2 h-11 px-lg bg-secondary text-on-primary rounded-xl font-label text-label-md font-bold hover:bg-secondary-container transition-colors w-fit">
              <Icon name="file_download" />
              Generate Full Log
            </button>
          }
        >
          <div className="space-y-3">
            <div className="flex items-center gap-md">
              <span className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Icon name="verified" />
              </span>
              <div>
                <p className="font-label text-label-md font-semibold text-on-surface">
                  {(tax?.filings ?? []).length} filing(s) recorded
                </p>
                <p className="text-[12px] text-on-surface-variant">System • live</p>
              </div>
            </div>
            <div className="flex items-center gap-md">
              <span className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <Icon name="smart_toy" />
              </span>
              <div>
                <p className="font-label text-label-md font-semibold text-on-surface">Transactions tracked for VAT</p>
                <p className="text-[12px] text-on-surface-variant">Tax module • live</p>
              </div>
            </div>
          </div>
        </ReportShell>
      </div>

      <Card className="p-xl bg-gradient-to-br from-primary-container/20 to-secondary-container/20 flex flex-col md:flex-row items-center justify-between gap-lg border border-primary/10">
        <div className="flex items-center gap-md">
          <span className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <Icon name="support_agent" className="text-on-primary text-[24px]" />
          </span>
          <div>
            <h3 className="font-headline text-title-lg text-on-surface">Expert Tax Support</h3>
            <p className="font-body text-body-md text-on-surface-variant">
              Have a question about your filings? Our specialists are available 24/7.
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 h-11 px-lg bg-primary text-on-primary rounded-xl font-label text-label-md font-bold shadow-lg shadow-primary/25 hover:bg-primary-container transition-colors">
          <Icon name="chat" />
          Talk to an Expert
        </button>
      </Card>
    </div>
  )
}
