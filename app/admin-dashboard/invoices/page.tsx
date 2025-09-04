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
  FileText,
  Plus,
  Search,
  Trash2,
  ArrowLeft,
  Filter,
  DollarSign,
  Clock,
  XCircle,
  Printer,
  Send,
} from "lucide-react"
import {
  getInvoices,
  saveInvoice,
  updateInvoice,
  getCustomers,
  getProducts,
  updateProduct,
  getBusinessSettings,
} from "@/lib/business-store"
import type { Invoice, Customer, Product, InvoiceItem } from "@/lib/business-types"

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false)

  // Invoice form state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage")
  const [notes, setNotes] = useState("")
  const [dueDate, setDueDate] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const filtered = invoices.filter((invoice) => {
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerPhone.includes(searchTerm)

      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter

      return matchesSearch && matchesStatus
    })

    setFilteredInvoices(filtered)
  }, [invoices, searchTerm, statusFilter])

  const loadData = () => {
    setInvoices(getInvoices())
    setCustomers(getCustomers())
    setProducts(getProducts())
  }

  const addInvoiceItem = (product: Product) => {
    const existingItem = invoiceItems.find((item) => item.productId === product.id)

    if (existingItem) {
      setInvoiceItems(
        invoiceItems.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                totalAmount: (item.quantity + 1) * item.unitPrice,
                taxAmount: ((item.quantity + 1) * item.unitPrice * item.taxRate) / 100,
              }
            : item,
        ),
      )
    } else {
      const newItem: InvoiceItem = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        discount: 0,
        taxRate: product.taxRate,
        taxAmount: (product.price * product.taxRate) / 100,
        totalAmount: product.price,
      }
      setInvoiceItems([...invoiceItems, newItem])
    }
  }

  const updateInvoiceItem = (itemId: string, updates: Partial<InvoiceItem>) => {
    setInvoiceItems(
      invoiceItems.map((item) => {
        if (item.id === itemId) {
          const updated = { ...item, ...updates }
          const discountedPrice = updated.unitPrice - updated.discount
          updated.totalAmount = updated.quantity * discountedPrice
          updated.taxAmount = (updated.totalAmount * updated.taxRate) / 100
          return updated
        }
        return item
      }),
    )
  }

  const removeInvoiceItem = (itemId: string) => {
    setInvoiceItems(invoiceItems.filter((item) => item.id !== itemId))
  }

  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.totalAmount, 0)
    const discountAmount = discountType === "percentage" ? (subtotal * discount) / 100 : discount
    const taxableAmount = subtotal - discountAmount
    const taxAmount = invoiceItems.reduce((sum, item) => sum + item.taxAmount, 0)
    const total = taxableAmount + taxAmount

    return { subtotal, discountAmount, taxAmount, total }
  }

  const handleCreateInvoice = () => {
    if (!selectedCustomer || invoiceItems.length === 0) return

    const { subtotal, discountAmount, taxAmount, total } = calculateTotals()

    const newInvoice = {
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      customerEmail: selectedCustomer.email,
      customerAddress: selectedCustomer.address,
      items: invoiceItems,
      subtotal,
      discount,
      discountType,
      taxAmount,
      totalAmount: total,
      status: "draft" as const,
      paymentStatus: "pending" as const,
      paidAmount: 0,
      balanceDue: total,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      notes,
      createdBy: "admin",
    }

    saveInvoice(newInvoice)
    loadData()
    resetForm()
  }

  const resetForm = () => {
    setSelectedCustomer(null)
    setInvoiceItems([])
    setDiscount(0)
    setDiscountType("percentage")
    setNotes("")
    setDueDate("")
    setIsCreateDialogOpen(false)
  }

  const handleStatusUpdate = (invoiceId: string, status: Invoice["status"]) => {
    updateInvoice(invoiceId, { status })

    // If finalizing invoice, reduce stock
    if (status === "sent") {
      const invoice = invoices.find((inv) => inv.id === invoiceId)
      if (invoice) {
        invoice.items.forEach((item) => {
          const product = products.find((p) => p.id === item.productId)
          if (product) {
            updateProduct(product.id, { stock: Math.max(0, product.stock - item.quantity) })
          }
        })
      }
    }

    loadData()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "sent":
        return "secondary"
      case "overdue":
        return "destructive"
      case "cancelled":
        return "outline"
      default:
        return "outline"
    }
  }

  const totals = calculateTotals()
  const businessSettings = getBusinessSettings()

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
              <FileText className="mr-3 h-4 w-4" />
              Invoices
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Invoice Management</h1>
            <p className="text-muted-foreground">Create and manage invoices with automatic calculations</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{invoices.length}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹
                  {invoices
                    .filter((inv) => inv.paymentStatus === "paid")
                    .reduce((sum, inv) => sum + inv.totalAmount, 0)
                    .toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">From paid invoices</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{invoices.filter((inv) => inv.status === "sent").length}</div>
                <p className="text-xs text-muted-foreground">Awaiting payment</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹
                  {invoices
                    .filter((inv) => inv.paymentStatus !== "paid")
                    .reduce((sum, inv) => sum + inv.balanceDue, 0)
                    .toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Amount due</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search invoices by number, customer name, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Invoice</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Customer Selection */}
                  <div>
                    <Label>Customer *</Label>
                    <Select
                      value={selectedCustomer?.id || ""}
                      onValueChange={(value) => {
                        const customer = customers.find((c) => c.id === value)
                        setSelectedCustomer(customer || null)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} - {customer.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Product Selection */}
                  <div>
                    <Label>Add Products</Label>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                      {products
                        .filter((p) => p.isActive && p.stock > 0)
                        .map((product) => (
                          <Button
                            key={product.id}
                            variant="outline"
                            size="sm"
                            onClick={() => addInvoiceItem(product)}
                            className="justify-start"
                          >
                            <Plus className="mr-2 h-3 w-3" />
                            {product.name} - ₹{product.price}
                          </Button>
                        ))}
                    </div>
                  </div>

                  {/* Invoice Items */}
                  {invoiceItems.length > 0 && (
                    <div>
                      <Label>Invoice Items</Label>
                      <div className="border rounded-lg mt-2">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead>Qty</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Discount</TableHead>
                              <TableHead>Tax</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {invoiceItems.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.productName}</TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      updateInvoiceItem(item.id, { quantity: Number.parseInt(e.target.value) || 1 })
                                    }
                                    className="w-16"
                                    min="1"
                                  />
                                </TableCell>
                                <TableCell>₹{item.unitPrice}</TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    value={item.discount}
                                    onChange={(e) =>
                                      updateInvoiceItem(item.id, { discount: Number.parseFloat(e.target.value) || 0 })
                                    }
                                    className="w-20"
                                    min="0"
                                  />
                                </TableCell>
                                <TableCell>{item.taxRate}%</TableCell>
                                <TableCell>₹{item.totalAmount.toFixed(2)}</TableCell>
                                <TableCell>
                                  <Button variant="outline" size="sm" onClick={() => removeInvoiceItem(item.id)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {/* Invoice Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Discount</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={discount}
                          onChange={(e) => setDiscount(Number.parseFloat(e.target.value) || 0)}
                          placeholder="0"
                        />
                        <Select
                          value={discountType}
                          onValueChange={(value: "percentage" | "fixed") => setDiscountType(value)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">%</SelectItem>
                            <SelectItem value="fixed">₹</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Due Date</Label>
                      <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional notes..."
                    />
                  </div>

                  {/* Totals */}
                  {invoiceItems.length > 0 && (
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>₹{totals.subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between">
                            <span>Discount:</span>
                            <span>-₹{totals.discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>₹{totals.taxAmount.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span>₹{totals.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={handleCreateInvoice} disabled={!selectedCustomer || invoiceItems.length === 0}>
                      Create Invoice
                    </Button>
                    <Button variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoices ({filteredInvoices.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredInvoices.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-muted-foreground">{invoice.items.length} items</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{invoice.customerName}</p>
                            <p className="text-sm text-muted-foreground">{invoice.customerPhone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">₹{invoice.totalAmount.toLocaleString()}</p>
                            {invoice.balanceDue > 0 && (
                              <p className="text-sm text-muted-foreground">
                                Due: ₹{invoice.balanceDue.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{new Date(invoice.createdAt).toLocaleDateString()}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedInvoice(invoice)
                                setIsPrintDialogOpen(true)
                              }}
                            >
                              <Printer className="h-3 w-3" />
                            </Button>
                            {invoice.status === "draft" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(invoice.id, "sent")}
                              >
                                <Send className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No invoices found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== "all"
                      ? "No invoices match your filters."
                      : "Get started by creating your first invoice."}
                  </p>
                  {!searchTerm && statusFilter === "all" && (
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Invoice
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Print Dialog */}
          <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Invoice Preview</DialogTitle>
              </DialogHeader>
              {selectedInvoice && (
                <div className="space-y-6 p-6 bg-white text-black" id="invoice-print">
                  {/* Business Header */}
                  <div className="text-center border-b pb-4">
                    <h1 className="text-2xl font-bold">{businessSettings.businessName}</h1>
                    <p>{businessSettings.address}</p>
                    <p>
                      {businessSettings.phone} | {businessSettings.email}
                    </p>
                    {businessSettings.gstNumber && <p>GST: {businessSettings.gstNumber}</p>}
                  </div>

                  {/* Invoice Details */}
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold mb-2">Bill To:</h3>
                      <p className="font-medium">{selectedInvoice.customerName}</p>
                      <p>{selectedInvoice.customerPhone}</p>
                      {selectedInvoice.customerEmail && <p>{selectedInvoice.customerEmail}</p>}
                      {selectedInvoice.customerAddress && <p>{selectedInvoice.customerAddress}</p>}
                    </div>
                    <div className="text-right">
                      <h2 className="text-xl font-bold mb-2">INVOICE</h2>
                      <p>
                        <strong>Invoice #:</strong> {selectedInvoice.invoiceNumber}
                      </p>
                      <p>
                        <strong>Date:</strong> {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                      </p>
                      {selectedInvoice.dueDate && (
                        <p>
                          <strong>Due Date:</strong> {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Items Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Tax</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₹{item.unitPrice}</TableCell>
                          <TableCell>{item.taxRate}%</TableCell>
                          <TableCell>₹{item.totalAmount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Totals */}
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{selectedInvoice.subtotal.toFixed(2)}</span>
                      </div>
                      {selectedInvoice.discount > 0 && (
                        <div className="flex justify-between">
                          <span>Discount ({selectedInvoice.discountType === "percentage" ? "%" : "₹"}):</span>
                          <span>
                            -₹
                            {(selectedInvoice.discountType === "percentage"
                              ? (selectedInvoice.subtotal * selectedInvoice.discount) / 100
                              : selectedInvoice.discount
                            ).toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>₹{selectedInvoice.taxAmount.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>₹{selectedInvoice.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {selectedInvoice.notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Notes:</h4>
                      <p>{selectedInvoice.notes}</p>
                    </div>
                  )}

                  <div className="text-center text-sm text-gray-600 border-t pt-4">
                    <p>Thank you for your business!</p>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={() => window.print()}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Invoice
                </Button>
                <Button variant="outline" onClick={() => setIsPrintDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
