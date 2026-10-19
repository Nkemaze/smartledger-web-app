import { api } from './client'
import type {
  ApiTransaction,
  ApiProduct,
  ApiCustomer,
  ApiSupplier,
  ApiFiling,
  TaxSummary,
  VatEntry,
  DashboardData,
  PnlData,
  BalanceSheetData,
  AdvisorInsight,
  ApiNotification,
  WhatsappMessage,
  ApiDocument,
  StaffMember,
  StaffPerformance,
  TxnType,
  ApiSubscription,
  PlanDefinition,
  SubscriptionPlan,
  AdminStats,
  AdminBusinessRow,
  AdminUserRow,
  AdminPagination,
  ApiSubscriptionRecord,
  AdminConversation,
} from './types'

const qs = (params: Record<string, string | number | boolean | undefined>) => {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }
  const s = search.toString()
  return s ? `?${s}` : ''
}

export const transactionService = {
  list: (params: { type?: TxnType; category?: string; search?: string; from?: string; to?: string; limit?: number } = {}) =>
    api.get<ApiTransaction[]>(`/transactions${qs(params)}`),
  get: (id: string) => api.get<ApiTransaction>(`/transactions/${id}`),
  create: (input: Record<string, unknown>) => api.post<ApiTransaction>('/transactions', input),
  update: (id: string, input: Record<string, unknown>) => api.patch<ApiTransaction>(`/transactions/${id}`, input),
  remove: (id: string) => api.delete<{ message: string }>(`/transactions/${id}`),
}

export const inventoryService = {
  list: (params: { search?: string; category?: string; lowStock?: boolean } = {}) =>
    api.get<ApiProduct[]>(`/inventory${qs(params)}`),
  get: (id: string) => api.get<ApiProduct>(`/inventory/${id}`),
  create: (input: Record<string, unknown>) => api.post<ApiProduct>('/inventory', input),
  update: (id: string, input: Record<string, unknown>) => api.patch<ApiProduct>(`/inventory/${id}`, input),
  adjustStock: (id: string, quantity: number) => api.patch<ApiProduct>(`/inventory/${id}/stock`, { quantity }),
  remove: (id: string) => api.delete<{ message: string }>(`/inventory/${id}`),
}

export const taxService = {
  summary: () => api.get<TaxSummary>('/tax'),
  vatLedger: (period?: string) => api.get<VatEntry[]>(`/tax/vat-ledger${period ? `?period=${period}` : ''}`),
  filings: () => api.get<ApiFiling[]>('/tax/filings'),
  createFiling: (input: { period: string; dueDate?: string; vatCollected?: number; vatPaid?: number }) =>
    api.post<ApiFiling>('/tax/filings', input),
  updateFiling: (id: string, input: Record<string, unknown>) => api.patch<ApiFiling>(`/tax/filings/${id}`, input),
}

export const reportService = {
  dashboard: () => api.get<DashboardData>('/reports/dashboard'),
  pnl: (from?: string, to?: string) => api.get<PnlData>(`/reports/pnl${qs({ from, to })}`),
  balanceSheet: () => api.get<BalanceSheetData>('/reports/balance-sheet'),
}

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

export const advisorService = {
  insights: () => api.get<{ insights: AdvisorInsight[] }>('/advisor/insights'),
  chat: (message: string, history: ChatMessage[] = []) =>
    api.post<{ reply: string; source: 'ai' | 'offline' }>('/advisor/chat', { message, history }),
}

export const notificationService = {
  list: (unreadOnly = false) => api.get<ApiNotification[]>(`/notifications${unreadOnly ? '?unread=true' : ''}`),
  unreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
  markRead: (id: string) => api.patch<ApiNotification>(`/notifications/${id}/read`, {}),
  markAllRead: () => api.patch<{ count: number }>('/notifications/read-all', {}),
}

export type DailySummarySettings = {
  enabled: boolean
  phone: string
  schedule: string
  timezone: string
  whatsappConfigured: boolean
}

export const whatsappService = {
  dailySummary: () => api.get<DailySummarySettings>('/whatsapp/daily-summary'),
  setDailySummary: (enabled: boolean) =>
    api.patch<DailySummarySettings>('/whatsapp/daily-summary', { enabled }),
  testDailySummary: () => api.post<{ message: string }>('/whatsapp/daily-summary/test', {}),
}

export const archiveService = {
  list: () => api.get<ApiDocument[]>('/archive'),
  upload: (file: File, type: string, transactionId?: string) => {
    const form = new FormData()
    form.append('file', file)
    form.append('type', type)
    if (transactionId) form.append('transactionId', transactionId)
    return api.post<ApiDocument>('/archive', form)
  },
  remove: (id: string) => api.delete<{ message: string }>(`/archive/${id}`),
}

export const staffService = {
  list: () => api.get<StaffMember[]>('/staff'),
  add: (input: { name: string; phone: string; email?: string; role: 'CASHIER' | 'ACCOUNTANT'; monthlyTarget?: number; password: string }) =>
    api.post<StaffMember>('/staff', input),
  performance: (id: string) => api.get<StaffPerformance>(`/staff/${id}/performance`),
  updateRole: (id: string, role: string) => api.patch<StaffMember>(`/staff/${id}/role`, { role }),
  update: (id: string, input: Record<string, unknown>) => api.patch<StaffMember>(`/staff/${id}`, input),
  remove: (id: string) => api.delete<{ message: string }>(`/staff/${id}`),
}

export const customerService = {
  list: () => api.get<ApiCustomer[]>('/customers'),
}

export const supplierService = {
  list: () => api.get<ApiSupplier[]>('/suppliers'),
}

export const subscriptionService = {
  me: () => api.get<ApiSubscription>('/subscriptions'),
  plans: () => api.get<PlanDefinition[]>('/subscriptions/plans'),
  selectPlan: (plan: SubscriptionPlan) => api.post<ApiSubscription>('/subscriptions/select-plan', { plan }),
}

export const adminService = {
  stats: () => api.get<AdminStats>('/admin/stats'),
  businesses: (params: { page?: number; pageSize?: number; search?: string } = {}) =>
    api.get<{ data: AdminBusinessRow[]; pagination: AdminPagination }>(`/admin/businesses${qs(params)}`),
  businessDetail: (id: string) => api.get<AdminBusinessRow>(`/admin/businesses/${id}`),
  extendSubscription: (id: string, days: number) =>
    api.patch<ApiSubscriptionRecord>(`/admin/businesses/${id}/subscription`, { days }),
  users: (params: { page?: number; pageSize?: number; search?: string } = {}) =>
    api.get<{ data: AdminUserRow[]; pagination: AdminPagination }>(`/admin/users${qs(params)}`),
  setUserActive: (id: string, isActive: boolean) =>
    api.patch<AdminUserRow>(`/admin/users/${id}/active`, { isActive }),

  // Platform inbox — messages sent to the platform's WhatsApp number.
  inboxConversations: () =>
    api.get<AdminConversation[]>('/admin/inbox/conversations'),
  inboxUnreadCount: () =>
    api.get<{ count: number }>('/admin/inbox/conversations/unread-count'),
  inboxThread: (phone: string) =>
    api.get<WhatsappMessage[]>(
      `/admin/inbox/conversations/${encodeURIComponent(phone)}`,
    ),
  inboxReply: (phone: string, text: string) =>
    api.post<WhatsappMessage>(
      `/admin/inbox/conversations/${encodeURIComponent(phone)}/reply`,
      { text },
    ),
}
