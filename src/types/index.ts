export type StaffRole = 'Manager' | 'Sales Associate' | 'Inventory Clerk'

export interface Transaction {
  id: string
  date: string
  time: string
  customer: string
  customerSub: string
  initials?: string
  avatar?: string
  items: number
  status: 'Success' | 'Pending' | 'Failed'
  amount: number
  method: string
}

export interface InventoryItem {
  name: string
  description: string
  sku: string
  category: string
  status: 'Healthy' | 'Low Stock' | 'Out of Stock'
  units: number
  unitPrice: number
  totalValue: number
  percent: number
  image?: string
  grayscale?: boolean
}

export interface StaffMember {
  id: string
  empId: string
  name: string
  email: string
  role: StaffRole | 'Invited'
  status: 'Active' | 'On Break' | 'Offline' | 'Invited'
  lastActive: string
  avatar?: string
}

export interface Document {
  id: string
  label: string
  client: string
  amount: number
  date: string
  category: string
  status: 'VERIFIED' | 'MISSING INFO'
}

export interface VatEntry {
  orderId: string
  sub: string
  date: string
  type: 'SALES' | 'EXPENSE'
  net: string
  vat: string
  total: string
  status: 'Verified' | 'Pending' | 'Zero Rated'
}

export interface Filing {
  period: string
  taxType: string
  taxSub: string
  amount: string
  date: string
  status: 'Filed' | 'Pending'
}

export interface PermissionRow {
  section: string
  rows: {
    name: string
    helper: string
    icon: string
    admin: 'full' | 'checked' | 'disabled-checked'
    manager: boolean
    staff: boolean | 'disabled-off' | 'denied'
  }[]
}
