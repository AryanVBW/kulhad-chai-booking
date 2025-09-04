"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Package, FileText, CreditCard, TrendingUp, AlertTriangle, DollarSign, ShoppingCart, Receipt, Settings } from "lucide-react"
import { getCustomers, getProducts, getInvoices, getLowStockProducts } from "@/lib/business-store"
import type { Customer, Product, Invoice } from "@/lib/business-types"

export default function AdminDashboard() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])

  useEffect(() => {
    setCustomers(getCustomers())
    setProducts(getProducts())
    setInvoices(getInvoices())
    setLowStockProducts(getLowStockProducts())
  }, [])

  const totalRevenue = invoices
    .filter((inv) => inv.paymentStatus === "paid")
    .reduce((sum, inv) => sum + inv.totalAmount, 0)

  const pendingAmount = invoices
    .filter((inv) => inv.paymentStatus !== "paid")
    .reduce((sum, inv) => sum + inv.balanceDue, 0)

  const thisMonthInvoices = invoices.filter((inv) => {
    const invoiceDate = new Date(inv.createdAt)
    const now = new Date()
    return invoiceDate.getMonth() === now.getMonth() && invoiceDate.getFullYear() === now.getFullYear()
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-sidebar text-sidebar-foreground min-h-screen">
          <div className="p-6">
            <h1 className="text-xl font-bold">Business Admin</h1>
            <p className="text-sm text-sidebar-foreground/70">Kulhad Chai Management</p>
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
              <FileText className="mr-3 h-4 w-4" />
              Invoices
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => (window.location.href = "/admin-dashboard/custom-bills")}
            >
              <Receipt className="mr-3 h-4 w-4" />
              Custom Bills
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => (window.location.href = "/admin-dashboard/bill-settings")}
            >
              <Settings className="mr-3 h-4 w-4" />
              Bill Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => (window.location.href = "/admin-dashboard/payments")}
            >
              <CreditCard className="mr-3 h-4 w-4" />
              Payments
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => (window.location.href = "/analytics-dashboard")}
            >
              <TrendingUp className="mr-3 h-4 w-4" />
              Analytics
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => (window.location.href = "/admin-dashboard/reports")}
            >
              <FileText className="mr-3 h-4 w-4" />
              Reports
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => (window.location.href = "/admin-dashboard/users")}
            >
              <Users className="mr-3 h-4 w-4" />
              User Management
            </Button>
            >
              <TrendingUp className="mr-3 h-4 w-4" />
              Reports
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => (window.location.href = "/admin-dashboard/users")}
            >
              <Users className="mr-3 h-4 w-4" />
              User Management
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => (window.location.href = "/admin-dashboard/bill-templates")}
            >
              <FileText className="mr-3 h-4 w-4" />
              Bill Templates
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
            <p className="text-muted-foreground">Welcome to your business management dashboard</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customers.length}</div>
                <p className="text-xs text-muted-foreground">Active customer base</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">From paid invoices</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{pendingAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Outstanding payments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{thisMonthInvoices.length}</div>
                <p className="text-xs text-muted-foreground">Invoices generated</p>
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Alert */}
          {lowStockProducts.length > 0 && (
            <Card className="mb-8 border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Low Stock Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <span className="font-medium">{product.name}</span>
                      <Badge variant="destructive">
                        {product.stock} left (Min: {product.minStock})
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customers.slice(0, 5).map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.phone}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => (window.location.href = `/admin-dashboard/customers/${customer.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                  {customers.length === 0 && <p className="text-muted-foreground text-center py-4">No customers yet</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.slice(0, 5).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">{invoice.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{invoice.totalAmount}</p>
                        <Badge
                          variant={
                            invoice.paymentStatus === "paid"
                              ? "default"
                              : invoice.paymentStatus === "partial"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {invoice.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {invoices.length === 0 && <p className="text-muted-foreground text-center py-4">No invoices yet</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
