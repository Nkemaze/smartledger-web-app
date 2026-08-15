import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Icon } from '@/components/ui/Icon'
import { authService } from '@/lib/api'
import { useAuth } from '@/lib/auth/AuthContext'

const features = [
  {
    icon: 'insights',
    bg: 'bg-primary-fixed',
    color: 'text-primary',
    title: 'Predictive Analytics',
    body: 'AI-driven stock forecasting to never miss a sale.',
  },
  {
    icon: 'receipt_long',
    bg: 'bg-secondary-fixed',
    color: 'text-secondary',
    title: 'Instant Reconciliation',
    body: 'Automate your book-keeping across all locations.',
  },
]

export function SignUp() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [ownerName, setOwnerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [shopType, setShopType] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Verification state
  const [method, setMethod] = useState<'whatsapp' | 'email'>('whatsapp')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [codeSent, setCodeSent] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [codeError, setCodeError] = useState('')
  const [seconds, setSeconds] = useState(0)
  const [whatsappAvailable, setWhatsappAvailable] = useState(false)
  const codeRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    authService
      .verificationChannels()
      .then((c) => {
        setWhatsappAvailable(c.whatsapp)
        // Default to the first working channel.
        setMethod(c.whatsapp ? 'whatsapp' : 'email')
      })
      .catch(() => setMethod('email'))
  }, [])

  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  const emailAvailable = /\S+@\S+\.\S+/.test(email)
  const destination = method === 'whatsapp' ? phone : email

  const handleCodeDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[index] = digit
    setCode(next)
    if (digit && index < 5) codeRefs.current[index + 1]?.focus()
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) codeRefs.current[index - 1]?.focus()
  }

  const sendCode = async (isResend = false) => {
    if (sendingCode || seconds > 0) return
    if (method === 'whatsapp' && phone.replace(/\D/g, '').length < 8) {
      setCodeError('Enter a valid phone number first.')
      return
    }
    if (method === 'email' && !emailAvailable) {
      setCodeError('Enter a valid email address first.')
      return
    }
    setSendingCode(true)
    setCodeError('')
    try {
      await authService.requestVerification(method, destination)
      setCodeSent(true)
      setSeconds(45)
      if (isResend) setCode(['', '', '', '', '', ''])
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : 'Unable to send the code.')
    } finally {
      setSendingCode(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!agreed) {
      setError('Please accept the Terms of Service to continue.')
      return
    }
    const joined = code.join('')
    if (!codeSent) {
      setError('Please request a verification code first.')
      return
    }
    if (joined.length !== 6) {
      setError('Enter the 6-digit verification code.')
      return
    }
    setLoading(true)
    try {
      await signUp({
        ownerName,
        email: emailAvailable ? email : undefined,
        phone,
        password,
        shopType: shopType || 'grocery',
        businessName: `${ownerName.split(' ')[0]}'s Store`,
        verificationMethod: method,
        verificationCode: joined,
      })
      navigate('/setup', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col lg:flex-row gap-xl items-stretch lg:min-h-[870px] lg:overflow-hidden">
        <div className="hidden lg:flex flex-col w-1/2 relative p-3xl justify-between overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full -z-10 bg-surface-container-highest/30">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px] animate-pulse" />
            <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[80px]" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center mb-2xl">
              <img
                src="/smartledger-logo.png"
                alt="SmartLedger Logo"
                className="h-14 w-auto object-contain"
              />
            </div>
            <div className="space-y-xl max-w-md">
              <div className="flex flex-col gap-2">
                <span className="font-label text-label-sm text-primary uppercase tracking-widest">Efficiency First</span>
                <h2 className="font-headline text-display-lg text-on-background">
                  Retail management, <br />
                  <span className="text-secondary">reimagined.</span>
                </h2>
                <p className="font-body text-body-lg text-on-surface-variant">
                  Experience the dashboard that turns your daily transactions into actionable growth insights.
                </p>
              </div>
              <div className="grid gap-lg">
                {features.map((f) => (
                  <div key={f.title} className="flex gap-md items-start p-md bg-surface-container-lowest/50 backdrop-blur-md rounded-xl shadow-sm">
                    <span className={`${f.color} ${f.bg} p-2 rounded-lg`}>
                      <Icon name={f.icon} className="text-md" />
                    </span>
                    <div>
                      <h4 className="font-headline text-title-lg text-on-surface">{f.title}</h4>
                      <p className="font-body text-body-md text-on-surface-variant">{f.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="relative z-10 mt-3xl p-lg bg-surface-container-high rounded-2xl shadow-xl">
            <div className="flex gap-1 mb-md">
              {[0, 1, 2, 3, 4].map((i) => (
                <Icon key={i} name="star" filled className="text-tertiary" />
              ))}
            </div>
            <p className="font-body text-body-md italic text-on-surface mb-lg">
              &quot;SmartLedger saved us over 15 hours a week on inventory alone. It&apos;s the brain of our boutique.&quot;
            </p>
            <div className="flex items-center gap-md">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNKp6dVk9xwXhBrUE7QF7cFLHFuAjZa9laerHPsDCnA2xaFp8X_f2Fdirg4R8De1mkJDWmVw0AWh4tYD1j4nQIjEtOxKopgi3cK96-nosLfLyBUZqbsrE6bAmuLnjsXTcziqc-Vh7rLdpg76zvzxm8QNtd0L2PRYeALL_oOCT3OXVsO6NgnNEr9jsq46JXlg0VZ57T6e_lnzf0rrXFxCJbeCZ0pReJ8Uq2dV1psId_2um8VEcdJ-Q9"
                  alt="Sarah Jenkins"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-label text-label-md text-on-surface">Sarah Jenkins</p>
                <p className="font-label text-label-sm text-on-surface-variant">Founder, Vela Threads</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-0 sm:px-gutter lg:p-0">
          <div className="w-full max-w-[520px] bg-surface-container-lowest p-lg sm:p-xl lg:p-3xl rounded-3xl shadow-xl shadow-on-background/5 flex flex-col">
            <div className="mb-xl text-center lg:text-left">
              <h1 className="font-headline text-headline-lg text-on-background mb-1">Start your 14-day free trial</h1>
              <p className="font-body text-body-md text-on-surface-variant">Join 10,000+ retail owners growing their business.</p>
            </div>
            <form
              className="flex flex-col gap-lg"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col gap-1 group">
                <label className="font-label text-label-md text-on-surface-variant group-focus-within:text-primary transition-colors">
                  Full Name
                </label>
                <input
                  className="w-full h-12 px-md bg-surface-container rounded-xl outline-none focus:ring-2 focus:ring-primary/20 border-l-4 border-transparent focus:border-primary transition-all font-body text-body-md text-on-surface"
                  placeholder="Jane Cooper"
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className="flex flex-col gap-1 group">
                <label className="font-label text-label-md text-on-surface-variant group-focus-within:text-primary transition-colors">
                  Email Address
                </label>
                <input
                  className="w-full h-12 px-md bg-surface-container rounded-xl outline-none focus:ring-2 focus:ring-primary/20 border-l-4 border-transparent focus:border-primary transition-all font-body text-body-md text-on-surface"
                  placeholder="jane@store.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="flex flex-col gap-1 group">
                <label className="font-label text-label-md text-on-surface-variant group-focus-within:text-primary transition-colors">
                  Phone Number
                </label>
                <input
                  className="w-full h-12 px-md bg-surface-container rounded-xl outline-none focus:ring-2 focus:ring-primary/20 border-l-4 border-transparent focus:border-primary transition-all font-body text-body-md text-on-surface"
                  placeholder="651 234 5678"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </div>
              <div className="flex flex-col gap-1 group relative">
                <label className="font-label text-label-md text-on-surface-variant group-focus-within:text-primary transition-colors">
                  Password
                </label>
                <div className="relative">
                  <input
                    className="w-full h-12 px-md bg-surface-container rounded-xl outline-none focus:ring-2 focus:ring-primary/20 border-l-4 border-transparent focus:border-primary transition-all font-body text-body-md text-on-surface"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    <Icon name={showPassword ? 'visibility_off' : 'visibility'} className="text-[20px]" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1 group">
                <label className="font-label text-label-md text-on-surface-variant group-focus-within:text-primary transition-colors">
                  Store Category
                </label>
                <div className="relative">
                  <select
                    className="w-full h-12 px-md bg-surface-container rounded-xl outline-none appearance-none focus:ring-2 focus:ring-primary/20 border-l-4 border-transparent focus:border-primary transition-all font-body text-body-md text-on-surface cursor-pointer"
                    value={shopType}
                    onChange={(e) => setShopType(e.target.value)}
                  >
                    <option disabled value="">
                      Select your industry
                    </option>
                    <option value="grocery">Grocery & Supermarket</option>
                    <option value="fashion">Fashion & Apparel</option>
                    <option value="pharmacy">Pharmacy & Health</option>
                    <option value="electronics">Electronics & Tech</option>
                    <option value="specialty">Specialty Retail</option>
                  </select>
                  <Icon name="expand_more" className="absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
                </div>
              </div>
              <div className="flex flex-col gap-2 group">
                <label className="font-label text-label-md text-on-surface-variant group-focus-within:text-primary transition-colors">
                  Verify your account
                </label>
                <p className="font-body text-body-sm text-on-surface-variant -mt-1">
                  Choose how you'd like to receive your 6-digit code.
                </p>
                <div className="grid grid-cols-2 gap-md mt-1">
                  <button
                    type="button"
                    disabled={!whatsappAvailable}
                    onClick={() => setMethod('whatsapp')}
                    className={`flex items-center gap-2 p-md rounded-xl border-2 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      method === 'whatsapp'
                        ? 'border-[#25D366] bg-[#25D366]/10'
                        : 'border-outline-variant/40 bg-surface-container hover:border-outline-variant'
                    }`}
                  >
                    <Icon name="chat" className={`text-[20px] ${method === 'whatsapp' ? 'text-[#1DA851]' : 'text-on-surface-variant'}`} />
                    <div className="min-w-0">
                      <p className="font-label text-label-md text-on-surface">WhatsApp</p>
                      <p className="font-body text-body-sm text-on-surface-variant truncate">
                        {whatsappAvailable ? phone || 'Your phone number' : 'Temporarily unavailable'}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    disabled={!emailAvailable}
                    onClick={() => setMethod('email')}
                    className={`flex items-center gap-2 p-md rounded-xl border-2 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      method === 'email'
                        ? 'border-primary bg-primary/10'
                        : 'border-outline-variant/40 bg-surface-container hover:border-outline-variant'
                    }`}
                  >
                    <Icon name="mail" className={`text-[20px] ${method === 'email' ? 'text-primary' : 'text-on-surface-variant'}`} />
                    <div className="min-w-0">
                      <p className="font-label text-label-md text-on-surface">Email</p>
                      <p className="font-body text-body-sm text-on-surface-variant truncate">
                        {emailAvailable ? email : 'Add an email above'}
                      </p>
                    </div>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => void sendCode(codeSent)}
                  disabled={sendingCode || seconds > 0}
                  className="mt-1 h-11 rounded-xl font-label text-label-md font-bold border-2 border-dashed border-outline-variant/60 hover:border-primary hover:text-primary text-on-surface-variant transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {sendingCode ? <Icon name="sync" className="animate-spin" /> : <Icon name="send" />}
                  {sendingCode
                    ? 'Sending...'
                    : seconds > 0
                      ? `Resend in ${seconds}s`
                      : codeSent
                        ? 'Resend code'
                        : `Send code via ${method === 'whatsapp' ? 'WhatsApp' : 'email'}`}
                </button>
                {codeSent && (
                  <>
                    <p className="font-body text-body-sm text-on-surface-variant mt-2">
                      Code sent to <span className="font-label text-on-surface">{destination}</span>
                    </p>
                    <div className="grid grid-cols-6 gap-2 mt-1">
                      {code.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => {
                            codeRefs.current[i] = el
                          }}
                          className={`w-full h-12 text-center font-headline text-headline-md bg-surface-container rounded-lg outline-none border-2 transition-all ${
                            digit
                              ? 'border-primary text-primary'
                              : 'border-outline-variant/40 text-on-surface focus:border-primary'
                          }`}
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeDigit(i, e.target.value)}
                          onKeyDown={(e) => handleCodeKeyDown(i, e)}
                        />
                      ))}
                    </div>
                  </>
                )}
                {codeError && (
                  <div className="flex items-start gap-2 bg-error-container/40 rounded-xl px-md py-sm">
                    <Icon name="error_outline" className="text-error text-[18px] mt-px flex-shrink-0" />
                    <p className="font-body text-body-sm text-error">{codeError}</p>
                  </div>
                )}
              </div>
              {error && (
                <div className="flex items-start gap-2 bg-error-container/40 rounded-xl px-md py-sm">
                  <Icon name="error_outline" className="text-error text-[18px] mt-px flex-shrink-0" />
                  <p className="font-body text-body-sm text-error">{error}</p>
                </div>
              )}
              <label className="flex items-start gap-md cursor-pointer group">
                <div className="relative flex items-center mt-1">
                  <input
                    className="peer appearance-none w-5 h-5 border-2 border-outline-variant rounded bg-surface-container-lowest checked:bg-primary checked:border-primary transition-all cursor-pointer"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <Icon
                    name="check"
                    className="absolute text-[16px] text-on-primary opacity-0 peer-checked:opacity-100 left-1/2 -translate-x-1/2 pointer-events-none"
                  />
                </div>
                <span className="font-label text-label-sm text-on-surface-variant select-none">
                  I agree to the <a className="text-primary hover:underline font-bold" href="#">Terms of Service</a> and{' '}
                  <a className="text-primary hover:underline font-bold" href="#">Privacy Policy</a>.
                </span>
              </label>
              <button className="w-full h-14 bg-primary text-on-primary rounded-xl font-label text-label-md font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-60" disabled={loading}>
                {loading ? <Icon name="sync" className="animate-spin" /> : null}
                {loading ? 'Creating account...' : 'Create Account'}
                {!loading && <Icon name="arrow_forward" />}
              </button>
            </form>
            <div className="mt-xl pt-xl border-t border-surface-variant flex flex-col items-center gap-md">
              <p className="font-body text-body-md text-on-surface-variant">
                Already have an account? <Link to="/login" className="text-secondary font-bold hover:underline">Log in</Link>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-md sm:gap-lg grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                <div className="flex items-center gap-1">
                  <Icon name="verified_user" className="text-[18px]" />
                  <span className="font-label text-label-sm uppercase tracking-tighter">PCI Compliant</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="security" className="text-[18px]" />
                  <span className="font-label text-label-sm uppercase tracking-tighter">AES-256 Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
