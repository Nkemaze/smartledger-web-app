import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'
import { Pagination } from '@/components/ui/Pagination'
import { Modal } from '@/components/ui/Modal'
import { transactionService, inventoryService, customerService } from '@/lib/api'
import { useAuth } from '@/lib/auth/AuthContext'
import type { ApiTransaction, ApiProduct, ApiCustomer } from '@/lib/api'

const n = (v: number | string | null | undefined) => Number(v ?? 0)

const periods = ['Today', 'This Week', 'Month']
const statusTone = (status: string) => (status === 'Success' ? 'success' : status === 'Pending' ? 'warning' : 'error')

const RING_COLORS = ['#006b2c', '#0051d5', '#e9a800', '#7f3df2', '#d94841', '#0ca678']

function periodStart(period: string): Date {
  const now = new Date()
  if (period === 'Today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }
  if (period === 'This Week') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
  }
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

function SalesTable({ data, onView }: { data: ApiTransaction[]; onView: (t: ApiTransaction) => void }) {
  return (
    <table className="w-full min-w-[820px] text-left">
      <thead>
        <tr className="text-[12px] uppercase tracking-wider text-outline border-b border-outline-variant/10">
          <th className="py-3 px-xl font-semibold">Date & Time</th>
          <th className="py-3 px-4 font-semibold">Order ID</th>
          <th className="py-3 px-4 font-semibold">Customer</th>
          <th className="py-3 px-4 font-semibold">Items</th>
          <th className="py-3 px-4 font-semibold">Status</th>
          <th className="py-3 px-4 font-semibold">Amount</th>
          <th className="py-3 px-4 font-semibold">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((t) => {
          const customer = t.customer?.name ?? 'Walk-in'
          const initials = customer
            .split(' ')
            .map((w) => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
          const date = new Date(t.occurredAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })
          const time = new Date(t.occurredAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
          const itemCount = t.items?.length ?? 0
          return (
            <tr
              key={t.id}
              className="border-b border-outline-variant/5 last:border-0 hover:bg-surface-container-low/50 transition-colors cursor-pointer"
              onClick={() => onView(t)}
            >
              <td className="py-4 px-xl">
                <p className="font-label text-label-md font-semibold text-on-surface">
                  {date}, {time}
                </p>
              </td>
              <td className="py-4 px-4">
                <span className="font-label text-label-md font-mono text-primary bg-primary/5 px-2 py-1 rounded">
                  {t.id.slice(0, 8).toUpperCase()}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-md">
                  <Avatar initials={initials || '?'} size="sm" />
                  <div>
                    <p className="font-label text-label-md font-semibold text-on-surface">{customer}</p>
                    <p className="text-[12px] text-on-surface-variant">{t.category}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4 font-body text-body-md text-on-surface-variant">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </td>
              <td className="py-4 px-4">
                <Badge tone={statusTone('Success')}>Success</Badge>
              </td>
              <td className="py-4 px-4">
                <p className="font-body text-body-lg font-bold text-on-surface">
                  FCFA {Math.round(n(t.amount)).toLocaleString()}
                </p>
                <p className="text-[12px] text-on-surface-variant">{t.vatRate ? `VAT ${n(t.vatRate)}%` : 'No VAT'}</p>
              </td>
              <td className="py-4 px-4">
                <button className="text-on-surface-variant hover:text-primary transition-colors" onClick={(e) => { e.stopPropagation(); onView(t) }}>
                  <Icon name="more_vert" />
                </button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function CategoryRing({ rows, total }: { rows: Array<{ label: string; value: number }>; total: number }) {
  const size = 128
  const strokeWidth = 18
  let offset = 0
  return (
    <div className="flex items-center gap-xl">
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={size / 2 - strokeWidth / 2} fill="none" stroke="#eef2f7" strokeWidth={strokeWidth} />
          {rows.map((m, i) => {
            const r = size / 2 - strokeWidth / 2
            const circumference = 2 * Math.PI * r
            const len = (m.value / 100) * circumference
            const dashOffset = -offset
            offset += len
            return (
              <circle
                key={m.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={RING_COLORS[i % RING_COLORS.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={`${len} ${circumference - len}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-headline text-headline-md text-on-surface">
            {total >= 1_000_000 ? `FCFA ${(total / 1_000_000).toFixed(1)}M` : total >= 1_000 ? `FCFA ${Math.round(total / 1_000)}K` : `FCFA ${Math.round(total)}`}
          </span>
          <span className="font-label text-label-sm text-on-surface-variant uppercase tracking-wider">Total</span>
        </div>
      </div>
      <div className="space-y-2">
        {rows.map((m, i) => (
          <div key={m.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: RING_COLORS[i % RING_COLORS.length] }} />
            <span className="font-label text-label-md text-on-surface-variant w-20 truncate">{m.label}</span>
            <span className="font-label text-label-md font-bold text-on-surface">{m.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReceiptModal({ t, onClose }: { t: ApiTransaction | null; onClose: () => void }) {
  return (
    <Modal open={!!t} onClose={onClose}>
      {t && (
        <div className="p-xl">
          <div className="flex items-center justify-between mb-lg">
            <div className="flex items-center gap-md">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Icon name="receipt_long" className="text-on-primary" />
              </div>
              <div>
                <h3 className="font-headline text-headline-md text-on-surface">Transaction Details</h3>
                <p className="font-label text-label-sm text-on-surface-variant">{t.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>
            <button className="text-on-surface-variant hover:text-on-surface transition-colors" onClick={onClose}>
              <Icon name="close" />
            </button>
          </div>
          <div className="bg-surface-container rounded-2xl p-lg mb-lg">
            <div className="flex justify-between mb-1">
              <p className="font-headline text-title-lg text-on-surface">SMARTLEDGER HQ</p>
              <Badge tone={t.type === 'INCOME' ? 'success' : 'warning'}>{t.type === 'INCOME' ? 'Income' : 'Expense'}</Badge>
            </div>
            <p className="text-[12px] text-on-surface-variant">{t.category}</p>
            <p className="text-[12px] text-on-surface-variant">{t.description ?? 'No description'}</p>
            <div className="border-t border-dashed border-outline-variant/40 my-md pt-md space-y-2">
              {t.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-[12px] text-on-surface-variant">
                  <span>Item x {item.quantity}</span>
                  <span>FCFA {Math.round(n(item.unitPrice) * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              {t.vatAmount !== undefined && t.vatAmount !== null && (
                <div className="flex justify-between text-[12px] text-on-surface-variant">
                  <span>VAT ({n(t.vatRate)}%)</span>
                  <span>FCFA {Math.round(n(t.vatAmount)).toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-dashed border-outline-variant/40 my-md" />
              <div className="flex justify-between items-center">
                <span className="font-label text-label-md font-bold text-on-surface">Total</span>
                <span className="font-headline text-headline-md text-on-surface">FCFA {Math.round(n(t.amount)).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

const PAGE_SIZE = 8

type SaleLine = { productId: string; quantity: number; unitPrice: string }

function SaleFormModal({
  open,
  onClose,
  products,
  customers,
  defaultVatRate,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  products: ApiProduct[]
  customers: ApiCustomer[]
  defaultVatRate: number
  onSaved: () => void
}) {
  const [lines, setLines] = useState<SaleLine[]>([{ productId: '', quantity: 1, unitPrice: '' }])
  const [customerId, setCustomerId] = useState('')
  const [category, setCategory] = useState('Sales')
  const [description, setDescription] = useState('')
  const [vatRate, setVatRate] = useState(String(defaultVatRate))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setLines([{ productId: '', quantity: 1, unitPrice: '' }])
      setCustomerId('')
      setCategory('Sales')
      setDescription('')
      setVatRate(String(defaultVatRate))
      setError('')
    }
  }, [open, defaultVatRate])

  const total = lines.reduce((sum, l) => sum + Math.max(0, l.quantity) * n(l.unitPrice), 0)

  const setLine = (index: number, patch: Partial<SaleLine>) =>
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)))

  const handleProductChange = (index: number, productId: string) => {
    const p = products.find((x) => x.id === productId)
    setLine(index, { productId, unitPrice: p ? String(n(p.unitPrice)) : '' })
  }

  const submit = async () => {
    if (lines.length === 0 || lines.some((l) => !l.productId || l.quantity < 1)) {
      setError('Add at least one item with a product and a quantity.')
      return
    }
    if (total <= 0) {
      setError('Total must be greater than zero.')
      return
    }
    for (const l of lines) {
      const p = products.find((x) => x.id === l.productId)
      if (p && l.quantity > p.stockQuantity) {
        setError(`"${p.name}" only has ${p.stockQuantity} in stock.`)
        return
      }
    }
    setSaving(true)
    setError('')
    try {
      await transactionService.create({
        type: 'INCOME',
        category,
        amount: total,
        description: description || null,
        customerId: customerId || null,
        vatRate: n(vatRate) > 0 ? n(vatRate) : null,
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity, unitPrice: n(l.unitPrice) })),
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to record the sale.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} className="max-w-2xl">
      <div className="p-xl">
        <div className="flex items-center justify-between mb-lg">
          <div className="flex items-center gap-md">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Icon name="point_of_sale" className="text-on-primary" />
            </div>
            <div>
              <h3 className="font-headline text-headline-md text-on-surface">Record New Sale</h3>
              <p className="font-label text-label-sm text-on-surface-variant">Stock is decremented when the sale is saved</p>
            </div>
          </div>
          <button className="text-on-surface-variant hover:text-on-surface transition-colors" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        <div className="space-y-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <label className="block">
              <span className="font-label text-label-sm text-on-surface-variant mb-1 block">Customer</span>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full h-11 px-lg bg-surface-container-lowest rounded-xl font-label text-label-md text-on-surface border border-outline-variant/30 cursor-pointer"
              >
                <option value="">Walk-in customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="font-label text-label-sm text-on-surface-variant mb-1 block">Category</span>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-lg bg-surface-container-lowest rounded-xl font-label text-label-md text-on-surface border border-outline-variant/30"
              />
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-md">
              <span className="font-label text-label-sm text-on-surface-variant">Items</span>
              <button
                onClick={() => setLines((prev) => [...prev, { productId: '', quantity: 1, unitPrice: '' }])}
                className="flex items-center gap-1 font-label text-label-md text-primary font-bold hover:underline"
              >
                <Icon name="add" />
                Add item
              </button>
            </div>
            <div className="space-y-md">
              {lines.map((line, i) => {
                const product = products.find((p) => p.id === line.productId)
                return (
                  <div key={i} className="flex flex-col md:flex-row md:items-end gap-md p-lg bg-surface-container-low/60 rounded-xl">
                    <label className="flex-1 block">
                      <span className="font-label text-label-sm text-on-surface-variant mb-1 block">Product</span>
                      <select
                        value={line.productId}
                        onChange={(e) => handleProductChange(i, e.target.value)}
                        className="w-full h-10 px-lg bg-surface-container-lowest rounded-lg font-label text-label-md text-on-surface border border-outline-variant/30 cursor-pointer"
                      >
                        <option value="">Select product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.stockQuantity} in stock)
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="w-24 block">
                      <span className="font-label text-label-sm text-on-surface-variant mb-1 block">Qty</span>
                      <input
                        type="number"
                        min={1}
                        max={product?.stockQuantity ?? undefined}
                        value={line.quantity}
                        onChange={(e) => setLine(i, { quantity: Number(e.target.value) })}
                        className="w-full h-10 px-lg bg-surface-container-lowest rounded-lg font-label text-label-md text-on-surface border border-outline-variant/30"
                      />
                    </label>
                    <label className="w-36 block">
                      <span className="font-label text-label-sm text-on-surface-variant mb-1 block">Unit price</span>
                      <input
                        type="number"
                        min={0}
                        value={line.unitPrice}
                        onChange={(e) => setLine(i, { unitPrice: e.target.value })}
                        className="w-full h-10 px-lg bg-surface-container-lowest rounded-lg font-label text-label-md text-on-surface border border-outline-variant/30"
                      />
                    </label>
                    {lines.length > 1 && (
                      <button
                        onClick={() => setLines((prev) => prev.filter((_, idx) => idx !== i))}
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/50 transition-colors"
                        title="Remove item"
                      >
                        <Icon name="delete_outline" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <label className="block">
              <span className="font-label text-label-sm text-on-surface-variant mb-1 block">VAT rate (%)</span>
              <input
                type="number"
                min={0}
                step="0.5"
                value={vatRate}
                onChange={(e) => setVatRate(e.target.value)}
                className="w-full h-11 px-lg bg-surface-container-lowest rounded-xl font-label text-label-md text-on-surface border border-outline-variant/30"
              />
            </label>
            <label className="block">
              <span className="font-label text-label-sm text-on-surface-variant mb-1 block">Description (optional)</span>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Retail sale – weekly groceries"
                className="w-full h-11 px-lg bg-surface-container-lowest rounded-xl font-body text-body-md text-on-surface border border-outline-variant/30"
              />
            </label>
          </div>

          <div className="bg-primary-container/30 rounded-xl p-lg flex items-center justify-between">
            <div>
              <p className="font-label text-label-sm text-on-surface-variant">Total</p>
              <p className="font-headline text-headline-md text-on-surface">FCFA {Math.round(total).toLocaleString()}</p>
            </div>
            <p className="text-[12px] text-on-surface-variant">VAT added automatically at {vatRate || '0'}%</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-error-container/40 rounded-xl px-lg py-md">
              <Icon name="error_outline" className="text-error" />
              <p className="font-body text-body-sm text-error">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-md">
            <button
              onClick={onClose}
              className="h-11 px-lg bg-surface-container rounded-xl font-label text-label-md font-bold text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => void submit()}
              disabled={saving}
              className="flex items-center gap-2 h-11 px-lg bg-primary text-on-primary rounded-xl font-label text-label-md font-bold shadow-lg shadow-primary/25 hover:bg-primary-container transition-colors disabled:opacity-60"
            >
              {saving ? <Icon name="sync" className="animate-spin" /> : <Icon name="check" />}
              {saving ? 'Recording…' : 'Record Sale'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export function SalesTransactions() {
  const { business } = useAuth()
  const [period, setPeriod] = useState('Today')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<ApiTransaction | null>(null)
  const [rows, setRows] = useState<ApiTransaction[]>([])
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [customers, setCustomers] = useState<ApiCustomer[]>([])
  const [recording, setRecording] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [txs, prods, custs] = await Promise.all([
        transactionService.list({ type: 'INCOME', limit: 100 }),
        inventoryService.list(),
        customerService.list(),
      ])
      setRows(txs)
      setProducts(prods)
      setCustomers(custs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load transactions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    const start = periodStart(period).getTime()
    return rows.filter((t) => new Date(t.occurredAt).getTime() >= start)
  }, [rows, period])

  const stats = useMemo(() => {
    const total = filtered.reduce((sum, t) => sum + n(t.amount), 0)
    const avg = filtered.length > 0 ? total / filtered.length : 0
    const byCategory = new Map<string, number>()
    filtered.forEach((t) => byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + n(t.amount)))
    const ringRows = Array.from(byCategory.entries())
      .map(([label, value]) => ({ label, value: total > 0 ? Math.round((value / total) * 100) : 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
    return { total, avg, count: filtered.length, ringRows }
  }, [filtered])

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const safePage = Math.min(page, pages)
  const visible = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const start = rows.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1

  return (
    <div className="space-y-xl">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-lg">
        <div>
          <div className="flex items-center gap-1 text-[12px] text-on-surface-variant mb-1">
            <span>Revenue Ledger</span>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-on-surface font-semibold">Sales & Transactions</span>
          </div>
          <h1 className="font-headline text-headline-lg text-on-surface">Sales & Transactions</h1>
          <p className="font-body text-body-md text-on-surface-variant mt-1">
            Track real-time revenue performance and manage historical order data across all branches.
          </p>
        </div>
        <div className="flex items-center gap-md">
          <div className="flex bg-surface-container-lowest rounded-full p-1 shadow-sm">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-lg py-2 rounded-full font-label text-label-md transition-all ${
                  period === p ? 'bg-primary text-on-primary shadow-md shadow-primary/25' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setSaved(false)
              setRecording(true)
            }}
            className="flex items-center gap-2 h-11 px-lg bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label text-label-md font-bold shadow-lg shadow-primary/25 transition-all"
          >
            <Icon name="add" />
            Record New Sale
          </button>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-primary-container/40 rounded-xl px-lg py-md">
          <Icon name="check_circle" className="text-primary" />
          <p className="font-body text-body-md text-on-surface">Sale recorded successfully.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        <StatCard
          label={`Total Sales (${period})`}
          value={`FCFA ${Math.round(stats.total).toLocaleString()}`}
          icon="payments"
          iconBg="bg-primary/10"
          iconColor="text-primary"
          trend={{ text: `${stats.count} orders`, color: 'text-primary', icon: 'trending_up' }}
          footnote="Income transactions in range"
        />
        <StatCard
          label="Avg. Transaction Value"
          value={`FCFA ${Math.round(stats.avg).toLocaleString()}`}
          icon="receipt"
          iconBg="bg-secondary/10"
          iconColor="text-secondary"
          footnote={`Based on ${stats.count} orders ${period.toLowerCase() === 'today' ? 'today' : 'in range'}`}
        />
        <Card className="p-xl">
          <div className="flex items-center justify-between mb-lg">
            <div>
              <p className="font-label text-label-md text-on-surface-variant mb-1">Sales by Category</p>
              <p className="font-headline text-headline-lg text-on-surface">
                FCFA {stats.total >= 1_000_000 ? `${(stats.total / 1_000_000).toFixed(1)}M` : Math.round(stats.total).toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center">
              <Icon name="donut_small" />
            </div>
          </div>
          {stats.ringRows.length > 0 ? (
            <CategoryRing rows={stats.ringRows} total={stats.total} />
          ) : (
            <p className="font-body text-body-md text-on-surface-variant py-lg text-center">No sales in this period.</p>
          )}
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="px-xl py-lg flex flex-col lg:flex-row lg:items-center gap-lg justify-between border-b border-outline-variant/5">
          <button className="flex items-center gap-2 w-fit font-label text-label-md text-on-surface font-bold hover:text-primary transition-colors">
            <Icon name="calendar_today" className="text-primary" />
            {period} range
            <Icon name="expand_more" className="text-on-surface-variant" />
          </button>
          <div className="flex items-center gap-md">
            <button className="flex items-center gap-2 h-10 px-lg bg-surface-container-low rounded-lg font-label text-label-md text-on-surface font-bold hover:bg-surface-container-high transition-colors">
              <Icon name="filter_list" />
              Filters
              <span className="w-5 h-5 bg-primary text-on-primary rounded-full text-[11px] flex items-center justify-center">2</span>
            </button>
            <div className="w-px h-6 bg-outline-variant/20" />
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors" title="Export CSV">
              <Icon name="csv" />
            </button>
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors" title="Print">
              <Icon name="print" />
            </button>
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors" title="Download PDF">
              <Icon name="picture_as_pdf" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-2xl">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <SalesTable data={visible} onView={setSelected} />
          )}
        </div>
        <Pagination
          page={safePage}
          pages={pages}
          showing={`Showing ${start}-${Math.min(safePage * PAGE_SIZE, rows.length)} of ${rows.length} transactions`}
          onPage={setPage}
        />
      </Card>

      <ReceiptModal t={selected} onClose={() => setSelected(null)} />

      <SaleFormModal
        open={recording}
        onClose={() => setRecording(false)}
        products={products}
        customers={customers}
        defaultVatRate={n(business?.vatRate) > 0 ? n(business?.vatRate) : 7.5}
        onSaved={() => {
          setRecording(false)
          setSaved(true)
          setPeriod('Today')
          void load()
        }}
      />
    </div>
  )
}
