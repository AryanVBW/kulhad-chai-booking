"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Printer, Receipt, Clock, User, Phone, MapPin, Coffee } from "lucide-react"
import type { MenuItem, OrderItem, Bill, BillItem } from "@/lib/types"
import { getMenuItems, saveBills, generateId, calculateTax } from "@/lib/store"

export default function CheckoutPage() {
  const router = useRouter()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<OrderItem[]>([])
  const [tableNumber, setTableNumber] = useState<string>("")
  const [customerName, setCustomerName] = useState<string>("")
  const [customerPhone, setCustomerPhone] = useState<string>("")
  const [isGeneratingBill, setIsGeneratingBill] = useState(false)
  const [billGenerated, setBillGenerated] = useState(false)
  const [generatedBill, setGeneratedBill] = useState<Bill | null>(null)
  const [shopSettings, setShopSettings] = useState({
    name: "Kulhad Chai Restaurant",
    address: "123 Main Street, City, State 12345",
    phone: "+1 (555) 123-4567",
    email: "info@kulhadchai.com",
    gst: "GST123456789",
    currency: "₹",
    taxRate: 18,
    serviceCharge: 10,
    footerText: "Thank you for visiting! Come again soon."
  })

  useEffect(() => {
    setMenuItems(getMenuItems())

    // Get data from URL params and localStorage
    const params = new URLSearchParams(window.location.search)
    setTableNumber(params.get("table") || "1")

    // Get cart from localStorage
    const savedCart = localStorage.getItem("current_cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }

    // Get shop settings from localStorage
    const settings = localStorage.getItem('shop-settings')
    if (settings) {
      setShopSettings(JSON.parse(settings))
    }
  }, [])

  const getMenuItemById = (id: string) => {
    return menuItems.find((item) => item.id === id)
  }

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const subtotal = getSubtotal()
  const tax = subtotal * (shopSettings.taxRate / 100)
  const total = subtotal + tax

  const handleGenerateBill = async () => {
    setIsGeneratingBill(true)

    try {
      const billItems: BillItem[] = cart.map(item => {
        const menuItem = getMenuItemById(item.menuItemId)
        return {
          name: menuItem?.name || 'Unknown Item',
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        }
      })

      const newBill: Bill = {
        id: generateId(),
        orderId: generateId(),
        tableId: `table-${tableNumber}`,
        items: billItems,
        subtotal,
        tax,
        total,
        paymentStatus: 'paid',
        createdAt: new Date()
      }

      // Save bill
      const existingBills = JSON.parse(localStorage.getItem('bills') || '[]')
      existingBills.push(newBill)
      localStorage.setItem('bills', JSON.stringify(existingBills))
      saveBills(existingBills)

      setGeneratedBill(newBill)
      setBillGenerated(true)
      
      // Clear cart
      localStorage.removeItem('current_cart')
      
    } catch (error) {
      console.error('Error generating bill:', error)
    } finally {
      setIsGeneratingBill(false)
    }
  }

  const handlePrintBill = () => {
    if (!generatedBill) return
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const billHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill - ${generatedBill.id}</title>
          <style>
            body { font-family: 'Courier New', monospace; max-width: 300px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
            .shop-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .shop-details { font-size: 12px; line-height: 1.4; }
            .bill-info { margin: 15px 0; }
            .items { margin: 15px 0; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; font-size: 14px; }
            .totals { border-top: 1px solid #000; padding-top: 10px; margin-top: 15px; }
            .total-line { display: flex; justify-content: space-between; margin: 3px 0; }
            .final-total { font-weight: bold; border-top: 1px solid #000; padding-top: 5px; margin-top: 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; border-top: 1px solid #000; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="shop-name">☕ ${shopSettings.name}</div>
            <div class="shop-details">
              📍 ${shopSettings.address}<br>
              📞 ${shopSettings.phone}<br>
              ${shopSettings.email ? `🌐 ${shopSettings.email}` : ''}
            </div>
          </div>
          
          <div class="bill-info">
            <div><strong>Bill ID:</strong> ${generatedBill.id}</div>
            <div><strong>Table:</strong> ${tableNumber}</div>
            <div><strong>Date:</strong> ${new Date(generatedBill.createdAt).toLocaleString()}</div>
            ${customerName ? `<div><strong>Customer:</strong> ${customerName}</div>` : ''}
             ${customerPhone ? `<div><strong>Phone:</strong> ${customerPhone}</div>` : ''}
          </div>
          
          <div class="items">
            <div style="border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px;">
              <strong>ITEMS ORDERED</strong>
            </div>
            ${generatedBill.items.map(item => `
              <div class="item">
                <span>${item.name} x${item.quantity}</span>
                <span>${shopSettings.currency}${item.total.toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="totals">
            <div class="total-line">
              <span>Subtotal:</span>
              <span>${shopSettings.currency}${generatedBill.subtotal.toFixed(2)}</span>
            </div>
            <div class="total-line">
              <span>Tax (${shopSettings.taxRate}%):</span>
              <span>${shopSettings.currency}${generatedBill.tax.toFixed(2)}</span>
            </div>
            <div class="total-line final-total">
              <span>TOTAL:</span>
              <span>${shopSettings.currency}${generatedBill.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="footer">
            <div>${shopSettings.footerText}</div>
            <div>🙏 Please visit again 🙏</div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(billHTML)
    printWindow.document.close()
    printWindow.print()
  }

  if (billGenerated && generatedBill) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-amber-700 hover:text-amber-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Menu</span>
            </button>
            <div className="flex items-center gap-2 text-amber-800">
              <Receipt className="w-5 h-5" />
              <span className="font-semibold">Bill Generated</span>
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-green-100 border border-green-300 rounded-xl p-6 mb-6 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-green-800 mb-2">Bill Generated Successfully!</h2>
            <p className="text-green-700">Your order has been processed and bill is ready.</p>
          </div>

          {/* Bill Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="text-center border-b pb-4 mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coffee className="w-6 h-6 text-amber-600" />
                <h3 className="text-lg font-bold text-gray-800">{shopSettings.name}</h3>
              </div>
              <p className="text-sm text-gray-600">{shopSettings.address}</p>
              <p className="text-sm text-gray-600">{shopSettings.phone}</p>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Bill ID:</span>
                <span className="font-mono">{generatedBill.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Table:</span>
                <span>{tableNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span>{new Date(generatedBill.createdAt).toLocaleString()}</span>
              </div>
              {customerName && (
                 <div className="flex justify-between">
                   <span className="text-gray-600">Customer:</span>
                   <span>{customerName}</span>
                 </div>
               )}
            </div>

            <div className="border-t pt-4 mb-4">
              <h4 className="font-semibold mb-3">Items Ordered</h4>
              <div className="space-y-2">
                {generatedBill.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{shopSettings.currency}{item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{shopSettings.currency}{generatedBill.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
              <span>Tax ({shopSettings.taxRate}%):</span>
              <span>{shopSettings.currency}{generatedBill.tax.toFixed(2)}</span>
            </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{shopSettings.currency}{generatedBill.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handlePrintBill}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Printer className="w-5 h-5" />
              Print Bill
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-4 px-6 rounded-xl transition-colors"
            >
              New Order
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-amber-700 hover:text-amber-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Menu</span>
          </button>
          <div className="flex items-center gap-2 text-amber-800">
            <Receipt className="w-5 h-5" />
            <span className="font-semibold">Checkout</span>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-600" />
            Customer Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name (Optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-600" />
            Order Summary - Table {tableNumber}
          </h3>
          
          <div className="space-y-3 mb-4">
            {cart.map((item, index) => {
               const menuItem = getMenuItemById(item.menuItemId)
              return (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{menuItem?.name || 'Unknown Item'}</h4>
                    <p className="text-sm text-gray-600">{shopSettings.currency}{item.price.toFixed(2)} × {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">{shopSettings.currency}{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="border-t pt-4">
            <div className="text-center text-gray-600">
              <p>Review your order above</p>
            </div>
          </div>
        </div>

        {/* Generate Bill Button */}
        <button
          onClick={handleGenerateBill}
          disabled={isGeneratingBill || cart.length === 0}
          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:cursor-not-allowed"
        >
          {isGeneratingBill ? (
            <>
              <Clock className="w-5 h-5 animate-spin" />
              Generating Bill...
            </>
          ) : (
            <>
              <Receipt className="w-5 h-5" />
            Confirm Order
            </>
          )}
        </button>

        {cart.length === 0 && (
          <p className="text-center text-gray-500 mt-4 text-sm">
            Your cart is empty. Add items from the menu to proceed.
          </p>
        )}
      </div>
    </div>
  )
}
