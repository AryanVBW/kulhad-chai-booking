"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  CreditCard,
  Plus,
  Search,
  ArrowLeft,
  Filter,
  DollarSign,
  Receipt,
  Smartphone,
  Banknote,
  Clock,
  CheckCircle,
} from "lucide-react"
import {
  getPayments,
  savePayment,
  getInvoices,
  getBusinessSettings,
  updateBusinessSettings,
} from "@/lib/supabase-service"
import type { Payment, Invoice, BusinessSettings } from "@/lib/business-types"

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])  
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null)
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false)
  const [isTaxSettingsOpen, setIsTaxSettingsOpen] = useState(false)

  // Payment form state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "upi" | "credit">("cash")
  const [paymentReference, setPaymentReference] = useState("")
  const [paymentNotes, setPaymentNotes] = useState("")

  // Tax settings state

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const filtered = payments.filter((payment) => {
      const invoice = invoices.find((inv) => inv.id === payment.invoiceId)
      const matchesSearch =
        invoice?.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice?.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.reference?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesMethod = methodFilter === "all" || payment.method === methodFilter

      return matchesSearch && matchesMethod
    })

    setFilteredPayments(filtered)
  }, [payments, invoices, searchTerm, methodFilter])

  const loadData = async () => {
    try {
      const [paymentsData, invoicesData, businessSettingsData] = await Promise.all([
        getPayments(),
        getInvoices(),
        getBusinessSettings()
      ])
      setPayments(paymentsData)
      setInvoices(invoicesData)
      setBusinessSettings(businessSettingsData)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleAddPayment = async () => {
    if (!selectedInvoice || !paymentAmount) return

    const amount = Number.parseFloat(paymentAmount)
    if (amount <= 0 || amount > selectedInvoice.balanceDue) return

    const newPayment = {
      invoiceId: selectedInvoice.id,
      amount,
      method: paymentMethod,
      reference: paymentReference,
      notes: paymentNotes,
      createdBy: "admin",
    }

    try {
      await savePayment(newPayment)
      await loadData()
      resetPaymentForm()
    } catch (error) {
      console.error('Error saving payment:', error)
    }
  }

  const resetPaymentForm = () => {
    setSelectedInvoice(null)
    setPaymentAmount("")
    setPaymentMethod("cash")
    setPaymentReference("")
    setPaymentNotes("")
    setIsAddPaymentOpen(false)
  }

  const handleTaxSettingsUpdate = async () => {
    if (!businessSettings) return
    
    try {
      await updateBusinessSettings(businessSettings)
      setIsTaxSettingsOpen(false)
    } catch (error) {
      console.error('Error updating business settings:', error)
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <Banknote className="h-4 w-4" />
      case "card":
        return <CreditCard className="h-4 w-4" />
      case "upi":
        return <Smartphone className="h-4 w-4" />
      case "credit":
        return <Clock className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "cash":
        return "default"
      case "card":
        return "secondary"
      case "upi":
        return "outline"
      case "credit":
        return "destructive"
      default:
        return "outline"
    }
  }

  const unpaidInvoices = invoices.filter((inv) => inv.paymentStatus !== "paid" && inv.status !== "cancelled")
  const totalPaymentsToday = payments
    .filter((payment) => {
      const paymentDate = new Date(payment.createdAt)
      const today = new Date()
      return paymentDate.toDateString() === today.toDateString()
    })
    .reduce((sum, payment) => sum + payment.amount, 0)

  const paymentsByMethod = payments.reduce(
    (acc, payment) => {
      acc[payment.method] = (acc[payment.method] || 0) + payment.amount
      return acc
    },
    {} as Record<string, number>,
  )

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
              <ArrowLeft className="mr-3 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant="default"
              className="w-full justify-start bg-sidebar-primary text-sidebar-primary-foreground"
            >
              <CreditCard className="mr-3 h-4 w-4" />
              Payments
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Payment & Tax Management</h1>
            <p className="text-muted-foreground">Record payments and manage tax settings</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Payments</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalPaymentsToday.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {payments.filter((p) => new Date(p.createdAt).toDateString() === new Date().toDateString()).length}{" "}
                  transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">All time payments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unpaidInvoices.length}</div>
                <p className="text-xs text-muted-foreground">Awaiting payment</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{unpaidInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Amount due</p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Object.entries(paymentsByMethod).map(([method, amount]) => (
              <Card key={method}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getPaymentMethodIcon(method)}
                    <span className="font-medium capitalize">{method}</span>
                  </div>
                  <div className="text-xl font-bold">₹{amount.toLocaleString()}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search payments by invoice, customer, or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isTaxSettingsOpen} onOpenChange={setIsTaxSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Tax Settings</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tax & Business Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Business Name</Label>
                    <Input
                      value={businessSettings?.businessName || ''}
                      onChange={(e) => setBusinessSettings({ ...businessSettings!, businessName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>GST Number</Label>
                    <Input
                      value={businessSettings?.gstNumber || ""}
                      onChange={(e) => setBusinessSettings({ ...businessSettings!, gstNumber: e.target.value })}
                      placeholder="27AAAAA0000A1Z5"
                    />
                  </div>
                  <div>
                    <Label>Default Tax Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={businessSettings?.taxRate || 0}
                      onChange={(e) =>
                        setBusinessSettings({ ...businessSettings!, taxRate: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Select
                      value={businessSettings?.currency || 'INR'}
                      onValueChange={(value) => setBusinessSettings({ ...businessSettings!, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleTaxSettingsUpdate}>Save Settings</Button>
                    <Button variant="outline" onClick={() => setIsTaxSettingsOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetPaymentForm()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record New Payment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Select Invoice *</Label>
                    <Select
                      value={selectedInvoice?.id || ""}
                      onValueChange={(value) => {
                        const invoice = unpaidInvoices.find((inv) => inv.id === value)
                        setSelectedInvoice(invoice || null)
                        setPaymentAmount(invoice?.balanceDue.toString() || "")
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose unpaid invoice" />
                      </SelectTrigger>
                      <SelectContent>
                        {unpaidInvoices.map((invoice) => (
                          <SelectItem key={invoice.id} value={invoice.id}>
                            {invoice.invoiceNumber} - {invoice.customerName} (₹{invoice.balanceDue.toLocaleString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedInvoice && (
                    <Card className="p-4 bg-muted/50">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Invoice Total:</span>
                          <span>₹{selectedInvoice.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Paid Amount:</span>
                          <span>₹{selectedInvoice.paidAmount.toLocaleString()}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>Balance Due:</span>
                          <span>₹{selectedInvoice.balanceDue.toLocaleString()}</span>
                        </div>
                      </div>
                    </Card>
                  )}

                  <div>
                    <Label>Payment Amount *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0.00"
                      max={selectedInvoice?.balanceDue || 0}
                    />
                  </div>

                  <div>
                    <Label>Payment Method *</Label>
                    <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">
                          <div className="flex items-center gap-2">
                            <Banknote className="h-4 w-4" />
                            Cash
                          </div>
                        </SelectItem>
                        <SelectItem value="card">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Card
                          </div>
                        </SelectItem>
                        <SelectItem value="upi">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            UPI
                          </div>
                        </SelectItem>
                        <SelectItem value="credit">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Credit
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Reference Number</Label>
                    <Input
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="Transaction ID, Check number, etc."
                    />
                  </div>

                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="Additional payment notes..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddPayment}
                      disabled={!selectedInvoice || !paymentAmount || Number.parseFloat(paymentAmount) <= 0}
                    >
                      Record Payment
                    </Button>
                    <Button variant="outline" onClick={resetPaymentForm}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment History ({filteredPayments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredPayments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => {
                      const invoice = invoices.find((inv) => inv.id === payment.invoiceId)
                      return (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{invoice?.invoiceNumber}</p>
                              <p className="text-sm text-muted-foreground">
                                Total: ₹{invoice?.totalAmount.toLocaleString()}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{invoice?.customerName}</p>
                              <p className="text-sm text-muted-foreground">{invoice?.customerPhone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-green-600">₹{payment.amount.toLocaleString()}</span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getPaymentMethodColor(payment.method)}
                              className="flex items-center gap-1 w-fit"
                            >
                              {getPaymentMethodIcon(payment.method)}
                              {payment.method.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{payment.reference || "-"}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{new Date(payment.createdAt).toLocaleDateString()}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{payment.notes || "-"}</span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No payments found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || methodFilter !== "all"
                      ? "No payments match your filters."
                      : "Start recording payments for your invoices."}
                  </p>
                  {!searchTerm && methodFilter === "all" && unpaidInvoices.length > 0 && (
                    <Button onClick={() => setIsAddPaymentOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Record Payment
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
