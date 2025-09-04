"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Receipt, CreditCard, Banknote, Smartphone, Printer, Search, DollarSign, CheckCircle } from "lucide-react"
import type { Order, Bill, Table, MenuItem } from "@/lib/types"
import { getOrders, getBills, saveBills, getTables, getMenuItems, generateId, calculateTax } from "@/lib/store"

export default function BillingPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])

  useEffect(() => {
    setOrders(getOrders())
    setBills(getBills())
    setTables(getTables())
    setMenuItems(getMenuItems())
  }, [])

  const getMenuItemById = (id: string) => {
    return menuItems.find((item) => item.id === id)
  }

  const getTableById = (id: string) => {
    return tables.find((table) => table.id === id)
  }

  const getBillByOrderId = (orderId: string) => {
    return bills.find((bill) => bill.orderId === orderId)
  }

  const generateBill = (order: Order, paymentMethod: "cash" | "card" | "upi") => {
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = calculateTax(subtotal)
    const total = subtotal + tax

    const billItems = order.items.map((item) => {
      const menuItem = getMenuItemById(item.menuItemId)
      return {
        name: menuItem?.name || "Unknown Item",
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      }
    })

    const newBill: Bill = {
      id: generateId(),
      orderId: order.id,
      tableId: order.tableId,
      items: billItems,
      subtotal,
      tax,
      total,
      paymentStatus: "paid",
      paymentMethod,
      createdAt: new Date(),
      paidAt: new Date(),
    }

    const updatedBills = [...bills, newBill]
    setBills(updatedBills)
    saveBills(updatedBills)

    return newBill
  }

  const printBill = (bill: Bill, order: Order) => {
    const table = getTableById(order.tableId)
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill - Kulhad Chai</title>
          <style>
            body { font-family: 'Courier New', monospace; max-width: 300px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
            .title { font-size: 18px; font-weight: bold; }
            .subtitle { font-size: 12px; margin-top: 5px; }
            .bill-info { margin-bottom: 15px; font-size: 12px; }
            .items { margin-bottom: 15px; }
            .item { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px; }
            .totals { border-top: 1px solid #000; padding-top: 10px; }
            .total-line { display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 12px; }
            .final-total { font-weight: bold; font-size: 14px; border-top: 1px solid #000; padding-top: 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; border-top: 1px solid #000; padding-top: 10px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">KULHAD CHAI</div>
            <div class="subtitle">Traditional Tea House</div>
          </div>
          
          <div class="bill-info">
            <div>Bill No: ${bill.id.slice(-8).toUpperCase()}</div>
            <div>Table: ${table?.number}</div>
            <div>Date: ${new Date(bill.createdAt).toLocaleString()}</div>
            <div>Customer: ${order.customerName}</div>
            <div>Phone: ${order.customerPhone}</div>
          </div>

          <div class="items">
            ${bill.items
              .map(
                (item) => `
              <div class="item">
                <span>${item.name} x${item.quantity}</span>
                <span>₹${item.total}</span>
              </div>
            `,
              )
              .join("")}
          </div>

          <div class="totals">
            <div class="total-line">
              <span>Subtotal:</span>
              <span>₹${bill.subtotal}</span>
            </div>
            <div class="total-line">
              <span>Tax (18%):</span>
              <span>₹${bill.tax}</span>
            </div>
            <div class="total-line final-total">
              <span>TOTAL:</span>
              <span>₹${bill.total}</span>
            </div>
            <div class="total-line">
              <span>Payment:</span>
              <span>${bill.paymentMethod?.toUpperCase()}</span>
            </div>
          </div>

          <div class="footer">
            <div>Thank you for visiting!</div>
            <div>Visit us again soon</div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  // Filter orders for billing
  const billableOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone?.includes(searchTerm) ||
      order.id.includes(searchTerm)

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "unbilled" && !getBillByOrderId(order.id)) ||
      (filterStatus === "billed" && getBillByOrderId(order.id))

    const matchesDate = new Date(order.createdAt).toDateString() === new Date(selectedDate).toDateString()

    return matchesSearch && matchesStatus && matchesDate
  })

  // Calculate daily totals
  const dailyBills = bills.filter((bill) => {
    return new Date(bill.createdAt).toDateString() === new Date(selectedDate).toDateString()
  })

  const dailyRevenue = dailyBills.reduce((sum, bill) => sum + bill.total, 0)
  const dailyOrders = dailyBills.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Billing System</h1>
          <p className="text-green-100">Generate bills and manage payments</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Daily Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Daily Revenue</p>
                  <p className="text-3xl font-bold text-green-800">₹{dailyRevenue}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Bills Generated</p>
                  <p className="text-3xl font-bold text-blue-800">{dailyOrders}</p>
                </div>
                <Receipt className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Avg Bill Value</p>
                  <p className="text-3xl font-bold text-orange-800">
                    ₹{dailyOrders > 0 ? Math.round(dailyRevenue / dailyOrders) : 0}
                  </p>
                </div>
                <Receipt className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Orders for Billing</CardTitle>
                <div className="flex gap-4 mt-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Orders</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search by customer, phone, or order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="unbilled">Unbilled</SelectItem>
                        <SelectItem value="billed">Billed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-40"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {billableOrders.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No orders found for the selected criteria</p>
                  ) : (
                    billableOrders.map((order) => {
                      const table = getTableById(order.tableId)
                      const existingBill = getBillByOrderId(order.id)
                      return (
                        <Card
                          key={order.id}
                          className={`cursor-pointer transition-colors ${
                            selectedOrder?.id === order.id
                              ? "border-green-500 bg-green-50"
                              : existingBill
                                ? "border-blue-200 bg-blue-50"
                                : "border-gray-200 hover:border-green-300"
                          }`}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold">
                                  Order #{order.id.slice(-6)} - Table {table?.number}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {order.customerName} • {order.customerPhone}
                                </p>
                                <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg">₹{order.totalAmount}</p>
                                {existingBill ? (
                                  <Badge variant="default" className="bg-blue-600">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Billed
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">Unbilled</Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              {order.items.length} items • Status: {order.status}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bill Generation */}
          <div className="lg:col-span-1">
            {selectedOrder ? (
              <BillGenerator
                order={selectedOrder}
                existingBill={getBillByOrderId(selectedOrder.id)}
                onGenerateBill={generateBill}
                onPrintBill={printBill}
                getMenuItemById={getMenuItemById}
                getTableById={getTableById}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Receipt className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select an Order</h3>
                  <p className="text-gray-600">Choose an order from the list to generate or view its bill</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function BillGenerator({
  order,
  existingBill,
  onGenerateBill,
  onPrintBill,
  getMenuItemById,
  getTableById,
}: {
  order: Order
  existingBill: Bill | undefined
  onGenerateBill: (order: Order, paymentMethod: "cash" | "card" | "upi") => Bill
  onPrintBill: (bill: Bill, order: Order) => void
  getMenuItemById: (id: string) => MenuItem | undefined
  getTableById: (id: string) => Table | undefined
}) {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "upi">("cash")

  const table = getTableById(order.tableId)
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = calculateTax(subtotal)
  const total = subtotal + tax

  const handleGenerateBill = () => {
    const bill = onGenerateBill(order, paymentMethod)
    onPrintBill(bill, order)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          {existingBill ? "Bill Details" : "Generate Bill"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Info */}
        <div className="space-y-2">
          <h4 className="font-semibold">Order Information</h4>
          <div className="text-sm space-y-1">
            <p>Order ID: #{order.id.slice(-6)}</p>
            <p>Table: {table?.number}</p>
            <p>Customer: {order.customerName}</p>
            <p>Phone: {order.customerPhone}</p>
            <p>Date: {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <Separator />

        {/* Items */}
        <div className="space-y-2">
          <h4 className="font-semibold">Items</h4>
          <div className="space-y-2">
            {order.items.map((item, index) => {
              const menuItem = getMenuItemById(item.menuItemId)
              return (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {menuItem?.name} × {item.quantity}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (18%):</span>
            <span>₹{tax}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>₹{total}</span>
          </div>
        </div>

        {existingBill ? (
          <div className="space-y-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Bill Generated</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Payment: {existingBill.paymentMethod?.toUpperCase()} • Paid on{" "}
                {existingBill.paidAt ? new Date(existingBill.paidAt).toLocaleString() : "N/A"}
              </p>
            </div>
            <Button
              onClick={() => onPrintBill(existingBill, order)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Bill
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="payment">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4" />
                      Cash
                    </div>
                  </SelectItem>
                  <SelectItem value="card">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Card
                    </div>
                  </SelectItem>
                  <SelectItem value="upi">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      UPI
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerateBill}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={order.status !== "completed" && order.status !== "served"}
            >
              <Receipt className="w-4 h-4 mr-2" />
              Generate & Print Bill
            </Button>

            {order.status !== "completed" && order.status !== "served" && (
              <p className="text-xs text-amber-600 text-center">Order must be completed or served to generate bill</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
