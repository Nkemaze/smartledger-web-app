import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout, AmbientBackground } from '@/components/layout/AuthLayout'
import { Icon } from '@/components/ui/Icon'
import { inventoryService } from '@/lib/api'

interface ProductDraft {
  name: string
  category: string
  sku: string
  unitPrice: string
  stockQuantity: string
  reorderThreshold: string
}

const blankProduct = (): ProductDraft => ({
  name: '',
  category: '',
  sku: '',
  unitPrice: '',
  stockQuantity: '',
  reorderThreshold: '',
})

const categories = ['General', 'Grocery', 'Fashion', 'Pharmacy', 'Electronics', 'Other']

const inputClass =
  'w-full h-11 px-md bg-surface-container rounded-xl outline-none focus:ring-2 focus:ring-primary/20 border-l-4 border-transparent focus:border-primary transition-all'

export function ProductOnboarding() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<ProductDraft[]>([blankProduct()])
  const [checking, setChecking] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    inventoryService
      .list()
      .then((items) => {
        if (items.length > 0) navigate('/', { replace: true })
      })
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [navigate])

  const setProduct = (index: number, patch: Partial<ProductDraft>) =>
    setProducts((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)))

  const addProduct = () => setProducts((prev) => [...prev, blankProduct()])

  const removeProduct = (index: number) =>
    setProducts((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)))

  const skip = () => navigate('/', { replace: true })

  const submit = async () => {
    const valid = products
      .map((p) => ({
        ...p,
        name: p.name.trim(),
        category: p.category.trim() || 'General',
        sku: p.sku.trim(),
        unitPrice: p.unitPrice.trim(),
        stockQuantity: p.stockQuantity.trim(),
        reorderThreshold: p.reorderThreshold.trim(),
      }))
      .filter((p) => p.name !== '')

    if (valid.length === 0) {
      setError('Add at least one product, or choose "Skip for now" to continue.')
      return
    }

    const invalid = valid.find((p) => p.unitPrice === '' || Number.isNaN(Number(p.unitPrice)) || Number(p.unitPrice) < 0)
    if (invalid) {
      setError(`"${invalid.name}" needs a valid unit price.`)
      return
    }

    setSaving(true)
    setError('')
    try {
      await Promise.all(
        valid.map((p) =>
          inventoryService.create({
            name: p.name,
            category: p.category,
            sku: p.sku || undefined,
            unitPrice: Number(p.unitPrice),
            stockQuantity: Math.max(0, Number(p.stockQuantity) || 0),
            reorderThreshold: Math.max(0, Number(p.reorderThreshold) || 0),
          })
        )
      )
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save your products. Please try again.')
      setSaving(false)
    }
  }

  if (checking) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="flex flex-col w-full max-w-container-max mx-auto">
        <AmbientBackground />
        <div className="relative z-10 grid lg:grid-cols-[400px_1fr] gap-xl items-start">
          <div className="hidden lg:flex flex-col gap-lg">
            <div className="bg-surface-container-lowest rounded-2xl p-xl shadow-lg flex flex-col gap-lg">
              <div className="flex items-center gap-md">
                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
                  <Icon name="inventory_2" className="text-[24px] text-on-primary-container" />
                </div>
                <div>
                  <h2 className="font-headline text-title-lg text-on-surface">Add your products</h2>
                  <p className="font-label text-label-sm text-on-surface-variant">The backbone of your store</p>
                </div>
              </div>
              <p className="font-body text-body-md text-on-surface-variant">
                Products let you record sales, track stock levels, and generate accurate reports. Add the items you sell
                today — you can always add more later from the Inventory page.
              </p>
              <div className="flex items-start gap-2">
                <Icon name="check_circle" filled className="text-primary" />
                <p className="font-body text-body-sm text-on-surface-variant">
                  You need at least one product to record a sale or transaction.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="check_circle" filled className="text-primary" />
                <p className="font-body text-body-sm text-on-surface-variant">
                  Stock is automatically reduced when you record a sale.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-secondary to-secondary-container rounded-2xl p-xl shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="support_agent" className="text-on-primary" />
                <p className="font-label text-label-md text-on-primary font-bold">Need help?</p>
              </div>
              <p className="font-body text-body-sm text-on-primary/90">
                Not sure what to add? Start with your 5 most popular items and grow from there.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-xl items-center lg:items-stretch lg:justify-center min-h-[80vh]">
            <div className="w-full max-w-[560px] bg-surface-container-lowest rounded-2xl shadow-xl p-xl">
              <div className="mb-xl">
                <h1 className="font-headline text-headline-lg text-on-surface mb-1">Let&apos;s stock your store</h1>
                <p className="font-label text-label-sm text-on-surface-variant">
                  Add your first products so you can start recording sales.
                </p>
              </div>

              <div className="flex flex-col gap-lg">
                {products.map((p, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-md p-lg bg-surface-container-low/60 rounded-2xl border border-outline-variant/10"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-label text-label-md font-bold text-on-surface">
                        <span className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container text-[12px] flex items-center justify-center">
                          {i + 1}
                        </span>
                        Product {i + 1}
                      </span>
                      {products.length > 1 && (
                        <button
                          type="button"
                          className="flex items-center gap-1 font-label text-label-sm text-on-surface-variant hover:text-error transition-colors"
                          onClick={() => removeProduct(i)}
                        >
                          <Icon name="delete_outline" className="text-[18px]" />
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-label text-label-md text-on-surface-variant group-focus-within:text-primary transition-colors">
                        Product Name <span className="text-error">*</span>
                      </label>
                      <input
                        className={inputClass}
                        placeholder="e.g. Acoustic Pro Headphones"
                        value={p.name}
                        onChange={(e) => setProduct(i, { name: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                      <div className="flex flex-col gap-1">
                        <label className="font-label text-label-md text-on-surface-variant">Category</label>
                        <div className="relative">
                          <select
                            className={`${inputClass} appearance-none cursor-pointer pr-10`}
                            value={p.category}
                            onChange={(e) => setProduct(i, { category: e.target.value })}
                          >
                            <option value="">Select category</option>
                            {categories.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <Icon
                            name="expand_more"
                            className="absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-label text-label-md text-on-surface-variant">SKU (optional)</label>
                        <input
                          className={inputClass}
                          placeholder="PH-2024-XB"
                          value={p.sku}
                          onChange={(e) => setProduct(i, { sku: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                      <div className="flex flex-col gap-1">
                        <label className="font-label text-label-md text-on-surface-variant">
                          Unit Price <span className="text-error">*</span>
                        </label>
                        <input
                          className={inputClass}
                          placeholder="0"
                          type="number"
                          min={0}
                          value={p.unitPrice}
                          onChange={(e) => setProduct(i, { unitPrice: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-label text-label-md text-on-surface-variant">Stock Qty</label>
                        <input
                          className={inputClass}
                          placeholder="0"
                          type="number"
                          min={0}
                          value={p.stockQuantity}
                          onChange={(e) => setProduct(i, { stockQuantity: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-label text-label-md text-on-surface-variant">Low Stock Alert</label>
                        <input
                          className={inputClass}
                          placeholder="0"
                          type="number"
                          min={0}
                          value={p.reorderThreshold}
                          onChange={(e) => setProduct(i, { reorderThreshold: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addProduct}
                  className="flex items-center justify-center gap-2 h-12 border-2 border-dashed border-outline-variant/40 rounded-2xl font-label text-label-md text-primary font-bold hover:border-primary/40 hover:bg-primary/5 transition-colors"
                >
                  <Icon name="add" />
                  Add another product
                </button>

                {error && (
                  <div className="flex items-start gap-2 bg-error-container/40 rounded-xl px-md py-sm">
                    <Icon name="error_outline" className="text-error text-[18px] mt-px flex-shrink-0" />
                    <p className="font-body text-body-sm text-error">{error}</p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-xl pt-lg border-t border-surface-variant">
                  <button
                    type="button"
                    className="font-label text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
                    onClick={skip}
                  >
                    Skip for now
                  </button>
                  <button
                    type="button"
                    onClick={() => void submit()}
                    disabled={saving}
                    className="flex items-center gap-2 h-12 px-lg bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label text-label-md font-bold shadow-lg shadow-primary/25 active:scale-[0.98] transition-all disabled:opacity-60"
                  >
                    {saving ? <Icon name="sync" className="animate-spin" /> : null}
                    {saving ? 'Saving...' : 'Save & Continue'}
                    {!saving && <Icon name="arrow_forward" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
