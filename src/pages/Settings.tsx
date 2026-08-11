import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/lib/auth/AuthContext'
import { businessService } from '@/lib/api'

const shopTypes = [
  { value: 'grocery', label: 'Grocery & Supermarket' },
  { value: 'fashion', label: 'Fashion & Apparel' },
  { value: 'pharmacy', label: 'Pharmacy & Health' },
  { value: 'electronics', label: 'Electronics & Tech' },
  { value: 'specialty', label: 'Specialty Retail' },
]

const currencies = [
  { symbol: 'FCFA', label: 'CFA Franc', code: 'XAF' },
  { symbol: '₦', label: 'Naira', code: 'NGN' },
  { symbol: '$', label: 'US Dollar', code: 'USD' },
  { symbol: '€', label: 'Euro', code: 'EUR' },
  { symbol: '£', label: 'British Pound', code: 'GBP' },
]

const vatRates = [
  { label: 'Standard (7.5%)', value: '7.5' },
  { label: 'Zero Rated (0%)', value: '0' },
  { label: 'Reduced (5%)', value: '5' },
]

const frequencies = [
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'Quarterly', value: 'QUARTERLY' },
  { label: 'Annually', value: 'ANNUALLY' },
]

const roleLabels: Record<string, string> = {
  OWNER: 'Admin',
  CASHIER: 'Cashier',
  ACCOUNTANT: 'Accountant',
}

const inputClass =
  'w-full h-12 px-md bg-surface-container rounded-xl outline-none focus:ring-2 focus:ring-primary/20 border-l-4 border-transparent focus:border-primary transition-all'

type BusinessForm = {
  name: string
  shopType: string
  currency: string
  phone: string
  address: string
  taxId: string
  vatRate: string
  filingFrequency: string
}

export function Settings() {
  const { user, business, refreshBusiness } = useAuth()
  const [tab, setTab] = useState<'business' | 'profile'>('business')
  const [form, setForm] = useState<BusinessForm>({
    name: '',
    shopType: 'grocery',
    currency: 'XAF',
    phone: '',
    address: '',
    taxId: '',
    vatRate: '7.5',
    filingFrequency: 'MONTHLY',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const set = (key: keyof BusinessForm) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
    setSaved(false)
  }

  useEffect(() => {
    businessService
      .get()
      .then((b) => {
        setForm({
          name: b.name ?? '',
          shopType: b.shopType || 'grocery',
          currency: b.currency || 'XAF',
          phone: b.phone ?? '',
          address: b.address ?? '',
          taxId: b.taxId ?? '',
          vatRate: b.vatRate != null ? String(b.vatRate) : '7.5',
          filingFrequency: b.filingFrequency || 'MONTHLY',
        })
      })
      .catch(() => {
        if (business) {
          setForm({
            name: business.name ?? '',
            shopType: business.shopType || 'grocery',
            currency: business.currency || 'XAF',
            phone: business.phone ?? '',
            address: business.address ?? '',
            taxId: business.taxId ?? '',
            vatRate: business.vatRate != null ? String(business.vatRate) : '7.5',
            filingFrequency: business.filingFrequency || 'MONTHLY',
          })
        }
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = async () => {
    if (!form.name.trim() || form.name.trim().length < 2) {
      setError('Business name must be at least 2 characters.')
      return
    }
    const vat = Number(form.vatRate)
    if (Number.isNaN(vat) || vat < 0 || vat > 100) {
      setError('VAT rate must be between 0 and 100.')
      return
    }
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      await businessService.update({
        name: form.name.trim(),
        shopType: form.shopType,
        currency: form.currency,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        taxId: form.taxId.trim() || undefined,
        vatRate: vat,
        filingFrequency: form.filingFrequency,
      })
      await refreshBusiness()
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save your settings.')
    } finally {
      setSaving(false)
    }
  }

  const initial = (user?.name || 'S').charAt(0).toUpperCase()

  return (
    <div className="space-y-xl">
      <div>
        <div className="flex items-center gap-1 text-[12px] text-on-surface-variant mb-1">
          <span>Settings</span>
          <Icon name="chevron_right" className="text-[14px]" />
          <span className="text-on-surface font-semibold">Preferences</span>
        </div>
        <h1 className="font-headline text-headline-lg text-on-surface">Settings</h1>
        <p className="font-body text-body-md text-on-surface-variant mt-1">
          Manage your business information and account profile.
        </p>
      </div>

      <div className="flex bg-surface-container-lowest rounded-full p-1 shadow-sm w-fit">
        <button
          onClick={() => setTab('business')}
          className={`px-lg py-2 rounded-full font-label text-label-md transition-all ${
            tab === 'business' ? 'bg-primary text-on-primary shadow-md shadow-primary/25' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Icon name="store" className="text-[16px] align-text-bottom mr-1" />
          Business Information
        </button>
        <button
          onClick={() => setTab('profile')}
          className={`px-lg py-2 rounded-full font-label text-label-md transition-all ${
            tab === 'profile' ? 'bg-primary text-on-primary shadow-md shadow-primary/25' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Icon name="person" className="text-[16px] align-text-bottom mr-1" />
          Profile
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-primary-container/40 rounded-xl px-lg py-md">
          <Icon name="check_circle" className="text-primary" />
          <p className="font-body text-body-md text-on-surface">Your settings have been saved.</p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 bg-error-container/40 rounded-xl px-lg py-md">
          <Icon name="error_outline" className="text-error mt-px" />
          <p className="font-body text-body-sm text-error">{error}</p>
        </div>
      )}

      {tab === 'business' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-xl items-start">
          <Card className="xl:col-span-2 overflow-hidden">
            <div className="p-xl lg:p-2xl">
              <div className="flex items-center gap-md mb-lg">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Icon name="store" className="text-primary" />
                </div>
                <div>
                  <h2 className="font-headline text-headline-md text-on-surface">Business Information</h2>
                  <p className="font-label text-label-sm text-on-surface-variant">
                    These details appear on your receipts, invoices, and reports.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-2xl">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="flex flex-col gap-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                    <div className="flex flex-col gap-1">
                      <label className="font-label text-label-md text-on-surface-variant">Business Name</label>
                      <input
                        className={inputClass}
                        placeholder="Nkemaze Stores"
                        value={form.name}
                        onChange={(e) => set('name')(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-label text-label-md text-on-surface-variant">Store Category</label>
                      <div className="relative">
                        <select
                          className={`${inputClass} appearance-none cursor-pointer pr-10`}
                          value={form.shopType}
                          onChange={(e) => set('shopType')(e.target.value)}
                        >
                          {shopTypes.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                        <Icon
                          name="expand_more"
                          className="absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                    <div className="flex flex-col gap-1">
                      <label className="font-label text-label-md text-on-surface-variant">Phone Number</label>
                      <input
                        className={inputClass}
                        placeholder="800 123 4567"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => set('phone')(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-label text-label-md text-on-surface-variant">Street Address</label>
                      <input
                        className={inputClass}
                        placeholder="Avenue de la Liberté, Douala"
                        value={form.address}
                        onChange={(e) => set('address')(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                    <div className="flex flex-col gap-1">
                      <label className="font-label text-label-md text-on-surface-variant">Base Currency</label>
                      <div className="relative">
                        <select
                          className={`${inputClass} appearance-none cursor-pointer pr-10`}
                          value={form.currency}
                          onChange={(e) => set('currency')(e.target.value)}
                        >
                          {currencies.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.label} ({c.symbol})
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
                      <label className="font-label text-label-md text-on-surface-variant">VAT Registration (TIN)</label>
                      <input
                        className={inputClass}
                        placeholder="00000000-0001"
                        value={form.taxId}
                        onChange={(e) => set('taxId')(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                    <div className="flex flex-col gap-1">
                      <label className="font-label text-label-md text-on-surface-variant">Default VAT Rate</label>
                      <div className="relative">
                        <select
                          className={`${inputClass} appearance-none cursor-pointer pr-10`}
                          value={form.vatRate}
                          onChange={(e) => set('vatRate')(e.target.value)}
                        >
                          {vatRates.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
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
                      <label className="font-label text-label-md text-on-surface-variant">Filing Frequency</label>
                      <div className="relative">
                        <select
                          className={`${inputClass} appearance-none cursor-pointer pr-10`}
                          value={form.filingFrequency}
                          onChange={(e) => set('filingFrequency')(e.target.value)}
                        >
                          {frequencies.map((f) => (
                            <option key={f.value} value={f.value}>
                              {f.label}
                            </option>
                          ))}
                        </select>
                        <Icon
                          name="expand_more"
                          className="absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-md pt-lg border-t border-surface-variant mt-lg">
                    <p className="font-label text-label-sm text-on-surface-variant mr-auto">
                      Changes apply immediately to new sales and reports.
                    </p>
                    <button
                      onClick={() => void submit()}
                      disabled={saving || loading}
                      className="flex items-center gap-2 h-12 px-lg bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label text-label-md font-bold shadow-lg shadow-primary/25 active:scale-[0.98] transition-all disabled:opacity-60"
                    >
                      {saving ? <Icon name="sync" className="animate-spin" /> : <Icon name="save" />}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className="space-y-xl">
            <Card className="p-xl">
              <div className="flex items-center gap-md mb-lg">
                <div className="w-11 h-11 rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <Icon name="info" className="text-secondary" />
                </div>
                <div>
                  <h3 className="font-headline text-headline-md text-on-surface">Why this matters</h3>
                  <p className="font-label text-label-sm text-on-surface-variant">A little context</p>
                </div>
              </div>
              <ul className="space-y-lg">
                <li className="flex items-start gap-md">
                  <Icon name="receipt_long" className="text-primary flex-shrink-0" />
                  <p className="font-body text-body-sm text-on-surface-variant">
                    Your business name and TIN are printed on every customer receipt and invoice.
                  </p>
                </li>
                <li className="flex items-start gap-md">
                  <Icon name="currency_exchange" className="text-primary flex-shrink-0" />
                  <p className="font-body text-body-sm text-on-surface-variant">
                    The default VAT rate is pre-filled when you record sales. You can still override it per sale.
                  </p>
                </li>
                <li className="flex items-start gap-md">
                  <Icon name="calendar_month" className="text-primary flex-shrink-0" />
                  <p className="font-body text-body-sm text-on-surface-variant">
                    Your filing frequency determines when your compliance reports are due.
                  </p>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      )}

      {tab === 'profile' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-xl items-start">
          <Card className="xl:col-span-2 overflow-hidden">
            <div className="p-xl lg:p-2xl">
              <div className="flex items-center gap-md mb-lg">
                <div className="w-11 h-11 rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <Icon name="person" className="text-secondary" />
                </div>
                <div>
                  <h2 className="font-headline text-headline-md text-on-surface">Profile</h2>
                  <p className="font-label text-label-sm text-on-surface-variant">Your account details</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-lg p-lg bg-surface-container-low/60 rounded-2xl mb-lg">
                <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/10 flex items-center justify-center bg-primary-container text-primary font-headline text-headline-lg font-bold flex-shrink-0">
                  {initial}
                </div>
                <div className="flex-1">
                  <p className="font-headline text-title-lg text-on-surface">{user?.name || 'Store Owner'}</p>
                  <p className="font-label text-label-sm text-on-surface-variant">{user?.email || user?.phone}</p>
                  <div className="flex items-center gap-md mt-1">
                    <Badge tone="neutral">{roleLabels[user?.role ?? 'OWNER']}</Badge>
                    <Badge tone="success">Active</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <Icon name="store" className="text-[18px]" />
                  <span className="font-label text-label-md">{business?.name || 'My Store'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div className="flex flex-col gap-1">
                    <label className="font-label text-label-md text-on-surface-variant">Full Name</label>
                    <input className={inputClass} value={user?.name ?? ''} disabled />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label text-label-md text-on-surface-variant">Email Address</label>
                    <input className={inputClass} value={user?.email ?? ''} disabled />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div className="flex flex-col gap-1">
                    <label className="font-label text-label-md text-on-surface-variant">Phone Number</label>
                    <input className={inputClass} value={user?.phone ?? ''} disabled />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label text-label-md text-on-surface-variant">Role</label>
                    <input className={inputClass} value={roleLabels[user?.role ?? 'OWNER'] ?? ''} disabled />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-xl">
            <Card className="p-xl">
              <div className="flex items-center gap-md mb-lg">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Icon name="lock" className="text-primary" />
                </div>
                <div>
                  <h3 className="font-headline text-headline-md text-on-surface">Account Security</h3>
                  <p className="font-label text-label-sm text-on-surface-variant">Keep your account safe</p>
                </div>
              </div>
              <p className="font-body text-body-sm text-on-surface-variant mb-lg">
                You sign in with your phone number and a one-time verification code. Your data is encrypted in transit
                and at rest.
              </p>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Icon name="verified_user" className="text-secondary" />
                <span className="font-label text-label-sm">Phone-verified account</span>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
