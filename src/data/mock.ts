import type {
  Transaction,
  InventoryItem,
  StaffMember,
  Document,
  VatEntry,
  Filing,
  PermissionRow,
} from '@/types'

export const salesTrendData = [
  { day: 'Mon', revenue: 1920000 },
  { day: 'Tue', revenue: 2460000 },
  { day: 'Wed', revenue: 2280000 },
  { day: 'Thu', revenue: 3120000 },
  { day: 'Fri', revenue: 4080000 },
  { day: 'Sat', revenue: 3540000 },
  { day: 'Sun', revenue: 2670000 },
]

export const expenseShareData = [
  { name: 'Inventory Purchase', value: 70, color: 'var(--tw-primary, #006b2c)' },
  { name: 'Logistics', value: 22, color: '#0051d5' },
  { name: 'Utilities', value: 8, color: '#d3e4fe' },
]

export const transactions: Transaction[] = [
  {
    id: '#TRX-8921',
    date: 'Oct 24',
    time: '2:14 PM',
    customer: 'Jane Doe',
    customerSub: 'jane.d@example.com',
    initials: 'JD',
    items: 3,
    status: 'Success',
    amount: 270000,
    method: 'Card',
  },
  {
    id: '#TRX-8920',
    date: 'Oct 24',
    time: '1:45 PM',
    customer: 'Mark Ross',
    customerSub: 'm.ross@cloud.net',
    initials: 'MR',
    items: 1,
    status: 'Success',
    amount: 723300,
    method: 'Transfer',
  },
  {
    id: '#TRX-8919',
    date: 'Oct 24',
    time: '12:30 PM',
    customer: 'Guest Local',
    customerSub: 'Walk-in customer',
    initials: 'GL',
    items: 5,
    status: 'Pending',
    amount: 49200,
    method: 'Cash',
  },
  {
    id: '#TRX-8918',
    date: 'Oct 23',
    time: '11:10 PM',
    customer: 'Anna Loft',
    customerSub: 'loft.studio@design.co',
    initials: 'AL',
    items: 2,
    status: 'Success',
    amount: 534000,
    method: 'Card',
  },
]

export const salesTransactions: Transaction[] = [
  {
    id: '#SL-90821',
    date: 'Oct 24',
    time: '2:14 PM',
    customer: 'Sarah Jenkins',
    customerSub: 'sarah.j@example.com',
    items: 4,
    status: 'Success',
    amount: 170400,
    method: 'Card',
  },
  {
    id: '#SL-90819',
    date: 'Oct 24',
    time: '1:45 PM',
    customer: 'Marcus Bennett',
    customerSub: 'm.bennett@cloud.net',
    initials: 'MB',
    items: 1,
    status: 'Pending',
    amount: 672300,
    method: 'Transfer',
  },
  {
    id: '#SL-90818',
    date: 'Oct 24',
    time: '12:30 PM',
    customer: 'Robert Chen',
    customerSub: 'Walking Customer',
    initials: 'RC',
    items: 12,
    status: 'Success',
    amount: 25740,
    method: 'Cash',
  },
  {
    id: '#SL-90799',
    date: 'Oct 23',
    time: '11:10 PM',
    customer: 'Anna Loft',
    customerSub: 'loft.studio@design.co',
    initials: 'AL',
    items: 2,
    status: 'Success',
    amount: 534000,
    method: 'Card',
  },
]

export const inventory: InventoryItem[] = [
  {
    name: 'Acoustic Pro Headphones',
    description: 'Active Noise Cancelling',
    sku: 'PH-2024-XB',
    category: 'Electronics',
    status: 'Healthy',
    units: 420,
    unitPrice: 179400,
    totalValue: 75348000,
    percent: 85,
  },
  {
    name: 'Nexus Mechanical Keyboard',
    description: 'Tactile Brown Switches',
    sku: 'KB-992-MK',
    category: 'Home Office',
    status: 'Low Stock',
    units: 12,
    unitPrice: 95400,
    totalValue: 1144800,
    percent: 12,
  },
  {
    name: 'Lumina Z-Series Camera',
    description: '4K Mirrorless Body',
    sku: 'CAM-88-MIR',
    category: 'Electronics',
    status: 'Out of Stock',
    units: 0,
    unitPrice: 1470000,
    totalValue: 0,
    percent: 0,
    grayscale: true,
  },
]

export const staff: StaffMember[] = [
  {
    id: '1',
    empId: '#SL-4920',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    role: 'Manager',
    status: 'Active',
    lastActive: 'Just now',
  },
  {
    id: '2',
    empId: '#SL-4811',
    name: 'Marcus Thorne',
    email: 'm.thorne@smartledger.com',
    role: 'Sales Associate',
    status: 'On Break',
    lastActive: '14 mins ago',
  },
  {
    id: '3',
    empId: '#SL-3902',
    name: 'Elena Rodriguez',
    email: 'e.rodriguez@smartledger.com',
    role: 'Inventory Clerk',
    status: 'Offline',
    lastActive: 'Yesterday, 6:45 PM',
  },
  {
    id: '4',
    empId: 'invite',
    name: 'Waiting for name...',
    email: 'david.v@gmail.com',
    role: 'Sales Associate',
    status: 'Invited',
    lastActive: 'Sent 2 hrs ago',
  },
]

export const documents: Document[] = [
  {
    id: 'INV-2024-0892',
    label: 'Sales Invoice',
    client: 'Client: Acme Corp',
    amount: 2550000,
    date: 'Oct 12, 2023',
    category: 'Services',
    status: 'VERIFIED',
  },
  {
    id: 'REC-0012-TX',
    label: 'Expense Receipt',
    client: 'Vendor: Office Depot',
    amount: 77070,
    date: 'Oct 14, 2023',
    category: 'Supplies',
    status: 'MISSING INFO',
  },
  {
    id: 'INV-2024-0910',
    label: 'SaaS Invoice',
    client: 'Client: CloudFlow',
    amount: 53400,
    date: 'Oct 15, 2023',
    category: 'SaaS',
    status: 'VERIFIED',
  },
]

export const vatEntries: VatEntry[] = [
  {
    orderId: 'INV-99281',
    sub: 'Retail Sale',
    date: 'Oct 24, 2024',
    type: 'SALES',
    net: 'FCFA 450,000',
    vat: 'FCFA 33,750',
    total: 'FCFA 483,750',
    status: 'Verified',
  },
  {
    orderId: 'PUR-44021',
    sub: 'Office Supplies',
    date: 'Oct 23, 2024',
    type: 'EXPENSE',
    net: 'FCFA 120,000',
    vat: 'FCFA 9,000',
    total: 'FCFA 129,000',
    status: 'Pending',
  },
  {
    orderId: 'INV-99275',
    sub: 'Consulting Fee',
    date: 'Oct 22, 2024',
    type: 'SALES',
    net: 'FCFA 1,200,000',
    vat: 'FCFA 90,000',
    total: 'FCFA 1,290,000',
    status: 'Verified',
  },
  {
    orderId: 'PUR-44018',
    sub: 'Inventory Restock',
    date: 'Oct 21, 2024',
    type: 'EXPENSE',
    net: 'FCFA 3,500,000',
    vat: 'FCFA 0',
    total: 'FCFA 3,500,000',
    status: 'Zero Rated',
  },
]

export const filings: Filing[] = [
  {
    period: 'Apr - Jun 2024',
    taxType: 'VAT Return',
    taxSub: 'receipt',
    amount: 'FCFA 8,574,000',
    date: 'July 07, 2024',
    status: 'Filed',
  },
  {
    period: 'May 2024',
    taxType: 'Payroll (PAYE)',
    taxSub: 'badge',
    amount: 'FCFA 4,866,270',
    date: 'June 19, 2024',
    status: 'Filed',
  },
  {
    period: 'Jul - Sep 2024',
    taxType: 'VAT Return',
    taxSub: 'receipt',
    amount: 'FCFA 9,804,000',
    date: '—',
    status: 'Pending',
  },
]

export const taxDistributionData = [
  { name: 'Income Tax', value: 45, color: '#006b2c' },
  { name: 'VAT', value: 35, color: '#0051d5' },
  { name: 'Payroll Tax', value: 20, color: '#825100' },
]

export const permissions: PermissionRow[] = [
  {
    section: 'Sales & Transactions',
    rows: [
      {
        name: 'Void Transactions',
        helper: 'Ability to cancel or refund settled sales',
        icon: 'receipt_long',
        admin: 'disabled-checked',
        manager: true,
        staff: false,
      },
    ],
  },
  {
    section: 'Inventory & Logistics',
    rows: [
      {
        name: 'Edit Products',
        helper: 'Modify pricing, descriptions, and SKU data',
        icon: 'edit_square',
        admin: 'full',
        manager: true,
        staff: 'disabled-off',
      },
    ],
  },
  {
    section: 'Reports & Insights',
    rows: [
      {
        name: 'View Financial Reports',
        helper: 'Access P&L, balance sheets, and tax summaries',
        icon: 'analytics',
        admin: 'full',
        manager: false,
        staff: 'denied',
      },
    ],
  },
]

export const recentChanges = [
  { title: "Admin updated 'Void Sales'", meta: '2 mins ago • Alex Sterling', color: 'bg-primary' },
  { title: "Created 'Regional Manager'", meta: '1 hour ago • System', color: 'bg-secondary' },
  { title: "Disabled 'Bulk Delete' for Staff", meta: '4 hours ago • Alex Sterling', color: 'bg-error' },
]
