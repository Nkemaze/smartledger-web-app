const TOKEN_KEY = 'smartledger_token'
const PHONE_KEY = 'smartledger_pending_phone'
const USER_KEY = 'smartledger_user'
const BUSINESS_KEY = 'smartledger_business'

export type ApiErrorBody = { success: false; error: string }

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export const pendingPhoneStore = {
  get: () => localStorage.getItem(PHONE_KEY) ?? '',
  set: (phone: string) => localStorage.setItem(PHONE_KEY, phone),
  clear: () => localStorage.removeItem(PHONE_KEY),
}

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null

async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get()
  const headers = new Headers(options.headers)

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(`/api${path}`, { ...options, headers })

  let payload: unknown = null
  try {
    payload = await res.json()
  } catch {
    payload = null
  }

  if (!res.ok) {
    const body = payload as ApiErrorBody | null
    if (res.status === 401 && token) {
      tokenStore.clear()
    }
    throw new ApiError(body?.error ?? `Request failed (${res.status})`, res.status)
  }

  const data = (payload as { success?: boolean; data?: T; message?: string } | null) ?? null
  if (data && data.success === true && 'data' in data) {
    return data.data as T
  }
  return payload as T
}

export const api = {
  get<T>(path: string) {
    return request<T>(path)
  },
  post<T>(path: string, body: Json | FormData) {
    return request<T>(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) })
  },
  patch<T>(path: string, body: Json) {
    return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
  },
  put<T>(path: string, body: Json) {
    return request<T>(path, { method: 'PUT', body: JSON.stringify(body) })
  },
  delete<T>(path: string) {
    return request<T>(path, { method: 'DELETE' })
  },
}

export { USER_KEY, BUSINESS_KEY }

export function storeUser(user: unknown) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function storeBusiness(business: unknown) {
  localStorage.setItem(BUSINESS_KEY, JSON.stringify(business))
}

export function getStoredUser<T = unknown>(): T | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function getStoredBusiness<T = unknown>(): T | null {
  const raw = localStorage.getItem(BUSINESS_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(BUSINESS_KEY)
  tokenStore.clear()
}
