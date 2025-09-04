"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  QrCode,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
} from "lucide-react"
import type { Order, Table, MenuItem } from "@/lib/types"
import { getOrders, saveOrders, getTables, saveTables, getMenuItems, saveMenuItems, generateId } from "@/lib/store"

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<string>("overview")
  const [orders, setOrders] = useState<Order[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null)
  const [isAddingItem, setIsAddingItem] = useState(false)

  useEffect(() => {
    setOrders(getOrders())
    setTables(getTables())
    setMenuItems(getMenuItems())
  }, [])

  const menuNavItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "tables", label: "Tables", icon: Users },
    { id: "qr-codes", label: "QR Codes", icon: QrCode },
    { id: "menu", label: "Menu", icon: Menu },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date() } : order,
    )
    setOrders(updatedOrders)
    saveOrders(updatedOrders)
  }

  const updateTableStatus = (tableId: string, newStatus: Table["status"]) => {
    const updatedTables = tables.map((table) => (table.id === tableId ? { ...table, status: newStatus } : table))
    setTables(updatedTables)
    saveTables(updatedTables)
  }

  const getMenuItemById = (id: string) => {
    return menuItems.find((item) => item.id === id)
  }

  const getTableById = (id: string) => {
    return tables.find((table) => table.id === id)
  }

  const saveMenuItem = (item: MenuItem) => {
    let updatedItems
    if (editingMenuItem) {
      updatedItems = menuItems.map((existing) => (existing.id === item.id ? item : existing))
    } else {
      updatedItems = [...menuItems, { ...item, id: generateId() }]
    }
    setMenuItems(updatedItems)
    saveMenuItems(updatedItems)
    setEditingMenuItem(null)
    setIsAddingItem(false)
  }

  const deleteMenuItem = (itemId: string) => {
    const updatedItems = menuItems.filter((item) => item.id !== itemId)
    setMenuItems(updatedItems)
    saveMenuItems(updatedItems)
  }

  // Calculate stats
  const todayOrders = orders.filter((order) => {
    const today = new Date()
    const orderDate = new Date(order.createdAt)
    return orderDate.toDateString() === today.toDateString()
  })

  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0)
  const activeTables = tables.filter((table) => table.status === "occupied").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-gray-800 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Restaurant Admin</h1>
          <p className="text-slate-300">Kulhad Chai Management Dashboard</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {menuNavItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Button
                        key={item.id}
                        variant={activeSection === item.id ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          activeSection === item.id ? "bg-slate-800 text-white" : "text-slate-700 hover:bg-slate-100"
                        }`}
                        onClick={() => setActiveSection(item.id)}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        {item.label}
                      </Button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeSection === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 font-medium">Today's Orders</p>
                          <p className="text-3xl font-bold text-blue-800">{todayOrders.length}</p>
                        </div>
                        <ShoppingCart className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 font-medium">Revenue</p>
                          <p className="text-3xl font-bold text-green-800">₹{todayRevenue}</p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-orange-600 font-medium">Active Tables</p>
                          <p className="text-3xl font-bold text-orange-800">
                            {activeTables}/{tables.length}
                          </p>
                        </div>
                        <Users className="w-8 h-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Button
                        onClick={() => (window.location.href = "/qr-codes")}
                        className="bg-orange-600 hover:bg-orange-700 text-white h-16"
                      >
                        <QrCode className="w-6 h-6 mr-3" />
                        Manage QR Codes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActiveSection("orders")}
                        className="border-slate-300 text-slate-700 hover:bg-slate-50 h-16"
                      >
                        <ShoppingCart className="w-6 h-6 mr-3" />
                        View Orders
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActiveSection("tables")}
                        className="border-slate-300 text-slate-700 hover:bg-slate-50 h-16"
                      >
                        <Users className="w-6 h-6 mr-3" />
                        Manage Tables
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "orders" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orders.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No orders yet</p>
                      ) : (
                        orders
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((order) => {
                            const table = getTableById(order.tableId)
                            return (
                              <Card key={order.id} className="border-l-4 border-l-blue-500">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <h4 className="font-semibold">
                                        Order #{order.id.slice(-6)} - Table {table?.number}
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        {order.customerName} • {order.customerPhone}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {new Date(order.createdAt).toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold text-lg">₹{order.totalAmount}</p>
                                      <Badge
                                        variant={
                                          order.status === "completed"
                                            ? "default"
                                            : order.status === "cancelled"
                                              ? "destructive"
                                              : "secondary"
                                        }
                                      >
                                        {order.status}
                                      </Badge>
                                    </div>
                                  </div>

                                  <div className="mb-4">
                                    <h5 className="font-medium mb-3 text-gray-800">Order Items ({order.items.length}):</h5>
                                    <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
                                      {order.items.map((item, index) => {
                                        const menuItem = getMenuItemById(item.menuItemId)
                                        return (
                                          <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                                            {/* Item Image */}
                                            {menuItem?.image && (
                                              <div className="flex-shrink-0">
                                                <img 
                                                  src={menuItem.image} 
                                                  alt={menuItem.name}
                                                  className="w-12 h-12 object-cover rounded-lg border"
                                                  onError={(e) => {
                                                    e.currentTarget.style.display = 'none'
                                                  }}
                                                />
                                              </div>
                                            )}
                                            
                                            {/* Item Details */}
                                            <div className="flex-1 min-w-0">
                                              <div className="flex justify-between items-start">
                                                <div>
                                                  <p className="font-medium text-gray-900 truncate">
                                                    {menuItem?.name || 'Unknown Item'}
                                                  </p>
                                                  <p className="text-sm text-gray-600">
                                                    Qty: {item.quantity} × ₹{item.price}
                                                  </p>
                                                  {menuItem?.category && (
                                                    <Badge variant="outline" className="text-xs mt-1">
                                                      {menuItem.category}
                                                    </Badge>
                                                  )}
                                                </div>
                                                <div className="text-right">
                                                  <p className="font-semibold text-gray-900">
                                                    ₹{item.price * item.quantity}
                                                  </p>
                                                  {menuItem?.preparationTime && (
                                                    <p className="text-xs text-gray-500">
                                                      {menuItem.preparationTime} min
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      })}
                                      
                                      {/* Order Summary */}
                                      <div className="border-t pt-3 mt-3">
                                        <div className="flex justify-between items-center">
                                          <span className="font-medium text-gray-700">Total Items:</span>
                                          <span className="font-semibold">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                          <span className="font-medium text-gray-700">Order Total:</span>
                                          <span className="font-bold text-lg text-green-600">₹{order.totalAmount}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {order.notes && (
                                    <div className="mb-3">
                                      <p className="text-sm text-gray-600">
                                        <strong>Notes:</strong> {order.notes}
                                      </p>
                                    </div>
                                  )}

                                  <div className="flex gap-2">
                                    {order.status === "pending" && (
                                      <Button
                                        size="sm"
                                        onClick={() => updateOrderStatus(order.id, "preparing")}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                      >
                                        <Clock className="w-4 h-4 mr-1" />
                                        Start Preparing
                                      </Button>
                                    )}
                                    {order.status === "preparing" && (
                                      <Button
                                        size="sm"
                                        onClick={() => updateOrderStatus(order.id, "ready")}
                                        className="bg-orange-600 hover:bg-orange-700 text-white"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Mark Ready
                                      </Button>
                                    )}
                                    {order.status === "ready" && (
                                      <Button
                                        size="sm"
                                        onClick={() => updateOrderStatus(order.id, "served")}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Mark Served
                                      </Button>
                                    )}
                                    {order.status === "served" && (
                                      <Button
                                        size="sm"
                                        onClick={() => updateOrderStatus(order.id, "completed")}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Complete
                                      </Button>
                                    )}
                                    {order.status !== "completed" && order.status !== "cancelled" && (
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => updateOrderStatus(order.id, "cancelled")}
                                      >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Cancel
                                      </Button>
                                    )}
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
            )}

            {activeSection === "tables" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Table Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {tables.map((table) => (
                        <Card
                          key={table.id}
                          className={`border-2 ${
                            table.status === "available"
                              ? "border-green-200 bg-green-50"
                              : table.status === "occupied"
                                ? "border-red-200 bg-red-50"
                                : table.status === "reserved"
                                  ? "border-blue-200 bg-blue-50"
                                  : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <CardContent className="p-4 text-center">
                            <h3 className="text-xl font-bold mb-2">Table {table.number}</h3>
                            <p className="text-sm text-gray-600 mb-3">Capacity: {table.capacity}</p>
                            <Badge
                              variant={
                                table.status === "available"
                                  ? "default"
                                  : table.status === "occupied"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className="mb-3"
                            >
                              {table.status}
                            </Badge>
                            <div className="space-y-2">
                              <Select
                                value={table.status}
                                onValueChange={(value) => updateTableStatus(table.id, value as Table["status"])}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="available">Available</SelectItem>
                                  <SelectItem value="occupied">Occupied</SelectItem>
                                  <SelectItem value="reserved">Reserved</SelectItem>
                                  <SelectItem value="cleaning">Cleaning</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "menu" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Menu Management</CardTitle>
                    <Button
                      onClick={() => setIsAddingItem(true)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {(isAddingItem || editingMenuItem) && (
                      <MenuItemForm
                        item={editingMenuItem}
                        onSave={saveMenuItem}
                        onCancel={() => {
                          setEditingMenuItem(null)
                          setIsAddingItem(false)
                        }}
                      />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {menuItems.map((item) => (
                        <Card key={item.id} className="border-orange-200">
                          <CardContent className="p-4">
                            {/* Item Image */}
                            {item.image && (
                              <div className="mb-3">
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="w-full h-32 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              </div>
                            )}
                            
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold">{item.name}</h4>
                              <Badge variant={item.available ? "default" : "secondary"}>
                                {item.available ? "Available" : "Unavailable"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            <p className="text-lg font-bold text-orange-600 mb-3">₹{item.price}</p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingMenuItem(item)}
                                className="flex-1"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => deleteMenuItem(item.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "qr-codes" && (
              <Card>
                <CardHeader>
                  <CardTitle>QR Code Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <QrCode className="w-16 h-16 mx-auto text-orange-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">QR Code System</h3>
                    <p className="text-gray-600 mb-6">Generate and manage QR codes for all tables</p>
                    <Button
                      onClick={() => (window.location.href = "/qr-codes")}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      Open QR Code Manager
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Placeholder for settings */}
            {activeSection === "settings" && (
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <p className="text-gray-500">Settings panel coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MenuItemForm({
  item,
  onSave,
  onCancel,
}: {
  item: MenuItem | null
  onSave: (item: MenuItem) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<Partial<MenuItem>>(
    item || {
      name: "",
      description: "",
      price: 0,
      category: "chai",
      available: true,
      preparationTime: 5,
      image: "",
    },
  )
  const [imageError, setImageError] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.description && formData.price) {
      onSave(formData as MenuItem)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setImageError('Please select a valid image file (JPG, PNG, GIF)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size should be less than 5MB')
      return
    }

    setImageError('')
    
    // Create a file reader to convert to base64 or use URL.createObjectURL
    const reader = new FileReader()
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string
      setFormData({ ...formData, image: imageUrl })
    }
    reader.readAsDataURL(file)
  }

  const handleImageRemove = () => {
    setFormData({ ...formData, image: '' })
    setImageError('')
  }

  const selectExistingImage = (imagePath: string) => {
    setFormData({ ...formData, image: imagePath })
    setImageError('')
  }

  // Available menu images from public/menu/
  const availableImages = [
    '/menu/Bombay_Masala_Chai.png',
    '/menu/Chocolate_Chai.png',
    '/menu/Elaichi_Chai.png',
    '/menu/Irani_Chai.png',
    '/menu/Kesar_Pista_Chai.png',
    '/menu/Mawa_Chai.png',
    '/menu/Paan_Chai.png',
    '/menu/rose_chai.png',
    '/menu/Green_Tea.png',
    '/menu/Kashmiri_Kahwa.png',
    '/menu/Lemon_Iced_Tea.png',
    '/menu/Mango_Iced_Tea.png',
    '/menu/Orange_Iced_Tea.png',
    '/menu/Peach_Iced_Tea.png',
    '/menu/Pineapple_Iced_Tea.png',
    '/menu/Hazelnut_Coffee.png',
    '/menu/Pure_Cocoa_Coffee.png',
    '/menu/Regular_Burger.png',
    '/menu/Veggie_Special_Burger.png',
    '/menu/Signature_Fries_Burger.png',
    '/menu/Chillie_Cheese_Burger.png',
    '/menu/Delight_(Veggie)_Burger.png',
    '/menu/Double_Decker_Burger.png',
    '/menu/Kulhad_Maggie.png',
    '/menu/Kit_Kat_Crumble_shake.png',
    '/menu/Oreo_Caramel_Shake.png',
    '/menu/Strawberry_Fusion.png',
    '/menu/Pink_Guava_mocktail.png',
    '/menu/Tamarind_Masala_mocktail.png',
    '/menu/Solo_Veg_Sandwich.png',
    '/menu/Paneer_Tikka_Sandwich.png',
    '/menu/White_Sauce_Pasta.png',
    '/menu/Mix_Sauce_Pasta.png',
    '/menu/Cheese_Garlic_Bread.png',
    '/menu/french_fries.png',
    '/menu/Peri-Peri_Fries .png',
    '/menu/Italian_Pizza.png',
    '/menu/Mexican_Pizza.png',
    '/menu/Paneer_Tikka_Pizza.png',
    '/menu/combo.png',
    '/menu/combo1.png'
  ]

  return (
    <Card className="mb-6 border-green-200">
      <CardHeader>
        <CardTitle>{item ? "Edit Menu Item" : "Add New Menu Item"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          {/* Image Management Section */}
          <div className="space-y-4">
            <Label>Item Image</Label>
            
            {/* Current Image Display */}
            {formData.image && (
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <img 
                  src={formData.image} 
                  alt="Menu item" 
                  className="w-20 h-20 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.png'
                  }}
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Current image</p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleImageRemove}
                    className="mt-2"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove Image
                  </Button>
                </div>
              </div>
            )}

            {/* Upload New Image */}
            <div className="space-y-2">
              <Label htmlFor="imageUpload" className="text-sm font-medium">
                {formData.image ? 'Change Image' : 'Upload Image'}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="imageUpload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={handleImageUpload}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-1" />
                  Browse
                </Button>
              </div>
              {imageError && (
                <p className="text-sm text-red-600">{imageError}</p>
              )}
              <p className="text-xs text-gray-500">
                Supported formats: JPG, PNG, GIF (Max 5MB)
              </p>
            </div>

            {/* Select from Existing Images */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Or select from existing images:</Label>
              <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                {availableImages.map((imagePath, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectExistingImage(imagePath)}
                    className={`relative w-16 h-16 rounded border-2 overflow-hidden hover:border-orange-500 transition-colors ${
                      formData.image === imagePath ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200'
                    }`}
                  >
                    <img 
                      src={imagePath} 
                      alt={`Menu option ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category || "chai"}
                onValueChange={(value) => setFormData({ ...formData, category: value as MenuItem["category"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chai">Chai</SelectItem>
                  <SelectItem value="snacks">Snacks</SelectItem>
                  <SelectItem value="beverages">Beverages</SelectItem>
                  <SelectItem value="desserts">Desserts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="prepTime">Prep Time (minutes)</Label>
              <Input
                id="prepTime"
                type="number"
                value={formData.preparationTime || ""}
                onChange={(e) => setFormData({ ...formData, preparationTime: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="available">Availability</Label>
              <Select
                value={formData.available ? "true" : "false"}
                onValueChange={(value) => setFormData({ ...formData, available: value === "true" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Available</SelectItem>
                  <SelectItem value="false">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
              {item ? "Update Item" : "Add Item"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
