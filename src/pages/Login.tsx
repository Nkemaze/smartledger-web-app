import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout, AmbientBackground } from '@/components/layout/AuthLayout'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/lib/auth/AuthContext'

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg className="w-5 h-5 fill-on-surface" viewBox="0 0 24 24">
      <path d="M17.05 20.28c-.96 0-2.04-.6-3.23-.6-1.16 0-2.23.59-3.13.59-.88 0-1.74-.43-2.52-1.57C6.55 16.29 5.31 12.31 6.8 9.72c.74-1.29 2.08-2.11 3.53-2.13 1.1 0 2.13.76 2.81.76.66 0 1.93-.91 3.24-.77.55.02 2.1.22 3.09 1.67-.08.05-1.85 1.08-1.83 3.21.02 2.54 2.21 3.43 2.23 3.44-.02.05-.35 1.2-1.2 2.45-.73 1.07-1.49 2.13-2.62 2.13zm-3.56-13.91c-.02-2.73 2.26-5.04 2.26-5.04s2.39.04 4.54 2.6c0 0-2.2 4.95-4.53 5.04 0 0-2.25-.09-2.27-2.6z" />
    </svg>
  )
}

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!identifier || !password) {
      setError('Enter your email/phone and password to continue.')
      return
    }
    setLoading(true)
    try {
      const signedIn = await login(identifier, password)
      navigate(signedIn.platformAdmin ? '/admin' : '/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col w-full max-w-container-max mx-auto items-center justify-center">
        <AmbientBackground />
        <div className="relative z-10 w-full max-w-[440px] px-0 sm:px-gutter">
          <div className="bg-surface-container-lowest shadow-xl rounded-xl p-lg sm:p-xl flex flex-col items-center">
            <div className="mb-xl">
              <img
                src="/smartledger-logo.png"
                alt="SmartLedger Logo"
                className="h-14 w-auto object-contain"
              />
            </div>
            <div className="text-center mb-xl">
              <h1 className="font-headline text-headline-lg text-on-surface mb-1">Welcome back</h1>
              <p className="font-body text-body-md text-on-surface-variant">Sign in to manage your store</p>
            </div>
            <div className="w-full flex gap-sm sm:gap-md mb-xl">
              <button className="flex-1 flex items-center justify-center gap-2 py-md px-sm sm:px-lg bg-surface-container rounded-lg hover:bg-surface-container-high transition-colors duration-200 min-w-0">
                <GoogleIcon />
                <span className="font-label text-label-md text-on-surface">Google</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-md px-sm sm:px-lg bg-surface-container rounded-lg hover:bg-surface-container-high transition-colors duration-200 min-w-0">
                <AppleIcon />
                <span className="font-label text-label-md text-on-surface">Apple</span>
              </button>
            </div>
            <div className="w-full flex items-center gap-md mb-xl">
              <div className="h-px flex-1 bg-outline-variant/30" />
              <span className="font-label text-label-sm text-outline uppercase tracking-widest">Or continue with email</span>
              <div className="h-px flex-1 bg-outline-variant/30" />
            </div>
            <form
              className="w-full space-y-lg"
              onSubmit={handleSubmit}
            >
              <div className="space-y-1">
                <label className="font-label text-label-md text-on-surface-variant ml-1" htmlFor="email">
                  Email Address
                </label>
                <input
                  className="w-full h-11 px-md bg-surface border-l-2 border-l-transparent focus:border-l-primary outline-none transition-all duration-200 placeholder:text-outline/50 rounded-md font-body text-body-md text-on-surface"
                  id="email"
                  placeholder="name@store.com"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="font-label text-label-md text-on-surface-variant" htmlFor="password">
                    Password
                  </label>
                  <a className="font-label text-label-sm text-primary hover:underline" href="#">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    className="w-full h-11 px-md bg-surface border-l-2 border-l-transparent focus:border-l-primary outline-none transition-all duration-200 placeholder:text-outline/50 rounded-md font-body text-body-md text-on-surface"
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    className="absolute right-md top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    <Icon name={showPassword ? 'visibility_off' : 'visibility'} className="text-[20px]" />
                  </button>
                </div>
              </div>
              {error && (
                <div className="flex items-start gap-2 bg-error-container/40 rounded-md px-md py-sm">
                  <Icon name="error_outline" className="text-error text-[18px] mt-px flex-shrink-0" />
                  <p className="font-body text-body-sm text-error">{error}</p>
                </div>
              )}
              <div className="flex items-center gap-2 px-1">
                <input className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20" id="remember" type="checkbox" />
                <label className="font-label text-label-sm text-on-surface-variant cursor-pointer" htmlFor="remember">
                  Remember this device
                </label>
              </div>
              <button
                className="w-full h-11 bg-primary hover:bg-primary-container text-on-primary font-label text-label-md font-bold rounded-md shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 mt-xl flex items-center justify-center gap-2 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? <Icon name="sync" className="animate-spin" /> : null}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <p className="mt-xl font-body text-body-md text-on-surface-variant">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-label hover:underline decoration-2 underline-offset-4">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
