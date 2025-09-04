"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Receipt,
  Printer,
  Save,
  Calculator,
  User,
  Phone,
  MapPin,
  Coffee,
  Percent,
  DollarSign
} from "lucide-react"
import { getMenuItems, saveBills, generateId, calculateTax } from "@/lib/store"
import type { MenuItem, Bill, BillItem } from "@/lib/types"

interface CustomBillItem {
  id: string
  name: string
  quantity: number
  price: number
  total: number
}

interface CustomBill {
  id: string
  customerName: string
  customerPhone: string
  customerAddress: string
  items: CustomBillItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  discountType: 'percentage' | 'fixed'
  discountValue: number
  discountAmount: number
  total: number
  notes: string
  createdAt: Date
}

export default function CustomBillsPage() {
  const router = useRouter()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [bills, setBills] = useState<CustomBill[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedBill, setSelectedBill] = useState<CustomBill | null>(null)
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false)

  // Form state
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [billItems, setBillItems] = useState<CustomBillItem[]>([])
  const [taxRate, setTaxRate] = useState(5)
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountValue, setDiscountValue] = useState(0)
  const [notes, setNotes] = useState('')

  // Item form state
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)
  const [itemQuantity, setItemQuantity] = useState(1)
  const [customItemName, setCustomItemName] = useState('')
  const [customItemPrice, setCustomItemPrice] = useState(0)
  const [isCustomItem, setIsCustomItem] = useState(false)

  useEffect(() => {
    setMenuItems(getMenuItems())
    loadBills()
  }, [])

  const loadBills = () => {
    const savedBills = JSON.parse(localStorage.getItem('custom_bills') || '[]')
    setBills(savedBills)
  }

  const calculateBillTotals = () => {
    const subtotal = billItems.reduce((sum, item) => sum + item.total, 0)
    const taxAmount = (subtotal * taxRate) / 100
    const discountAmount = discountType === 'percentage' 
      ? (subtotal * discountValue) / 100 
      : discountValue
    const total = subtotal + taxAmount - discountAmount
    
    return { subtotal, taxAmount, discountAmount, total }
  }

  const addItemToBill = () => {
    if (isCustomItem) {
      if (!customItemName || customItemPrice <= 0) return
      
      const newItem: CustomBillItem = {
        id: generateId(),
        name: customItemName,
        quantity: itemQuantity,
        price: customItemPrice,
        total: customItemPrice * itemQuantity
      }
      
      setBillItems([...billItems, newItem])
      setCustomItemName('')
      setCustomItemPrice(0)
    } else {
      if (!selectedMenuItem) return
      
      const newItem: CustomBillItem = {
        id: generateId(),
        name: selectedMenuItem.name,
        quantity: itemQuantity,
        price: selectedMenuItem.price,
        total: selectedMenuItem.price * itemQuantity
      }
      
      setBillItems([...billItems, newItem])
      setSelectedMenuItem(null)
    }
    
    setItemQuantity(1)
    setIsCustomItem(false)
  }

  const removeItemFromBill = (itemId: string) => {
    setBillItems(billItems.filter(item => item.id !== itemId))
  }

  const saveBill = () => {
    if (!customerName || billItems.length === 0) return
    
    const { subtotal, taxAmount, discountAmount, total } = calculateBillTotals()
    
    const newBill: CustomBill = {
      id: generateId(),
      customerName,
      customerPhone,
      customerAddress,
      items: billItems,
      subtotal,
      taxRate,
      taxAmount,
      discountType,
      discountValue,
      discountAmount,
      total,
      notes,
      createdAt: new Date()
    }
    
    const updatedBills = [...bills, newBill]
    setBills(updatedBills)
    localStorage.setItem('custom_bills', JSON.stringify(updatedBills))
    
    // Reset form
    resetForm()
    setIsCreateDialogOpen(false)
  }

  const resetForm = () => {
    setCustomerName('')
    setCustomerPhone('')
    setCustomerAddress('')
    setBillItems([])
    setTaxRate(5)
    setDiscountType('percentage')
    setDiscountValue(0)
    setNotes('')
    setSelectedMenuItem(null)
    setItemQuantity(1)
    setCustomItemName('')
    setCustomItemPrice(0)
    setIsCustomItem(false)
  }

  const printBill = (bill: CustomBill) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const billHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Custom Bill - ${bill.id}</title>
          <style>
            body { font-family: 'Courier New', monospace; max-width: 400px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
            .shop-name { font-size: 20px; font-weight: bold; margin-bottom: 8px; }
            .shop-details { font-size: 12px; line-height: 1.4; }
            .bill-info { margin: 20px 0; }
            .customer-info { margin: 15px 0; border: 1px solid #000; padding: 10px; }
            .items { margin: 20px 0; }
            .item { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
            .item-header { font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px; }
            .totals { border-top: 2px solid #000; padding-top: 15px; margin-top: 20px; }
            .total-line { display: flex; justify-content: space-between; margin: 5px 0; }
            .final-total { font-weight: bold; font-size: 16px; border-top: 1px solid #000; padding-top: 8px; margin-top: 8px; }
            .footer { text-align: center; margin-top: 25px; font-size: 12px; border-top: 1px solid #000; padding-top: 15px; }
            .notes { margin: 15px 0; padding: 10px; border: 1px dashed #000; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="shop-name">☕ Kulhad Chai Corner</div>
            <div class="shop-details">
              📍 123 Chai Street, Food Court<br>
              📞 +91 98765 43210<br>
              🌐 www.kulhadchai.com<br>
              GST: 27AAAAA0000A1Z5
            </div>
          </div>
          
          <div class="bill-info">
            <div><strong>Bill ID:</strong> ${bill.id}</div>
            <div><strong>Date:</strong> ${new Date(bill.createdAt).toLocaleString()}</div>
            <div><strong>Type:</strong> Custom Bill</div>
          </div>
          
          <div class="customer-info">
            <div class="item-header">CUSTOMER DETAILS</div>
            <div><strong>Name:</strong> ${bill.customerName}</div>
            ${bill.customerPhone ? `<div><strong>Phone:</strong> ${bill.customerPhone}</div>` : ''}
            ${bill.customerAddress ? `<div><strong>Address:</strong> ${bill.customerAddress}</div>` : ''}
          </div>
          
          <div class="items">
            <div class="item-header">ITEMS</div>
            ${bill.items.map(item => `
              <div class="item">
                <span>${item.name} x${item.quantity} @ ₹${item.price.toFixed(2)}</span>
                <span>₹${item.total.toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="totals">
            <div class="total-line">
              <span>Subtotal:</span>
              <span>₹${bill.subtotal.toFixed(2)}</span>
            </div>
            ${bill.discountAmount > 0 ? `
              <div class="total-line">
                <span>Discount (${bill.discountType === 'percentage' ? bill.discountValue + '%' : '₹' + bill.discountValue}):</span>
                <span>-₹${bill.discountAmount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="total-line">
              <span>Tax (${bill.taxRate}%):</span>
              <span>₹${bill.taxAmount.toFixed(2)}</span>
            </div>
            <div class="total-line final-total">
              <span>TOTAL AMOUNT:</span>
              <span>₹${bill.total.toFixed(2)}</span>
            </div>
          </div>
          
          ${bill.notes ? `
            <div class="notes">
              <strong>Notes:</strong><br>
              ${bill.notes}
            </div>
          ` : ''}
          
          <div class="footer">
            <div>Thank you for your business!</div>
            <div>🙏 Please visit again 🙏</div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(billHTML)
    printWindow.document.close()
    printWindow.print()
  }

  const { subtotal, taxAmount, discountAmount, total } = calculateBillTotals()

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-sidebar text-sidebar-foreground min-h-screen">
          <div className="p-6">
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-sm text-sidebar-foreground/70">Kulhad Chai Management</p>
          </div>

          <nav className="px-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => router.push('/admin-dashboard')}
            >
              <ArrowLeft className="mr-3 h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent bg-sidebar-accent"
            >
              <Receipt className="mr-3 h-4 w-4" />
              Custom Bills
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Custom Bills</h1>
                <p className="text-gray-600 mt-2">Create and manage custom bills with items, tax, and discounts</p>
              </div>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Custom Bill
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-amber-600" />
                      Create Custom Bill
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Customer & Items */}
                    <div className="space-y-6">
                      {/* Customer Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="w-5 h-5 text-amber-600" />
                            Customer Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor="customerName">Customer Name *</Label>
                            <Input
                              id="customerName"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Enter customer name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="customerPhone">Phone Number</Label>
                            <Input
                              id="customerPhone"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              placeholder="Enter phone number"
                            />
                          </div>
                          <div>
                            <Label htmlFor="customerAddress">Address</Label>
                            <Textarea
                              id="customerAddress"
                              value={customerAddress}
                              onChange={(e) => setCustomerAddress(e.target.value)}
                              placeholder="Enter customer address"
                              rows={2}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Add Items */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Plus className="w-5 h-5 text-amber-600" />
                            Add Items
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="customItem"
                              checked={isCustomItem}
                              onChange={(e) => setIsCustomItem(e.target.checked)}
                            />
                            <Label htmlFor="customItem">Add custom item</Label>
                          </div>
                          
                          {isCustomItem ? (
                            <div className="space-y-3">
                              <div>
                                <Label>Item Name</Label>
                                <Input
                                  value={customItemName}
                                  onChange={(e) => setCustomItemName(e.target.value)}
                                  placeholder="Enter item name"
                                />
                              </div>
                              <div>
                                <Label>Price (₹)</Label>
                                <Input
                                  type="number"
                                  value={customItemPrice}
                                  onChange={(e) => setCustomItemPrice(Number(e.target.value))}
                                  placeholder="Enter price"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            </div>
                          ) : (
                            <div>
                              <Label>Select Menu Item</Label>
                              <Select onValueChange={(value) => {
                                const item = menuItems.find(item => item.id === value)
                                setSelectedMenuItem(item || null)
                              }}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose from menu" />
                                </SelectTrigger>
                                <SelectContent>
                                  {menuItems.map((item) => (
                                    <SelectItem key={item.id} value={item.id}>
                                      {item.name} - ₹{item.price.toFixed(2)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          
                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              value={itemQuantity}
                              onChange={(e) => setItemQuantity(Number(e.target.value))}
                              min="1"
                            />
                          </div>
                          
                          <Button
                            onClick={addItemToBill}
                            disabled={isCustomItem ? !customItemName || customItemPrice <= 0 : !selectedMenuItem}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Item
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right Column - Bill Preview & Settings */}
                    <div className="space-y-6">
                      {/* Bill Items */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Receipt className="w-5 h-5 text-amber-600" />
                            Bill Items ({billItems.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {billItems.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No items added yet</p>
                          ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {billItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                                  <div className="flex-1">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-600">
                                      ₹{item.price.toFixed(2)} × {item.quantity}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">₹{item.total.toFixed(2)}</span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => removeItemFromBill(item.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Tax & Discount Settings */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Calculator className="w-5 h-5 text-amber-600" />
                            Tax & Discount
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label>Tax Rate (%)</Label>
                            <Input
                              type="number"
                              value={taxRate}
                              onChange={(e) => setTaxRate(Number(e.target.value))}
                              min="0"
                              max="100"
                              step="0.1"
                            />
                          </div>
                          
                          <div>
                            <Label>Discount Type</Label>
                            <Select value={discountType} onValueChange={(value: 'percentage' | 'fixed') => setDiscountType(value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>Discount Value</Label>
                            <Input
                              type="number"
                              value={discountValue}
                              onChange={(e) => setDiscountValue(Number(e.target.value))}
                              min="0"
                              step="0.01"
                              placeholder={discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Bill Summary */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <DollarSign className="w-5 h-5 text-amber-600" />
                            Bill Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                          </div>
                          {discountAmount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount:</span>
                              <span>-₹{discountAmount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Tax ({taxRate}%):</span>
                            <span>₹{taxAmount.toFixed(2)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span>₹{total.toFixed(2)}</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Notes */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any notes or special instructions..."
                            rows={3}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={saveBill}
                      disabled={!customerName || billItems.length === 0}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Bill
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Bills List */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Bills History</CardTitle>
              </CardHeader>
              <CardContent>
                {bills.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No custom bills yet</h3>
                    <p className="text-gray-500 mb-4">Create your first custom bill to get started</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bill ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bills.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell className="font-mono text-sm">{bill.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{bill.customerName}</p>
                              {bill.customerPhone && (
                                <p className="text-sm text-gray-600">{bill.customerPhone}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{bill.items.length} items</Badge>
                          </TableCell>
                          <TableCell className="font-semibold">₹{bill.total.toFixed(2)}</TableCell>
                          <TableCell>{new Date(bill.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => printBill(bill)}
                              >
                                <Printer className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}