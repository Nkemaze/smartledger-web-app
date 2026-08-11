import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout, AmbientBackground } from '@/components/layout/AuthLayout'
import { Icon } from '@/components/ui/Icon'
import { authService } from '@/lib/api'

const DIGITS = 6

export function OtpVerification() {
  const navigate = useNavigate()
  const [otp, setOtp] = useState<string[]>(Array(DIGITS).fill(''))
  const [seconds, setSeconds] = useState(45)
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [phone, setPhone] = useState('')
  const refs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    setPhone(authService.getPendingPhone())
  }, [])

  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    if (digit && index < DIGITS - 1) refs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) refs.current[index - 1]?.focus()
  }

  const complete = otp.every((d) => d !== '')

  const handleVerify = async () => {
    if (!complete || verifying) return
    setError('')
    setVerifying(true)
    try {
      await authService.verifyOtp(phone, otp.join(''))
      navigate('/setup', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That code did not match. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  const handleResend = async () => {
    if (seconds > 0 || !phone) return
    try {
      await authService.requestOtp(phone)
      setSeconds(45)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to resend the code.')
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col w-full max-w-container-max mx-auto items-center justify-center">
        <AmbientBackground />
        <div className="relative z-10 w-full max-w-[480px] px-gutter">
          <div className="bg-surface-container-lowest shadow-xl rounded-xl p-xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-secondary-container/40 flex items-center justify-center mb-xl">
              <Icon name="shield_lock" className="text-[32px] text-secondary" />
            </div>
            <h1 className="font-headline text-headline-lg text-on-surface mb-1">Verify your email</h1>
            <p className="font-body text-body-md text-on-surface-variant max-w-xs">
              We&apos;ve sent a 6-digit code to{' '}
              <span className="font-label text-on-surface">{phone || 'your phone'}</span>
            </p>
            <div className="flex gap-2 mt-2xl mb-2xl">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    refs.current[i] = el
                  }}
                  className={`w-12 h-14 text-center font-headline text-headline-lg bg-surface rounded-lg outline-none border-2 transition-all ${
                    digit
                      ? 'border-primary text-primary'
                      : 'border-outline-variant/40 text-on-surface focus:border-primary'
                  }`}
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                />
              ))}
            </div>
            {error && (
              <div className="flex items-start gap-2 bg-error-container/40 rounded-lg px-md py-sm mb-xl w-full">
                <Icon name="error_outline" className="text-error text-[18px] mt-px flex-shrink-0" />
                <p className="font-body text-body-sm text-error">{error}</p>
              </div>
            )}
            <div className="flex items-center gap-1 font-label text-label-md text-on-surface-variant mb-2xl">
              <Icon name="schedule" className="text-[18px]" />
              Resend code in <span className="text-primary font-bold tabular-nums">00:{String(seconds).padStart(2, '0')}</span>
            </div>
            <button
              className={`w-full h-12 rounded-lg font-label text-label-md font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                complete
                  ? 'bg-primary text-on-primary hover:bg-primary-container shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98]'
                  : 'bg-surface-container-high text-outline cursor-not-allowed'
              }`}
              disabled={!complete || verifying}
              onClick={handleVerify}
            >
              {verifying ? <Icon name="sync" className="animate-spin" /> : null}
              {verifying ? 'Verifying...' : 'Verify & Continue'}
              {!verifying && <Icon name="arrow_forward" />}
            </button>
            <p className="font-body text-body-md text-on-surface-variant mt-lg">
              Didn&apos;t receive a code?{' '}
              <button className="font-label text-primary hover:underline disabled:opacity-50" onClick={handleResend} disabled={seconds > 0}>
                Resend now
              </button>
            </p>
          </div>
          <div className="mt-xl flex items-center justify-center gap-xl opacity-60">
            <div className="flex items-center gap-1">
              <Icon name="verified_user" className="text-[16px] text-secondary" />
              <span className="font-label text-label-sm text-on-surface-variant">Enterprise Ready</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="shield" className="text-[16px] text-secondary" />
              <span className="font-label text-label-sm text-on-surface-variant">SOC2 Type II</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="gavel" className="text-[16px] text-secondary" />
              <span className="font-label text-label-sm text-on-surface-variant">GDPR</span>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
