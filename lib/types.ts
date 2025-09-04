// Database schema types for restaurant management system

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category:
    | "chai"
    | "iced-tea"
    | "hot-coffee"
    | "cold-coffee"
    | "burgers"
    | "maggie"
    | "sandwiches"
    | "pasta"
    | "bread"
    | "fries"
    | "pizza"
    | "milkshakes"
    | "mocktails"
    | "combos"
    | "snacks"
    | "beverages"
    | "desserts"
  image?: string
  available: boolean
  preparationTime: number // in minutes
  isCombo?: boolean
  comboItems?: string[] // Array of item names included in combo
}

export interface Table {
  id: string
  number: number
  capacity: number
  status: "available" | "occupied" | "reserved" | "cleaning"
  qrCode: string
}

export interface Order {
  id: string
  tableId: string
  items: OrderItem[]
  status: "pending" | "preparing" | "ready" | "served" | "completed" | "cancelled"
  totalAmount: number
  createdAt: Date
  updatedAt: Date
  customerName?: string
  customerPhone?: string
  notes?: string
}

export interface OrderItem {
  menuItemId: string
  quantity: number
  price: number
  notes?: string
}

export interface Bill {
  id: string
  orderId: string
  tableId: string
  items: BillItem[]
  subtotal: number
  tax: number
  total: number
  paymentStatus: "pending" | "paid" | "cancelled"
  paymentMethod?: "cash" | "card" | "upi"
  createdAt: Date
  paidAt?: Date
}

export interface BillItem {
  name: string
  quantity: number
  price: number
  total: number
}

export interface Analytics {
  date: string
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  popularItems: { itemId: string; name: string; count: number }[]
  tableUtilization: { tableId: string; occupancyRate: number }[]
}
