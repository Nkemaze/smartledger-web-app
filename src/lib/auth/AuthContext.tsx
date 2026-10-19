import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { authService, businessService } from '@/lib/api'
import type { User, Business, SignUpInput } from '@/lib/api'

type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

interface AuthContextValue {
  status: AuthStatus
  user: User | null
  business: Business | null
  login: (identifier: string, password: string) => Promise<User>
  signUp: (input: SignUpInput) => Promise<void>
  logout: () => void
  refreshBusiness: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)

  useEffect(() => {
    const token = authService.getCachedUser()
    if (!token) {
      setStatus('anonymous')
      return
    }
    setUser(authService.getCachedUser())
    setBusiness(authService.getCachedBusiness())
    setStatus('authenticated')
  }, [])

  const refreshBusiness = useCallback(async () => {
    try {
      const b = await businessService.get()
      setBusiness(b)
    } catch {
      /* keep cached business on transient failures */
    }
  }, [])

  const login = useCallback(async (identifier: string, password: string) => {
    const result = await authService.login(identifier, password)
    setUser(result.user)
    setStatus('authenticated')
    setBusiness(null)
    // Platform admins have no business of their own — skip the business fetch.
    if (!result.user.platformAdmin) {
      try {
        const b = await businessService.get()
        setBusiness(b)
      } catch {
        setBusiness(null)
      }
    }
    return result.user
  }, [])

  const signUp = useCallback(async (input: SignUpInput) => {
    const result = await authService.signUp(input)
    setUser(result.user)
    if (result.business) setBusiness(result.business)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
    setBusiness(null)
    setStatus('anonymous')
  }, [])

  return (
    <AuthContext.Provider value={{ status, user, business, login, signUp, logout, refreshBusiness }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const { status, user } = useAuth()
  if (status === 'loading') return null
  if (status === 'authenticated') return <Navigate to={user?.platformAdmin ? '/admin' : '/'} replace />
  return <>{children}</>
}

/**
 * Guards the platform super-admin console. Non-admins (and store owners)
 * are sent back to the store dashboard.
 */
export function RequirePlatformAdmin({ children }: { children: ReactNode }) {
  const { status, user } = useAuth()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />
  }

  if (!user?.platformAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
