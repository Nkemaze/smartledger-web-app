import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout, AmbientBackground } from '@/components/layout/AuthLayout'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/lib/auth/AuthContext'
import { businessService } from '@/lib/api'

const steps = [
  { icon: 'store', label: 'Business Details' },
  { icon: 'payments', label: 'Tax Settings' },
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

export function BusinessSetup() {
  const navigate = useNavigate()
  const { refreshBusiness } = useAuth()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: 'Nkemaze Stores',
    address: '',
    currency: 'XAF',
    phone: '',
    taxId: '',
    vatRate: '7.5',
    filingFrequency: 'MONTHLY',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }))

  const next = () => {
    if (step < 2) setStep((s) => s + 1)
    else void submit()
  }

  const submit = async () => {
    setSaving(true)
    setError('')
    try {
      await businessService.update({
        name: form.name,
        address: form.address || undefined,
        currency: form.currency,
        phone: form.phone || undefined,
        taxId: form.taxId || undefined,
        vatRate: Number(form.vatRate),
        filingFrequency: form.filingFrequency,
      })
      await refreshBusiness()
      navigate('/setup-products', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save your settings. Please try again.')
      setSaving(false)
    }
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
                  <Icon name="rocket_launch" className="text-[24px] text-on-primary-container" />
                </div>
                <div>
                  <h2 className="font-headline text-title-lg text-on-surface">Getting started</h2>
                  <p className="font-label text-label-sm text-on-surface-variant">Quick guided setup</p>
                </div>
              </div>
              <p className="font-body text-body-md text-on-surface-variant">
                &quot;Let&apos;s get your store ready for takeoff.&quot;
              </p>
              <p className="font-body text-body-md text-on-surface">
                Welcome! I&apos;m here to help you set up your professional environment. We&apos;ll start with the basics
                so your invoices and reports look perfect from day one.
              </p>
              <div className="flex items-start gap-2">
                <Icon name="check_circle" filled className="text-primary" />
                <p className="font-body text-body-sm text-on-surface-variant">
                  Your business name will appear on all customer receipts.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="check_circle" filled className="text-primary" />
                <p className="font-body text-body-sm text-on-surface-variant">
                  Multi-currency support allows you to scale globally.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-secondary to-secondary-container rounded-2xl p-xl shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="support_agent" className="text-on-primary" />
                <p className="font-label text-label-md text-on-primary font-bold">Need help?</p>
              </div>
              <p className="font-body text-body-sm text-on-primary/90">
                Our team is online 24/7 to assist with your setup journey.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-xl items-center lg:items-stretch lg:justify-center min-h-[80vh]">
            <div className="w-full max-w-[560px] bg-surface-container-lowest rounded-2xl shadow-xl p-xl">
              <div className="flex gap-md mb-xl">
                {steps.map((s, i) => {
                  const active = i + 1 === step
                  const done = i + 1 < step
                  return (
                    <div key={s.label} className="flex-1 flex flex-col gap-1">
                      <div
                        className={`h-1 rounded-full transition-all duration-500 ${
                          done || active ? 'bg-primary' : 'bg-surface-container-high'
                        }`}
                      />
                      <div className="flex items-center gap-1 mt-1">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            done
                              ? 'bg-primary text-on-primary'
                              : active
                                ? 'bg-primary-container text-on-primary-container ring-4 ring-primary/10'
                                : 'bg-surface-container-high text-outline'
                          }`}
                        >
                          <Icon name={done ? 'check' : s.icon} className="text-[14px]" />
                        </span>
                        <span
                          className={`font-label text-label-sm ${
                            active ? 'text-on-surface font-bold' : 'text-on-surface-variant'
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mb-xl">
                <h1 className="font-headline text-headline-lg text-on-surface mb-1">Tell us about your business</h1>
                <p className="font-label text-label-sm text-on-surface-variant">
                  Step {step} of 2: {steps[step - 1].label}
                </p>
              </div>
              <form
                className="flex flex-col gap-lg"
                onSubmit={(e) => {
                  e.preventDefault()
                  next()
                }}
              >
                {step === 1 && (
                  <>
                    <div className="flex flex-col gap-1 group">
                      <label className="font-label text-label-md text-on-surface-variant group-focus-within:text-primary transition-colors">
                        Business Name
                      </label>
                      <input
                        className="w-full h-12 px-md bg-surface-container rounded-xl outline-none focus:ring-2 focus:ring-primary/20 border-l-4 border-transparent focus:border-primary transition-all"
                        placeholder="Nkemaze Stores"
                        value={form.name}
                        onChange={(e) => set('name')(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1 group">
                      <label className="font-label text-label-md text-on-surface-variant group-focus-within:text-primary transition-colors">
                        Street Address
                      </label>
                      <input
                        className="w-full h-12 px-md bg-surface-container rounded-xl outline-none focus:ring-2 focus:ring-primary/20 border-l-4 border-transparent focus:border-primary transition-all"
                        placeholder="Avenue de la Liberté, Douala"
                        value={form.address}
                        onChange={(e) => set('address')(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1 group">
                      <label className="font-label text-label-md text-on-surface-variant group-focus-within:text-primary transition-colors">
                        Base Currency
                      </label>
                      <div className="relative">
                        <select
                          className="w-full h-12 px-md bg-surface-container rounded-xl outline-none appearance-none focus:ring-2 focus:ring-primary/20 border-l-4 border-transparent focus:border-primary transition-all cursor-pointer"
                          value={form.currency}
                          onChange={(e) => set('currency')(e.target.value)}
                        >
                          {currencies.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.label} ({c.symbol})
                            </option>
                          ))}
                        </select>
                        <Icon name="expand_more" className="absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 group">
                      <label className="font-label text-label-md text-on-surface-variant group-focus-within:text-primary transition-colors">
                        Phone Number
                      </label>
                      <div className="flex gap-1">
                        <div className="relative w-32">
                          <select className="w-full h-12 px-2 bg-surface-container rounded-xl outline-none appearance-none border-l-4 border-transparent focus:border-primary transition-all font-bold">
                            <option>+237</option>
                            <option>+234</option>
                            <option>+1</option>
                            <option>+44</option>
                            <option>+27</option>
                          </select>
                          <Icon name="expand_more" className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
                        </div>
                        <input
                          className="flex-1 h-12 px-md bg-surface-container rounded-xl outline-none focus:ring-2 focus:ring-primary/20 border-l-4 border-transparent focus:border-primary transition-all"
                          placeholder="800 123 4567"
                          value={form.phone}
                          onChange={(e) => set('phone')(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}
                {step === 2 && (
                  <>
                    <div className="flex flex-col gap-1 group">
                      <label className="font-label text-label-md text-on-surface-variant group-focus-within:text-primary transition-colors">
                        VAT Registration Number (TIN)
                      </label>
                      <input
                        className="w-full h-12 px-md bg-surface-container rounded-xl outline-none focus:ring-2 focus:ring-primary/20 border-l-4 border-transparent focus:border-primary transition-all"
                        placeholder="00000000-0001"
                        value={form.taxId}
                        onChange={(e) => set('taxId')(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1 group">
                      <label className="font-label text-label-md text-on-surface-variant group-focus-within:text-primary transition-colors">
                        Default VAT Rate
                      </label>
                      <div className="relative">
                        <select
                          className="w-full h-12 px-md bg-surface-container rounded-xl outline-none appearance-none focus:ring-2 focus:ring-primary/20 border-l-4 border-transparent focus:border-primary transition-all cursor-pointer"
                          value={form.vatRate}
                          onChange={(e) => set('vatRate')(e.target.value)}
                        >
                          {vatRates.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                        <Icon name="expand_more" className="absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 group">
                      <label className="font-label text-label-md text-on-surface-variant group-focus-within:text-primary transition-colors">
                        Filing Frequency
                      </label>
                      <div className="relative">
                        <select
                          className="w-full h-12 px-md bg-surface-container rounded-xl outline-none appearance-none focus:ring-2 focus:ring-primary/20 border-l-4 border-transparent focus:border-primary transition-all cursor-pointer"
                          value={form.filingFrequency}
                          onChange={(e) => set('filingFrequency')(e.target.value)}
                        >
                          {frequencies.map((f) => (
                            <option key={f.value} value={f.value}>
                              {f.label}
                            </option>
                          ))}
                        </select>
                        <Icon name="expand_more" className="absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
                      </div>
                    </div>
                  </>
                )}
                {error && (
                  <div className="flex items-start gap-2 bg-error-container/40 rounded-xl px-md py-sm">
                    <Icon name="error_outline" className="text-error text-[18px] mt-px flex-shrink-0" />
                    <p className="font-body text-body-sm text-error">{error}</p>
                  </div>
                )}
                <div className="flex items-center justify-between mt-xl pt-lg border-t border-surface-variant">
                  {step > 1 ? (
                    <button
                      className="flex items-center gap-1 font-label text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
                      type="button"
                      onClick={() => setStep((s) => s - 1)}
                    >
                      <Icon name="arrow_back" className="text-[18px]" />
                      Back
                    </button>
                  ) : (
                    <button
                      className="font-label text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
                      type="button"
                      onClick={() => navigate('/')}
                    >
                      Do this later
                    </button>
                  )}
                  <button className="flex items-center gap-2 h-12 px-lg bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label text-label-md font-bold shadow-lg shadow-primary/25 active:scale-[0.98] transition-all disabled:opacity-60" disabled={saving}>
                    {saving && <Icon name="sync" className="animate-spin" />}
                    {saving ? 'Saving...' : step === 2 ? 'Launch Dashboard' : 'Save & Continue'}
                    {!saving && <Icon name="arrow_forward" />}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
