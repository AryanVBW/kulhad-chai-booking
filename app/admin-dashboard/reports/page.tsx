"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, DollarSign, ShoppingCart, Users, Download, Calendar, Package } from "lucide-react"
import { getInvoices, getProducts, getCustomers, getPayments } from "@/lib/business-store"
import type { Invoice, Product, Customer, Payment } from "@/lib/business-types"

export default function ReportsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [dateRange, setDateRange] = useState("30") // days
  const [reportType, setReportType] = useState("overview")

  useEffect(() => {
    setInvoices(getInvoices())
    setProducts(getProducts())
    setCustomers(getCustomers())
    setPayments(getPayments())
  }, [])

  // Filter data based on date range
  const filterByDateRange = (items: any[], dateField = "createdAt") => {
    const days = Number.parseInt(dateRange)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return items.filter((item) => {
      const itemDate = new Date(item[dateField])
      return itemDate >= cutoffDate
    })
  }

  const filteredInvoices = filterByDateRange(invoices)
  const filteredPayments = filterByDateRange(payments)

  // Calculate metrics
  const totalRevenue = filteredInvoices
    .filter((inv) => inv.paymentStatus === "paid")
    .reduce((sum, inv) => sum + inv.totalAmount, 0)

  const totalProfit = filteredInvoices
    .filter((inv) => inv.paymentStatus === "paid")
    .reduce((sum, inv) => {
      const profit = inv.items.reduce((itemSum, item) => {
        const product = products.find((p) => p.id === item.productId)
        const costPrice = product ? product.cost : 0
        return itemSum + (item.unitPrice - costPrice) * item.quantity
      }, 0)
      return sum + profit
    }, 0)

  const pendingAmount = filteredInvoices
    .filter((inv) => inv.paymentStatus !== "paid")
    .reduce((sum, inv) => sum + inv.balanceDue, 0)

  // Sales by day for chart
  const salesByDay = filteredInvoices.reduce(
    (acc, invoice) => {
      const date = new Date(invoice.createdAt).toLocaleDateString()
      if (!acc[date]) {
        acc[date] = { date, sales: 0, invoices: 0 }
      }
      if (invoice.paymentStatus === "paid") {
        acc[date].sales += invoice.totalAmount
      }
      acc[date].invoices += 1
      return acc
    },
    {} as Record<string, { date: string; sales: number; invoices: number }>,
  )

  const chartData = Object.values(salesByDay).slice(-7) // Last 7 days

  // Top products
  const productSales = filteredInvoices
    .filter((inv) => inv.paymentStatus === "paid")
    .flatMap((inv) => inv.items)
    .reduce(
      (acc, item) => {
        if (!acc[item.productId]) {
          acc[item.productId] = {
            productId: item.productId,
            productName: item.productName,
            quantity: 0,
            revenue: 0,
          }
        }
        acc[item.productId].quantity += item.quantity
        acc[item.productId].revenue += item.totalAmount
        return acc
      },
      {} as Record<string, any>,
    )

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Payment method breakdown
  const paymentMethods = filteredPayments.reduce(
    (acc, payment) => {
      if (!acc[payment.method]) {
        acc[payment.method] = { method: payment.method, amount: 0, count: 0 }
      }
      acc[payment.method].amount += payment.amount
      acc[payment.method].count += 1
      return acc
    },
    {} as Record<string, any>,
  )

  const paymentMethodData = Object.values(paymentMethods)

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-sidebar text-sidebar-foreground min-h-screen">
          <div className="p-6">
            <h1 className="text-xl font-bold">Business Admin</h1>
            <p className="text-sm text-sidebar-foreground/70">Reports & Analytics</p>
          </div>
          <nav className="px-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => (window.location.href = "/admin-dashboard")}
            >
              <TrendingUp className="mr-3 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => (window.location.href = "/admin-dashboard/customers")}
            >
              <Users className="mr-3 h-4 w-4" />
              Customers
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => (window.location.href = "/admin-dashboard/products")}
            >
              <Package className="mr-3 h-4 w-4" />
              Products
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => (window.location.href = "/admin-dashboard/invoices")}
            >
              <ShoppingCart className="mr-3 h-4 w-4" />
              Invoices
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => (window.location.href = "/admin-dashboard/payments")}
            >
              <DollarSign className="mr-3 h-4 w-4" />
              Payments
            </Button>
            <Button variant="default" className="w-full justify-start">
              <TrendingUp className="mr-3 h-4 w-4" />
              Reports
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
              <p className="text-muted-foreground">Business insights and performance metrics</p>
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
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12% from last period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalProfit.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Profit margin: {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{pendingAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Outstanding payments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredInvoices.length}</div>
                <p className="text-xs text-muted-foreground">
                  {filteredInvoices.filter((inv) => inv.paymentStatus === "paid").length} paid
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ method, amount }) => `${method}: ₹${amount}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity Sold</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Avg. Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={product.productId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          {product.productName}
                        </div>
                      </TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>₹{product.revenue.toLocaleString()}</TableCell>
                      <TableCell>₹{(product.revenue / product.quantity).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
