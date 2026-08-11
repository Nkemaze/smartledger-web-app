import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { Pagination } from '@/components/ui/Pagination'
import { inventoryService } from '@/lib/api'
import type { ApiProduct } from '@/lib/api'

const n = (v: number | string | null | undefined) => Number(v ?? 0)

const stockFilters = [
  { label: 'In Stock', tone: 'success' as const },
  { label: 'Low Stock', tone: 'warning' as const },
  { label: 'Out of Stock', tone: 'error' as const },
]

type StockStatus = 'Healthy' | 'Low Stock' | 'Out of Stock'

const statusTone = (status: StockStatus) =>
  status === 'Healthy' ? 'success' : status === 'Low Stock' ? 'warning' : 'error'

function stockStatus(item: ApiProduct): StockStatus {
  if (item.stockQuantity <= 0) return 'Out of Stock'
  if (item.stockQuantity <= item.reorderThreshold) return 'Low Stock'
  return 'Healthy'
}

function statusText(status: StockStatus, item: ApiProduct) {
  if (status === 'Out of Stock') return 'Out of stock'
  return `${item.stockQuantity} units`
}

function ProductRow({ item }: { item: ApiProduct }) {
  const status = stockStatus(item)
  return (
    <tr className="border-b border-outline-variant/5 last:border-0 hover:bg-surface-container-low/50 transition-colors">
      <td className="py-4 pl-xl pr-4">
        <div className="flex items-center gap-md">
          <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${status === 'Out of Stock' ? 'bg-surface-container-high grayscale' : 'bg-primary/10'}`}>
            <Icon name="inventory_2" className={status === 'Out of Stock' ? 'text-outline' : 'text-primary'} />
          </div>
          <div>
            <p className="font-headline text-title-lg text-on-surface">{item.name}</p>
            <p className="text-[12px] text-on-surface-variant">{item.category ?? 'Uncategorized'}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className="font-label text-label-md text-on-surface-variant">{item.sku ?? '—'}</span>
      </td>
      <td className="py-4 px-4">
        <Badge tone="neutral">{item.category ?? 'Other'}</Badge>
      </td>
      <td className="py-4 px-4">
        <Badge tone={statusTone(status)} dot>
          {statusText(status, item)}
        </Badge>
      </td>
      <td className="py-4 px-4 font-body text-body-md font-semibold text-on-surface">
        FCFA {Math.round(n(item.unitPrice)).toLocaleString()}
      </td>
      <td className="py-4 px-4 font-body text-body-md font-semibold text-on-surface">
        FCFA {Math.round(n(item.unitPrice) * item.stockQuantity).toLocaleString()}
      </td>
      <td className="py-4 px-4">
        <button className="text-on-surface-variant hover:text-primary transition-colors">
          <Icon name="more_vert" />
        </button>
      </td>
    </tr>
  )
}

const PAGE_SIZE = 8

export function Inventory() {
  const [items, setItems] = useState<ApiProduct[]>([])
  const [category, setCategory] = useState('All Categories')
  const [stockFilter, setStockFilter] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setItems(await inventoryService.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load inventory.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const categories = useMemo(
    () => ['All Categories', ...Array.from(new Set(items.map((i) => i.category).filter((c): c is string => Boolean(c))))],
    [items]
  )

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (category !== 'All Categories' && i.category !== category) return false
      if (stockFilter === 'In Stock') return stockStatus(i) === 'Healthy'
      if (stockFilter === 'Low Stock') return stockStatus(i) === 'Low Stock'
      if (stockFilter === 'Out of Stock') return stockStatus(i) === 'Out of Stock'
      return true
    })
  }, [items, category, stockFilter])

  const stats = useMemo(() => {
    const totalValue = items.reduce((sum, i) => sum + n(i.unitPrice) * i.stockQuantity, 0)
    const toReorder = items.filter((i) => stockStatus(i) !== 'Healthy')
    const top = [...items].sort((a, b) => n(b.unitPrice) * b.stockQuantity - n(a.unitPrice) * a.stockQuantity)[0]
    return { totalValue, reorderCount: toReorder.length, top }
  }, [items])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pages)
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const start = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1

  return (
    <div className="space-y-xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-lg">
        <div>
          <div className="flex items-center gap-1 text-[12px] text-on-surface-variant mb-1">
            <span>Inventory</span>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-on-surface font-semibold">Product Catalog</span>
          </div>
          <h1 className="font-headline text-headline-lg text-on-surface">Product Catalog</h1>
        </div>
        <div className="flex items-center gap-md">
          <button className="flex items-center gap-2 h-11 px-lg bg-surface-container-lowest text-on-surface rounded-xl font-label text-label-md font-bold shadow-sm hover:bg-surface-container-high transition-colors">
            <Icon name="download" className="text-primary" />
            Export CSV
          </button>
          <button className="flex items-center gap-2 h-11 px-lg bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label text-label-md font-bold shadow-lg shadow-primary/25 transition-all">
            <Icon name="add_circle" />
            Add New Product
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
        <StatCard
          label="Total Inventory Value"
          value={`FCFA ${Math.round(stats.totalValue).toLocaleString()}`}
          icon="account_balance_wallet"
          iconBg="bg-primary/10"
          iconColor="text-primary"
          trend={{ text: `${items.length} products`, color: 'text-primary' }}
          footnote="Across all categories"
        />
        <StatCard
          label="Items to Reorder"
          value={`${stats.reorderCount} Items`}
          icon="priority_high"
          iconBg="bg-error/10"
          iconColor="text-error"
          trend={{ text: stats.reorderCount > 0 ? 'Action needed' : 'All good', color: stats.reorderCount > 0 ? 'text-error' : 'text-primary' }}
          footnote="At or below reorder threshold"
        />
        <StatCard
          label="Top Performer (Value)"
          value={stats.top?.name ?? '—'}
          icon="stars"
          iconBg="bg-tertiary/10"
          iconColor="text-tertiary"
          trend={stats.top ? { text: `FCFA ${Math.round(n(stats.top.unitPrice) * stats.top.stockQuantity).toLocaleString()} in stock`, color: 'text-tertiary' } : undefined}
          footnote="Highest inventory value"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="p-xl flex flex-col lg:flex-row lg:items-center gap-lg justify-between border-b border-outline-variant/5">
          <div className="flex items-center gap-md overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCategory(c)
                  setPage(1)
                }}
                className={`whitespace-nowrap px-md py-2 rounded-full font-label text-label-md transition-all ${
                  category === c
                    ? 'bg-primary text-on-primary shadow-md shadow-primary/25'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {stockFilters.map((f) => (
              <button
                key={f.label}
                onClick={() => {
                  setStockFilter(stockFilter === f.label ? null : f.label)
                  setPage(1)
                }}
                className={`flex items-center gap-2 px-md py-2 rounded-full font-label text-label-md transition-all border ${
                  stockFilter === f.label
                    ? 'border-primary/40 bg-primary-container/40 text-on-surface'
                    : 'border-outline-variant/20 text-on-surface-variant hover:border-outline-variant'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    f.tone === 'success' ? 'bg-primary' : f.tone === 'warning' ? 'bg-amber-500' : 'bg-error'
                  }`}
                />
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="text-[12px] uppercase tracking-wider text-outline border-b border-outline-variant/10 bg-surface-container-low/40">
                <th className="py-3 px-xl font-semibold">Product Details</th>
                <th className="py-3 px-4 font-semibold">SKU</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Stock Status</th>
                <th className="py-3 px-4 font-semibold">Unit Price</th>
                <th className="py-3 px-4 font-semibold">Total Value</th>
                <th className="py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <ProductRow key={item.id} item={item} />
              ))}
              {!loading && visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-2xl text-center">
                    <Icon name="inventory_2" className="text-[48px] text-outline/30 mx-auto mb-md" />
                    <p className="font-headline text-title-lg text-on-surface mb-1">No products found</p>
                    <p className="font-body text-body-md text-on-surface-variant mx-auto max-w-sm">
                      We couldn't find any products matching your current filters.
                    </p>
                    <button
                      className="mt-lg font-label text-label-md text-primary hover:underline font-bold"
                      onClick={() => {
                        setCategory('All Categories')
                        setStockFilter(null)
                      }}
                    >
                      Clear All Filters
                    </button>
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={7} className="py-2xl text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={safePage}
          pages={pages}
          showing={`Showing ${start}-${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length} products`}
          onPage={setPage}
        />
      </Card>
    </div>
  )
}
