export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  category: string
  price: number
  cost: number
  stock: number
  minStock: number
  taxRate: number
  description?: string
  sku?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  customerAddress?: string
  items: InvoiceItem[]
  subtotal: number
  discount: number
  discountType: "percentage" | "fixed"
  taxAmount: number
  totalAmount: number
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  paymentStatus: "pending" | "partial" | "paid"
  paymentMethod?: "cash" | "card" | "upi" | "credit"
  paidAmount: number
  balanceDue: number
  dueDate?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface InvoiceItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discount: number
  taxRate: number
  taxAmount: number
  totalAmount: number
}

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  method: "cash" | "card" | "upi" | "credit"
  reference?: string
  notes?: string
  createdAt: Date
  createdBy: string
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  username: string
  password: string
  role: "admin" | "manager" | "staff"
  permissions: {
    customers: { read: boolean; write: boolean; delete: boolean }
    products: { read: boolean; write: boolean; delete: boolean }
    invoices: { read: boolean; write: boolean; delete: boolean }
    payments: { read: boolean; write: boolean; delete: boolean }
    reports: { read: boolean; write: boolean; delete: boolean }
    users: { read: boolean; write: boolean; delete: boolean }
  }
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface BusinessSettings {
  id: string
  businessName: string
  address: string
  phone: string
  email: string
  gstNumber?: string
  taxRate: number
  currency: string
  invoicePrefix: string
  invoiceCounter: number
  logoUrl?: string
}

export interface StockMovement {
  id: string
  productId: string
  type: "in" | "out" | "adjustment"
  quantity: number
  reason: string
  reference?: string
  createdAt: Date
  createdBy: string
}

export interface SalesReport {
  period: string
  totalSales: number
  totalProfit: number
  totalInvoices: number
  paidInvoices: number
  pendingAmount: number
  topProducts: Array<{
    productId: string
    productName: string
    quantitySold: number
    revenue: number
  }>
}

export interface BillTemplate {
  id: string
  name: string
  isDefault: boolean
  headerText: string
  footerText: string
  logoUrl?: string
  showLogo: boolean
  showGST: boolean
  showQR: boolean
  paperSize: "A4" | "A5" | "thermal"
  fontSize: "small" | "medium" | "large"
  colors: {
    primary: string
    secondary: string
    text: string
  }
  layout: {
    showBorder: boolean
    showWatermark: boolean
    compactMode: boolean
  }
  businessInfo: {
    name: string
    address: string
    phone: string
    email: string
    gstNumber?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface UserActivity {
  id: string
  userId: string
  userName: string
  action: string
  module: string
  details?: string
  timestamp: Date
}
