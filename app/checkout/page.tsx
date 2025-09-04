"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Printer, Receipt, Clock, User, Phone, MapPin, Coffee, CheckCircle, Heart } from "lucide-react"
import type { MenuItem, OrderItem, Order } from "@/lib/types"
import { menuItemsService, ordersService } from "@/lib/database"
import { Navbar } from "@/components/navbar"

export default function CheckoutPage() {
  const router = useRouter()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<OrderItem[]>([])
  const [tableNumber, setTableNumber] = useState<string>("")
  const [customerName, setCustomerName] = useState<string>("")
  const [customerPhone, setCustomerPhone] = useState<string>("")
  const [isProcessingOrder, setIsProcessingOrder] = useState(false)
  const [orderCompleted, setOrderCompleted] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null)
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
    const loadData = async () => {
      try {
        // Load menu items from Supabase
        const items = await menuItemsService.getAll()
        setMenuItems(items)
      } catch (error) {
        console.error('Error loading menu items:', error)
      }
    }
    
    loadData()

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

  const handleCompleteOrder = async () => {
    setIsProcessingOrder(true)

    try {
      const orderData = {
        tableId: `table-${tableNumber}`,
        status: 'pending' as const,
        totalAmount: total,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        items: cart
      }

      // Create order in Supabase
      const newOrder = await ordersService.create(orderData)
      
      setCompletedOrder(newOrder)
      setOrderCompleted(true)
      
      // Clear cart
      localStorage.removeItem('current_cart')
      
    } catch (error) {
      console.error('Error processing order:', error)
      // You could add toast notification here for error feedback
    } finally {
      setIsProcessingOrder(false)
    }
  }

  // Removed print functionality as bills are now handled by admin

  if (orderCompleted && completedOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <Navbar showCart={false} />
        <div className="max-w-md mx-auto p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-green-700 hover:text-green-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Menu</span>
            </button>
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Order Placed</span>
            </div>
          </div>

          {/* Thank You Message */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-4">Thank You!</h2>
            <p className="text-green-700 mb-4">Your order has been placed successfully and sent to our kitchen.</p>
            
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coffee className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">Order Details</span>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Order ID:</strong> {completedOrder.id}</p>
                <p><strong>Table:</strong> {tableNumber}</p>
                {customerName && <p><strong>Customer:</strong> {customerName}</p>}
                <p><strong>Total Amount:</strong> {shopSettings.currency}{completedOrder.totalAmount.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-amber-600 mb-4">
              <Heart className="w-5 h-5" />
              <span className="text-sm font-medium">We're preparing your order with love!</span>
            </div>
            
            <p className="text-sm text-gray-600">
              Our team will notify you when your order is ready. Please stay at your table.
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            <Coffee className="w-5 h-5" />
            Order More Items
          </button>
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              {shopSettings.footerText}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <Navbar showCart={false} />
      <div className="max-w-md mx-auto p-4">
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
          {/* Logo in receipt */}
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Kulhad Chai Restaurant"
              width={60}
              height={60}
              className="opacity-80"
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 justify-center">
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

          {cart.length === 0 ? (
            <div className="border-t pt-4">
              <div className="text-center text-gray-600">
                <p>Your cart is empty. Add items from the menu to proceed.</p>
              </div>
            </div>
          ) : (
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{shopSettings.currency}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax ({shopSettings.taxRate}%):</span>
                <span>{shopSettings.currency}{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{shopSettings.currency}{total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Complete Order Button */}
        <button
          onClick={handleCompleteOrder}
          disabled={isProcessingOrder || cart.length === 0}
          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:cursor-not-allowed"
        >
          {isProcessingOrder ? (
            <>
              <Clock className="w-5 h-5 animate-spin" />
              Processing Order...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Place Order
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
