import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Icon } from '@/components/ui/Icon'
import { inventoryService } from '@/lib/api'

const categories = ['General', 'Grocery', 'Fashion', 'Pharmacy', 'Electronics', 'Other']

const inputClass =
  'w-full h-11 px-md bg-surface-container rounded-xl outline-none focus:ring-2 focus:ring-primary/20 border-l-4 border-transparent focus:border-primary transition-all'

export function ProductFormModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    name: '',
    category: '',
    sku: '',
    unitPrice: '',
    stockQuantity: '',
    reorderThreshold: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setForm({ name: '', category: '', sku: '', unitPrice: '', stockQuantity: '', reorderThreshold: '' })
      setError('')
    }
  }, [open])

  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }))

  const submit = async () => {
    if (!form.name.trim()) {
      setError('Product name is required.')
      return
    }
    const price = Number(form.unitPrice)
    if (form.unitPrice === '' || Number.isNaN(price) || price < 0) {
      setError('Enter a valid unit price.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await inventoryService.create({
        name: form.name.trim(),
        category: form.category.trim() || 'General',
        sku: form.sku.trim() || undefined,
        unitPrice: price,
        stockQuantity: Math.max(0, Number(form.stockQuantity) || 0),
        reorderThreshold: Math.max(0, Number(form.reorderThreshold) || 0),
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add the product.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} className="max-w-xl">
      <div className="p-xl">
        <div className="flex items-center justify-between mb-lg">
          <div className="flex items-center gap-md">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Icon name="inventory_2" className="text-on-primary" />
            </div>
            <div>
              <h3 className="font-headline text-headline-md text-on-surface">Add New Product</h3>
              <p className="font-label text-label-sm text-on-surface-variant">It will be available for sales right away</p>
            </div>
          </div>
          <button className="text-on-surface-variant hover:text-on-surface transition-colors" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        <div className="flex flex-col gap-lg">
          <div className="flex flex-col gap-1">
            <label className="font-label text-label-md text-on-surface-variant">
              Product Name <span className="text-error">*</span>
            </label>
            <input
              className={inputClass}
              placeholder="e.g. Acoustic Pro Headphones"
              value={form.name}
              onChange={(e) => set('name')(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
            <div className="flex flex-col gap-1">
              <label className="font-label text-label-md text-on-surface-variant">Category</label>
              <div className="relative">
                <select
                  className={`${inputClass} appearance-none cursor-pointer pr-10`}
                  value={form.category}
                  onChange={(e) => set('category')(e.target.value)}
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
                value={form.sku}
                onChange={(e) => set('sku')(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg">
            <div className="flex flex-col gap-1">
              <label className="font-label text-label-md text-on-surface-variant">
                Unit Price <span className="text-error">*</span>
              </label>
              <input
                className={inputClass}
                placeholder="0"
                type="number"
                min={0}
                value={form.unitPrice}
                onChange={(e) => set('unitPrice')(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label text-label-md text-on-surface-variant">Stock Qty</label>
              <input
                className={inputClass}
                placeholder="0"
                type="number"
                min={0}
                value={form.stockQuantity}
                onChange={(e) => set('stockQuantity')(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label text-label-md text-on-surface-variant">Low Stock Alert</label>
              <input
                className={inputClass}
                placeholder="0"
                type="number"
                min={0}
                value={form.reorderThreshold}
                onChange={(e) => set('reorderThreshold')(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-error-container/40 rounded-xl px-md py-sm">
              <Icon name="error_outline" className="text-error text-[18px] mt-px flex-shrink-0" />
              <p className="font-body text-body-sm text-error">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-md pt-lg border-t border-surface-variant">
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
              {saving ? 'Saving…' : 'Add Product'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
