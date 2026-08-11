import { api, tokenStore, pendingPhoneStore, storeUser, storeBusiness, getStoredUser, getStoredBusiness, clearSession } from './client'

export type UserRole = 'OWNER' | 'CASHIER' | 'ACCOUNTANT'

export interface User {
  id: string
  businessId: string
  name: string
  phone: string
  email?: string | null
  role: UserRole
  monthlyTarget?: number | null
  isActive: boolean
}

export interface Business {
  id: string
  name: string
  shopType: string
  currency: string
  taxId?: string | null
  address?: string | null
  phone?: string | null
  vatRate?: number | null
  filingFrequency?: string | null
}

export interface AuthResult {
  token: string
  user: User
  business?: Business
}

export interface SignUpInput {
  businessName: string
  shopType: string
  ownerName: string
  phone: string
  email?: string
  password: string
}

export const authService = {
  async signUp(input: SignUpInput) {
    const result = await api.post<AuthResult>('/auth/signup', { ...input })
    tokenStore.set(result.token)
    storeUser(result.user)
    if (result.business) storeBusiness(result.business)
    pendingPhoneStore.set(input.phone)
    return result
  },

  async login(identifier: string, password: string) {
    const result = await api.post<AuthResult>('/auth/login', { identifier, password })
    tokenStore.set(result.token)
    storeUser(result.user)
    return result
  },

  async requestOtp(phone: string) {
    return api.post<{ message: string }>('/auth/otp/request', { phone })
  },

  async verifyOtp(phone: string, code: string) {
    return api.post<{ message: string }>('/auth/otp/verify', { phone, code })
  },

  logout() {
    clearSession()
  },

  getCachedUser(): User | null {
    return getStoredUser<User>()
  },
  getCachedBusiness(): Business | null {
    return getStoredBusiness<Business>()
  },
  getPendingPhone(): string {
    return pendingPhoneStore.get()
  },
}

export const businessService = {
  get: () => api.get<Business>('/business'),
  update: (input: Partial<Business>) => api.patch<Business>('/business', input),
}
