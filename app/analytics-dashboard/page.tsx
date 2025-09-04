"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  AlertTriangle,
  Calendar,
  Eye,
  Download,
  Filter,
} from "lucide-react"
import {
  getInvoices,
  getCustomers,
  getProducts,
  getPayments,
  getLowStockProducts,
} from "@/lib/business-store"
import type { Invoice, Customer, Product, Payment } from "@/lib/business-types"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

interface AnalyticsData {
  totalRevenue: number
  totalInvoices: number
  totalCustomers: number
  totalProducts: number
  paidInvoices: number
  pendingAmount: number
  lowStockCount: number
  revenueGrowth: number
  customerGrowth: number
  monthlyRevenue: Array<{ month: string; revenue: number; profit: number }>
  categoryRevenue: Array<{ category: string; revenue: number; count: number }>
  paymentMethods: Array<{ method: string; amount: number; count: number }>
  topProducts: Array<{ name: string; revenue: number; quantity: number }>
  recentActivity: Array<{ date: string; activity: string; amount: number }>
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [dateRange, setDateRange] = useState("30")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalyticsData()
  }, [dateRange])

  const loadAnalyticsData = () => {
    setLoading(true)
    try {
      const invoices = getInvoices()
      const customers = getCustomers()
      const products = getProducts()
      const payments = getPayments()
      const lowStockProducts = getLowStockProducts()

      // Filter data based on date range
      const daysAgo = parseInt(dateRange)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo)

      const filteredInvoices = invoices.filter(
        (invoice) => new Date(invoice.createdAt) >= cutoffDate
      )
      const filteredCustomers = customers.filter(
        (customer) => new Date(customer.createdAt) >= cutoffDate
      )

      // Calculate metrics
      const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
      const paidInvoices = filteredInvoices.filter(inv => inv.paymentStatus === 'paid').length
      const pendingAmount = filteredInvoices
        .filter(inv => inv.paymentStatus !== 'paid')
        .reduce((sum, inv) => sum + inv.balanceDue, 0)

      // Calculate growth (comparing with previous period)
      const previousCutoffDate = new Date(cutoffDate)
      previousCutoffDate.setDate(previousCutoffDate.getDate() - daysAgo)
      
      const previousInvoices = invoices.filter(
        (invoice) => new Date(invoice.createdAt) >= previousCutoffDate && new Date(invoice.createdAt) < cutoffDate
      )
      const previousCustomers = customers.filter(
        (customer) => new Date(customer.createdAt) >= previousCutoffDate && new Date(customer.createdAt) < cutoffDate
      )

      const previousRevenue = previousInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
      const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0
      const customerGrowth = previousCustomers.length > 0 ? ((filteredCustomers.length - previousCustomers.length) / previousCustomers.length) * 100 : 0

      // Monthly revenue data
      const monthlyData = generateMonthlyData(invoices)
      
      // Category revenue
      const categoryData = generateCategoryData(filteredInvoices, products)
      
      // Payment methods
      const paymentData = generatePaymentMethodData(payments)
      
      // Top products
      const topProductsData = generateTopProductsData(filteredInvoices)
      
      // Recent activity
      const recentActivity = generateRecentActivity(invoices, customers)

      setAnalyticsData({
        totalRevenue,
        totalInvoices: filteredInvoices.length,
        totalCustomers: filteredCustomers.length,
        totalProducts: products.length,
        paidInvoices,
        pendingAmount,
        lowStockCount: lowStockProducts.length,
        revenueGrowth,
        customerGrowth,
        monthlyRevenue: monthlyData,
        categoryRevenue: categoryData,
        paymentMethods: paymentData,
        topProducts: topProductsData,
        recentActivity,
      })
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMonthlyData = (invoices: Invoice[]) => {
    const monthlyMap = new Map()
    const last6Months = []
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toISOString().slice(0, 7)
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      monthlyMap.set(monthKey, { month: monthName, revenue: 0, profit: 0 })
      last6Months.push(monthKey)
    }

    invoices.forEach(invoice => {
      const monthKey = new Date(invoice.createdAt).toISOString().slice(0, 7)
      if (monthlyMap.has(monthKey)) {
        const data = monthlyMap.get(monthKey)
        data.revenue += invoice.totalAmount
        // Estimate profit as 30% of revenue (you can make this more accurate)
        data.profit += invoice.totalAmount * 0.3
      }
    })

    return last6Months.map(key => monthlyMap.get(key))
  }

  const generateCategoryData = (invoices: Invoice[], products: Product[]) => {
    const categoryMap = new Map()
    
    invoices.forEach(invoice => {
      invoice.items.forEach(item => {
        const product = products.find(p => p.id === item.productId)
        const category = product?.category || 'Other'
        
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { category, revenue: 0, count: 0 })
        }
        
        const data = categoryMap.get(category)
        data.revenue += item.totalAmount
        data.count += item.quantity
      })
    })

    return Array.from(categoryMap.values()).sort((a, b) => b.revenue - a.revenue)
  }

  const generatePaymentMethodData = (payments: Payment[]) => {
    const methodMap = new Map()
    
    payments.forEach(payment => {
      if (!methodMap.has(payment.method)) {
        methodMap.set(payment.method, { method: payment.method, amount: 0, count: 0 })
      }
      
      const data = methodMap.get(payment.method)
      data.amount += payment.amount
      data.count += 1
    })

    return Array.from(methodMap.values())
  }

  const generateTopProductsData = (invoices: Invoice[]) => {
    const productMap = new Map()
    
    invoices.forEach(invoice => {
      invoice.items.forEach(item => {
        if (!productMap.has(item.productId)) {
          productMap.set(item.productId, {
            name: item.productName,
            revenue: 0,
            quantity: 0
          })
        }
        
        const data = productMap.get(item.productId)
        data.revenue += item.totalAmount
        data.quantity += item.quantity
      })
    })

    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  }

  const generateRecentActivity = (invoices: Invoice[], customers: Customer[]) => {
    const activities: Array<{ date: string; activity: string; amount: number }> = []
    
    // Recent invoices
    invoices.slice(-10).forEach(invoice => {
      activities.push({
        date: new Date(invoice.createdAt).toLocaleDateString(),
        activity: `Invoice ${invoice.invoiceNumber} created for ${invoice.customerName}`,
        amount: invoice.totalAmount
      })
    })
    
    // Recent customers
    customers.slice(-5).forEach(customer => {
      activities.push({
        date: new Date(customer.createdAt).toLocaleDateString(),
        activity: `New customer ${customer.name} added`,
        amount: 0
      })
    })

    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Data Available</h2>
          <p className="text-gray-600">Unable to load analytics data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Business Analytics</h1>
          <p className="text-gray-600">Comprehensive business insights and reports</p>
        </div>
        <div className="flex gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.totalRevenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analyticsData.revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span className={analyticsData.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(analyticsData.revenueGrowth).toFixed(1)}%
              </span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.paidInvoices} paid, {analyticsData.totalInvoices - analyticsData.paidInvoices} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalCustomers}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analyticsData.customerGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span className={analyticsData.customerGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(analyticsData.customerGrowth).toFixed(1)}%
              </span>
              <span className="ml-1">growth</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.pendingAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.lowStockCount} products low in stock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
                <CardDescription>Revenue and profit over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" name="Revenue" />
                    <Area type="monotone" dataKey="profit" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Profit" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Payment Methods Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Distribution of payment methods used</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.paymentMethods}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ method, percent }: any) => `${method} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {analyticsData.paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest business activities and transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">{activity.activity}</p>
                        <p className="text-xs text-gray-500">{activity.date}</p>
                      </div>
                    </div>
                    {activity.amount > 0 && (
                      <Badge variant="secondary">{formatCurrency(activity.amount)}</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Revenue */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
                <CardDescription>Sales performance across product categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analyticsData.categoryRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Best performing products by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topProducts.slice(0, 8).map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.quantity} units sold</p>
                        </div>
                      </div>
                      <Badge variant="outline">{formatCurrency(product.revenue)}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>Detailed analysis of product sales and inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData.topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue" />
                  <Bar yAxisId="right" dataKey="quantity" fill="#82ca9d" name="Quantity Sold" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>New customer acquisition over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-4xl font-bold text-blue-600">{analyticsData.totalCustomers}</div>
                  <p className="text-gray-600 mt-2">Total Customers</p>
                  <div className="flex items-center justify-center mt-4">
                    {analyticsData.customerGrowth >= 0 ? (
                      <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 mr-2 text-red-500" />
                    )}
                    <span className={`text-lg font-semibold ${
                      analyticsData.customerGrowth >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {Math.abs(analyticsData.customerGrowth).toFixed(1)}%
                    </span>
                    <span className="ml-2 text-gray-600">growth</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Insights</CardTitle>
                <CardDescription>Key customer metrics and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Average Order Value</span>
                    <span className="font-bold">
                      {formatCurrency(analyticsData.totalRevenue / Math.max(analyticsData.totalInvoices, 1))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Orders per Customer</span>
                    <span className="font-bold">
                      {(analyticsData.totalInvoices / Math.max(analyticsData.totalCustomers, 1)).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Payment Success Rate</span>
                    <span className="font-bold">
                      {((analyticsData.paidInvoices / Math.max(analyticsData.totalInvoices, 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}