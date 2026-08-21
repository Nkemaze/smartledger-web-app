export type TxnType = 'INCOME' | 'EXPENSE'

export interface ApiTransaction {
  id: string
  type: TxnType
  category: string
  amount: number | string
  description?: string | null
  vatRate?: number | string | null
  vatAmount?: number | string | null
  occurredAt: string
  customer?: { id: string; name: string } | null
  user?: { id: string; name: string } | null
  items?: Array<{ id: string; quantity: number; unitPrice: number | string }>
}

export interface ApiProduct {
  id: string
  name: string
  sku?: string | null
  category?: string | null
  unitPrice: number | string
  stockQuantity: number
  reorderThreshold: number
  createdAt?: string
}

export interface ApiCustomer {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  address?: string | null
  balance: number | string
}

export interface ApiSupplier {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  address?: string | null
  balance: number | string
}

export interface ApiFiling {
  id: string
  period: string
  vatCollected: number | string
  vatPaid: number | string
  status: string
  dueDate?: string | null
  submittedAt?: string | null
}

export interface TaxSummary {
  vatCollected: number | string
  vatPaid: number | string
  vatNet: number | string
  totalSales: number | string
  defaultVatRate: number | string | null
  filings: ApiFiling[]
}

export interface VatEntry {
  id: string
  type: TxnType
  category: string
  amount: number | string
  vatRate?: number | string | null
  vatAmount?: number | string | null
  occurredAt: string
  description?: string | null
  customer?: { id: string; name: string } | null
}

export interface DashboardTotals {
  revenue: number | string
  expenses: number | string
  profit: number | string
  transactionCount: number
}

export interface DashboardData {
  totals: DashboardTotals
  currentMonth: { revenue: number | string; expenses: number | string; profit: number | string }
  salesTrend: Array<{ period: string; revenue: number | string }>
  expenseShare: Array<{ category: string; amount: number | string }>
  lowStockProducts: Array<{
    id: string
    name: string
    stockQuantity: number
    reorderThreshold: number
    unitPrice: number | string
  }>
  topProducts: Array<{ productId: string; name?: string | null; quantitySold: number; revenue: number }>
  recentTransactions: ApiTransaction[]
  inventory: { products: number; totalValue: number; lowStockCount: number }
  receivables: number | string
  payables: number | string
}

export interface PnlData {
  revenue: number | string
  expenseBreakdown: Array<{ category: string; amount: number | string }>
  totalExpenses: number | string
  grossProfit: number | string
  vatCollected: number | string
  vatPaid: number | string
  netProfit: number | string
}

export interface BalanceSheetData {
  assets: { cash: number | string; inventory: number | string; receivables: number | string; total: number | string }
  liabilities: { payables: number | string; vatOwed: number | string; total: number | string }
  equity: number | string
}

export interface AdvisorInsight {
  id: string
  type: 'low_stock' | 'cashflow' | 'tax' | 'sales' | 'inventory'
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  recommendation?: string
}

export interface ApiNotification {
  id: string
  type: string
  message: string
  channel: string
  isRead: boolean
  createdAt: string
}

export interface ApiDocument {
  id: string
  type: string
  fileUrl: string
  fileName?: string | null
  fileSize?: number | null
  createdAt: string
  transaction?: { id: string; amount: number | string; occurredAt: string } | null
}

export interface StaffMember {
  id: string
  name: string
  phone: string
  email?: string | null
  role: 'OWNER' | 'CASHIER' | 'ACCOUNTANT'
  isActive: boolean
  monthlyTarget?: number | string | null
  createdAt: string
}

export interface StaffPerformance extends StaffMember {
  stats: {
    totalSales: number | string
    totalTransactions: number
    monthRevenue: number | string
    monthTransactions: number
    averageSale: number | string
    monthlyTarget: number | string
    targetProgress: number | null
  }
}

export type SubscriptionPlan = 'FREE_TRIAL' | 'BASIC' | 'STANDARD' | 'PREMIUM'
export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'EXPIRED'

export interface ApiSubscription {
  id: string
  businessId: string
  plan: SubscriptionPlan
  planName: string
  status: SubscriptionStatus
  trialUsed: boolean
  trialEndsAt?: string | null
  periodEndsAt?: string | null
  daysRemaining: number | null
  createdAt: string
}

export interface PlanDefinition {
  plan: SubscriptionPlan
  name: string
  tagline: string
  monthlyPrice: number
  trialDays?: number
  features: string[]
}
