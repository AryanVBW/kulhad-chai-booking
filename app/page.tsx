"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, ShoppingCart, Clock } from "lucide-react"
import type { MenuItem, OrderItem } from "@/lib/types"
import { getMenuItems, saveMenuItems } from "@/lib/store"
import { completeMenuItems, menuCategories } from "@/lib/menu-data"

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<OrderItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("chai")
  const [tableNumber, setTableNumber] = useState<string>("")

  useEffect(() => {
    const storedItems = getMenuItems()
    if (storedItems.length === 0) {
      saveMenuItems(completeMenuItems)
      setMenuItems(completeMenuItems)
    } else {
      setMenuItems(storedItems)
    }
    // Get table number from URL params
    const params = new URLSearchParams(window.location.search)
    setTableNumber(params.get("table") || "1")
  }, [])

  const categories = menuCategories

  const filteredItems = menuItems.filter((item) => item.category === selectedCategory && item.available)

  const addToCart = (menuItem: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menuItemId === menuItem.id)
      if (existing) {
        return prev.map((item) => (item.menuItemId === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { menuItemId: menuItem.id, quantity: 1, price: menuItem.price }]
    })
  }

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menuItemId === menuItemId)
      if (existing && existing.quantity > 1) {
        return prev.map((item) => (item.menuItemId === menuItemId ? { ...item, quantity: item.quantity - 1 } : item))
      }
      return prev.filter((item) => item.menuItemId !== menuItemId)
    })
  }

  const getCartItemQuantity = (menuItemId: string) => {
    return cart.find((item) => item.menuItemId === menuItemId)?.quantity || 0
  }

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-orange-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg sm:text-xl">☕</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Kulhad Chai
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Authentic Taste, Modern Experience</p>
              </div>
              {tableNumber && (
                <span className="ml-2 sm:ml-4 px-2 sm:px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full text-xs sm:text-sm font-medium shadow-md">
                  Table {tableNumber}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-1 sm:space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-medium">Open 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 pb-24">
        {/* Category Tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="flex space-x-2 sm:space-x-3 overflow-x-auto pb-3 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`flex items-center space-x-2 px-4 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${
                selectedCategory === "all"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-200"
                  : "bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-orange-100"
              }`}
            >
              <span className="text-lg">🍽️</span>
              <span className="font-semibold text-sm sm:text-base">All Items</span>
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${
                  selectedCategory === category.id
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                    : "bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-orange-100"
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                <span className="font-semibold text-sm sm:text-base">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {(selectedCategory === "all" ? menuItems : filteredItems).map((item) => {
            const quantity = getCartItemQuantity(item.id)
            const categoryInfo = categories.find(cat => cat.id === item.category)

            return (
              <div key={item.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
                <div className="flex flex-col h-full">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${categoryInfo?.color || 'from-gray-400 to-gray-500'} text-white shadow-sm`}>
                      <span className="mr-1">{categoryInfo?.icon || '🍽️'}</span>
                      {categoryInfo?.name || 'Item'}
                    </span>
                    {item.isCombo && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm animate-pulse">
                        🎉 COMBO
                      </span>
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-orange-600 transition-colors">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                    
                    {/* Combo Items */}
                    {item.isCombo && item.comboItems && (
                      <div className="mb-3 p-2 bg-orange-50 rounded-lg">
                        <p className="text-xs font-semibold text-orange-700 mb-1">Includes:</p>
                        <ul className="text-xs text-orange-600 space-y-1">
                          {item.comboItems.slice(0, 3).map((comboItem, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-1 h-1 bg-orange-400 rounded-full mr-2"></span>
                              {comboItem}
                            </li>
                          ))}
                          {item.comboItems.length > 3 && (
                            <li className="text-orange-500 font-medium">+{item.comboItems.length - 3} more items</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Price and Time */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">₹{item.price}</span>
                      {item.isCombo && (
                        <span className="text-xs text-green-600 font-medium">💰 Great Value!</span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{item.preparationTime} min</span>
                    </div>
                  </div>

                  {/* Add to Cart Controls */}
                  <div className="flex items-center justify-center">
                    {quantity > 0 ? (
                      <div className="flex items-center space-x-3 bg-orange-50 rounded-full px-4 py-2">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white flex items-center justify-center hover:shadow-lg transition-all duration-200 transform hover:scale-110"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-bold text-gray-900 text-lg min-w-[24px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center hover:shadow-lg transition-all duration-200 transform hover:scale-110"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 group-hover:from-orange-600 group-hover:to-amber-600"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add to Cart</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Cart Footer */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-orange-200 p-4 shadow-2xl z-40">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <ShoppingCart className="h-6 w-6 text-orange-600" />
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {getTotalItems()}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-gray-900 text-lg">
                    {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''}
                  </span>
                  <p className="text-sm text-gray-600">in your cart</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">₹{getTotalAmount()}</div>
                <p className="text-xs text-gray-500">Total Amount</p>
              </div>
            </div>
            <button 
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:from-orange-600 hover:to-amber-600 flex items-center justify-center space-x-2"
              onClick={() => {
                // Navigate to checkout
                window.location.href = `/checkout?table=${tableNumber}`
              }}
            >
              <span>Proceed to Checkout</span>
              <span className="text-xl">🚀</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
