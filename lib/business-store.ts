import type {
  Customer,
  Product,
  Invoice,
  Payment,
  User,
  BusinessSettings,
  InvoiceItem,
  BillTemplate,
  UserActivity,
} from "./business-types"

// Storage keys
const STORAGE_KEYS = {
  CUSTOMERS: "business_customers",
  PRODUCTS: "business_products",
  INVOICES: "business_invoices",
  PAYMENTS: "business_payments",
  USERS: "business_users",
  SETTINGS: "business_settings",
  STOCK_MOVEMENTS: "business_stock_movements",
  CURRENT_USER: "business_current_user",
  BILL_TEMPLATES: "business_bill_templates", // Added bill templates storage key
  USER_ACTIVITY: "business_user_activity", // Added user activity storage key
}

// Initialize default data
const initializeDefaultData = () => {
  // Default business settings
  const defaultSettings: BusinessSettings = {
    id: "1",
    businessName: "Kulhad Chai Business",
    address: "123 Main Street, City, State 12345",
    phone: "+91 9876543210",
    email: "info@kulhadchai.com",
    gstNumber: "27AAAAA0000A1Z5",
    taxRate: 18,
    currency: "INR",
    invoicePrefix: "INV",
    invoiceCounter: 1000,
  }

  const defaultUser: User = {
    id: "1",
    name: "Administrator",
    email: "admin@kulhadchai.shop",
    phone: "+91 9876543210",
    username: "admin",
    password: "admin123",
    role: "admin",
    permissions: {
      customers: { read: true, write: true, delete: true },
      products: { read: true, write: true, delete: true },
      invoices: { read: true, write: true, delete: true },
      payments: { read: true, write: true, delete: true },
      reports: { read: true, write: true, delete: true },
      users: { read: true, write: true, delete: true },
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const defaultBillTemplate: BillTemplate = {
    id: "1",
    name: "Default Template",
    isDefault: true,
    headerText: "Thank you for your business!",
    footerText: "Visit us again soon!",
    showLogo: true,
    showGST: true,
    showQR: false,
    paperSize: "thermal",
    fontSize: "medium",
    colors: {
      primary: "#1f2937",
      secondary: "#6b7280",
      text: "#111827",
    },
    layout: {
      showBorder: true,
      showWatermark: false,
      compactMode: true,
    },
    businessInfo: {
      name: "Kulhad Chai Business",
      address: "123 Main Street, City, State 12345",
      phone: "+91 9876543210",
      email: "info@kulhadchai.com",
      gstNumber: "27AAAAA0000A1Z5",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // Default products
  const defaultProducts: Product[] = [
    {
      id: "1",
      name: "Kulhad Chai",
      category: "Beverages",
      price: 25,
      cost: 15,
      stock: 100,
      minStock: 20,
      taxRate: 5,
      description: "Traditional clay pot tea",
      sku: "KC001",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      name: "Samosa",
      category: "Snacks",
      price: 15,
      cost: 8,
      stock: 50,
      minStock: 10,
      taxRate: 5,
      description: "Crispy fried pastry with spiced filling",
      sku: "SM001",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  // Set default data if not exists
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings))
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([defaultUser]))
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(defaultProducts))
  }
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify([]))
  }
  if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify([]))
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]))
  }
  if (!localStorage.getItem(STORAGE_KEYS.STOCK_MOVEMENTS)) {
    localStorage.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, JSON.stringify([]))
  }
  if (!localStorage.getItem(STORAGE_KEYS.BILL_TEMPLATES)) {
    localStorage.setItem(STORAGE_KEYS.BILL_TEMPLATES, JSON.stringify([defaultBillTemplate]))
  }
  if (!localStorage.getItem(STORAGE_KEYS.USER_ACTIVITY)) {
    localStorage.setItem(STORAGE_KEYS.USER_ACTIVITY, JSON.stringify([]))
  }
}

// Customer management
export const getCustomers = (): Customer[] => {
  if (typeof window === "undefined") return []
  initializeDefaultData()
  const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS)
  return data ? JSON.parse(data) : []
}

export const saveCustomer = (customer: Omit<Customer, "id" | "createdAt" | "updatedAt">): Customer => {
  const customers = getCustomers()
  const newCustomer: Customer = {
    ...customer,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  customers.push(newCustomer)
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers))
  return newCustomer
}

export const updateCustomer = (id: string, updates: Partial<Customer>): Customer | null => {
  const customers = getCustomers()
  const index = customers.findIndex((c) => c.id === id)
  if (index === -1) return null

  customers[index] = { ...customers[index], ...updates, updatedAt: new Date() }
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers))
  return customers[index]
}

export const deleteCustomer = (id: string): boolean => {
  const customers = getCustomers()
  const filtered = customers.filter((c) => c.id !== id)
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(filtered))
  return filtered.length < customers.length
}

// Product management
export const getProducts = (): Product[] => {
  if (typeof window === "undefined") return []
  initializeDefaultData()
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
  return data ? JSON.parse(data) : []
}

export const saveProduct = (product: Omit<Product, "id" | "createdAt" | "updatedAt">): Product => {
  const products = getProducts()
  const newProduct: Product = {
    ...product,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  products.push(newProduct)
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
  return newProduct
}

export const updateProduct = (id: string, updates: Partial<Product>): Product | null => {
  const products = getProducts()
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) return null

  products[index] = { ...products[index], ...updates, updatedAt: new Date() }
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
  return products[index]
}

// Invoice management
export const getInvoices = (): Invoice[] => {
  if (typeof window === "undefined") return []
  initializeDefaultData()
  const data = localStorage.getItem(STORAGE_KEYS.INVOICES)
  return data ? JSON.parse(data) : []
}

export const saveInvoice = (invoice: Omit<Invoice, "id" | "invoiceNumber" | "createdAt" | "updatedAt">): Invoice => {
  const invoices = getInvoices()
  const settings = getBusinessSettings()

  const newInvoice: Invoice = {
    ...invoice,
    id: Date.now().toString(),
    invoiceNumber: `${settings.invoicePrefix}-${settings.invoiceCounter.toString().padStart(4, "0")}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  invoices.push(newInvoice)
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices))

  // Update invoice counter
  updateBusinessSettings({ invoiceCounter: settings.invoiceCounter + 1 })

  return newInvoice
}

export const updateInvoice = (id: string, updates: Partial<Invoice>): Invoice | null => {
  const invoices = getInvoices()
  const index = invoices.findIndex((i) => i.id === id)
  if (index === -1) return null

  invoices[index] = { ...invoices[index], ...updates, updatedAt: new Date() }
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices))
  return invoices[index]
}

// Payment management
export const getPayments = (): Payment[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS)
  return data ? JSON.parse(data) : []
}

export const savePayment = (payment: Omit<Payment, "id" | "createdAt">): Payment => {
  const payments = getPayments()
  const newPayment: Payment = {
    ...payment,
    id: Date.now().toString(),
    createdAt: new Date(),
  }
  payments.push(newPayment)
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments))

  // Update invoice payment status
  const invoice = getInvoices().find((i) => i.id === payment.invoiceId)
  if (invoice) {
    const totalPaid = payments.filter((p) => p.invoiceId === payment.invoiceId).reduce((sum, p) => sum + p.amount, 0)

    const paymentStatus = totalPaid >= invoice.totalAmount ? "paid" : totalPaid > 0 ? "partial" : "pending"

    updateInvoice(payment.invoiceId, {
      paidAmount: totalPaid,
      balanceDue: invoice.totalAmount - totalPaid,
      paymentStatus,
    })
  }

  return newPayment
}

// Business settings
export const getBusinessSettings = (): BusinessSettings => {
  const defaultSettings: BusinessSettings = {
    id: "1",
    businessName: "Kulhad Chai Business",
    address: "123 Main Street, City, State 12345",
    phone: "+91 9876543210",
    email: "info@kulhadchai.com",
    taxRate: 18,
    currency: "INR",
    invoicePrefix: "INV",
    invoiceCounter: 1000,
  }
  
  if (typeof window === "undefined") {
    return defaultSettings
  }
  
  initializeDefaultData()
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
  return data ? JSON.parse(data) : defaultSettings
}

export const updateBusinessSettings = (updates: Partial<BusinessSettings>): BusinessSettings => {
  const settings = getBusinessSettings()
  const updated = { ...settings, ...updates }
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated))
  return updated
}

// User management
export const getUsers = (): User[] => {
  if (typeof window === "undefined") return []
  initializeDefaultData()
  const data = localStorage.getItem(STORAGE_KEYS.USERS)
  return data ? JSON.parse(data) : []
}

export const addUser = (userData: Omit<User, "id" | "createdAt" | "updatedAt">): User => {
  const users = getUsers()
  const newUser: User = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  users.push(newUser)
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  logUserActivity(newUser.id, newUser.name, "Created new user", "users")
  return newUser
}

export const updateUser = (id: string, updates: Partial<User>): User | null => {
  const users = getUsers()
  const index = users.findIndex((u) => u.id === id)
  if (index === -1) return null

  users[index] = { ...users[index], ...updates, updatedAt: new Date() }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  logUserActivity(id, users[index].name, "Updated user profile", "users")
  return users[index]
}

export const deleteUser = (id: string): boolean => {
  const users = getUsers()
  const user = users.find((u) => u.id === id)
  const filtered = users.filter((u) => u.id !== id)
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered))
  if (user) {
    logUserActivity(id, user.name, "Deleted user account", "users")
  }
  return filtered.length < users.length
}

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
  return data ? JSON.parse(data) : getUsers()[0] || null
}

export const setCurrentUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
}

export const clearCurrentUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
}

export const authenticateUser = (email: string, password: string): User | null => {
  const users = getUsers()
  const user = users.find(u => u.email === email && u.password === password && u.isActive)
  
  if (user) {
    setCurrentUser(user)
    logUserActivity(user.id, user.name, 'Login', 'Authentication', 'User logged in successfully')
    return user
  }
  
  return null
}

export const logoutUser = (): void => {
  const currentUser = getCurrentUser()
  if (currentUser) {
    logUserActivity(currentUser.id, currentUser.name, 'Logout', 'Authentication', 'User logged out')
  }
  clearCurrentUser()
}

// Bill template management
export const getBillTemplates = (): BillTemplate[] => {
  if (typeof window === "undefined") return []
  initializeDefaultData()
  const data = localStorage.getItem(STORAGE_KEYS.BILL_TEMPLATES)
  return data ? JSON.parse(data) : []
}

export const saveBillTemplate = (template: Omit<BillTemplate, "id" | "createdAt" | "updatedAt">): BillTemplate => {
  const templates = getBillTemplates()
  const newTemplate: BillTemplate = {
    ...template,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  templates.push(newTemplate)
  localStorage.setItem(STORAGE_KEYS.BILL_TEMPLATES, JSON.stringify(templates))
  return newTemplate
}

export const updateBillTemplate = (id: string, updates: Partial<BillTemplate>): BillTemplate | null => {
  const templates = getBillTemplates()
  const index = templates.findIndex((t) => t.id === id)
  if (index === -1) return null

  templates[index] = { ...templates[index], ...updates, updatedAt: new Date() }
  localStorage.setItem(STORAGE_KEYS.BILL_TEMPLATES, JSON.stringify(templates))
  return templates[index]
}

export const deleteBillTemplate = (id: string): boolean => {
  const templates = getBillTemplates()
  const filtered = templates.filter((t) => t.id !== id)
  localStorage.setItem(STORAGE_KEYS.BILL_TEMPLATES, JSON.stringify(filtered))
  return filtered.length < templates.length
}

export const getDefaultBillTemplate = (): BillTemplate | null => {
  const templates = getBillTemplates()
  return templates.find((t) => t.isDefault) || templates[0] || null
}

// User activity logging
export const getUserActivity = (): UserActivity[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.USER_ACTIVITY)
  return data ? JSON.parse(data) : []
}

export const logUserActivity = (
  userId: string,
  userName: string,
  action: string,
  module: string,
  details?: string,
): void => {
  const activities = getUserActivity()
  const newActivity: UserActivity = {
    id: Date.now().toString(),
    userId,
    userName,
    action,
    module,
    details,
    timestamp: new Date(),
  }
  activities.unshift(newActivity) // Add to beginning
  // Keep only last 100 activities
  if (activities.length > 100) {
    activities.splice(100)
  }
  localStorage.setItem(STORAGE_KEYS.USER_ACTIVITY, JSON.stringify(activities))
}

// Utility functions
export const generateInvoiceNumber = (): string => {
  const settings = getBusinessSettings()
  return `${settings.invoicePrefix}-${settings.invoiceCounter.toString().padStart(4, "0")}`
}

export const getLowStockProducts = (): Product[] => {
  return getProducts().filter((product) => product.stock <= product.minStock && product.isActive)
}

export const calculateInvoiceTotal = (
  items: InvoiceItem[],
  discount: number,
  discountType: "percentage" | "fixed",
): {
  subtotal: number
  discountAmount: number
  taxAmount: number
  total: number
} => {
  const subtotal = items.reduce((sum, item) => sum + item.totalAmount, 0)
  const discountAmount = discountType === "percentage" ? (subtotal * discount) / 100 : discount
  const taxableAmount = subtotal - discountAmount
  const taxAmount = items.reduce((sum, item) => sum + item.taxAmount, 0)
  const total = taxableAmount + taxAmount

  return {
    subtotal,
    discountAmount,
    taxAmount,
    total,
  }
}
