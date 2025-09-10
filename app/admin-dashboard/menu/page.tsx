"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Coffee,
  UtensilsCrossed,
  Cookie,
  Wine,
  Search,
  Filter,
  Star,
  TrendingUp,
  Eye,
  EyeOff
} from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { menuItemsService } from "@/lib/database"
import type { MenuItem } from "@/lib/types"
import Image from "next/image"

const categories = [
  { value: 'beverages', label: 'Beverages', icon: Coffee },
  { value: 'snacks', label: 'Snacks', icon: Cookie },
  { value: 'meals', label: 'Meals', icon: UtensilsCrossed },
  { value: 'desserts', label: 'Desserts', icon: Wine }
]

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'beverages' as MenuItem['category'],
    preparationTime: '',
    ingredients: '',
    allergens: '',
    available: true,
    isPopular: false
  })

  useEffect(() => {
    loadMenuItems()
  }, [])

  const loadMenuItems = async () => {
    try {
      setLoading(true)
      const items = await menuItemsService.getAll()
      setMenuItems(items)
    } catch (error) {
      console.error('Failed to load menu items:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = menuItems

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(item => item.category === categoryFilter)
    }

    if (availabilityFilter !== "all") {
      filtered = filtered.filter(item => 
        availabilityFilter === "available" ? item.available : !item.available
      )
    }

    setFilteredItems(filtered)
  }, [menuItems, searchTerm, categoryFilter, availabilityFilter])

  const addMenuItem = async () => {
    if (!newItem.name || !newItem.price) return
    
    try {
      const itemData = {
        name: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price),
        category: newItem.category,
        available: newItem.available,
        preparationTime: parseInt(newItem.preparationTime) || 5
      }
      
      const newMenuItem = await menuItemsService.create(itemData)
      if (newMenuItem) {
        setMenuItems(prev => [...prev, newMenuItem])
      }
      
      setNewItem({
        name: '',
        description: '',
        price: '',
        category: 'beverages',
        preparationTime: '',
        ingredients: '',
        allergens: '',
        available: true,
        isPopular: false
      })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error('Failed to add menu item:', error)
    }
  }

  const updateMenuItem = async (itemId: string, updates: Partial<MenuItem>) => {
    try {
      const updatedItem = await menuItemsService.update(itemId, updates)
      if (updatedItem) {
        setMenuItems(prev => 
          prev.map(item => 
            item.id === itemId ? updatedItem : item
          )
        )
      }
    } catch (error) {
      console.error('Failed to update menu item:', error)
    }
  }

  const deleteMenuItem = (itemId: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== itemId))
  }

  const toggleAvailability = (itemId: string) => {
    const item = menuItems.find(item => item.id === itemId)
    if (item) {
      updateMenuItem(itemId, { available: !item.available })
    }
  }

  const togglePopular = (itemId: string) => {
    const item = menuItems.find(item => item.id === itemId)
    if (item) {
      updateMenuItem(itemId, { isPopular: !item.isPopular })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  const getCategoryIcon = (category: MenuItem['category']) => {
    const categoryData = categories.find(cat => cat.value === category)
    return categoryData?.icon || Coffee
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar />
        
        <div className="flex-1 p-8">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Menu Management</h1>
                <p className="text-muted-foreground">Manage your restaurant menu items, pricing, and availability</p>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Menu Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Menu Item</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="itemName">Item Name</Label>
                        <Input
                          id="itemName"
                          placeholder="Enter item name"
                          value={newItem.name}
                          onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="Enter price"
                          value={newItem.price}
                          onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={newItem.category} onValueChange={(value: MenuItem['category']) => setNewItem(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="prepTime">Preparation Time (minutes)</Label>
                        <Input
                          id="prepTime"
                          type="number"
                          placeholder="Enter preparation time"
                          value={newItem.preparationTime}
                          onChange={(e) => setNewItem(prev => ({ ...prev, preparationTime: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Enter item description"
                          value={newItem.description}
                          onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="ingredients">Ingredients (comma-separated)</Label>
                        <Textarea
                          id="ingredients"
                          placeholder="Enter ingredients"
                          value={newItem.ingredients}
                          onChange={(e) => setNewItem(prev => ({ ...prev, ingredients: e.target.value }))}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor="allergens">Allergens (comma-separated)</Label>
                        <Input
                          id="allergens"
                          placeholder="Enter allergens"
                          value={newItem.allergens}
                          onChange={(e) => setNewItem(prev => ({ ...prev, allergens: e.target.value }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="available"
                            checked={newItem.available}
                  onCheckedChange={(checked) => setNewItem(prev => ({ ...prev, available: checked }))}
                          />
                          <Label htmlFor="available">Available</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="popular"
                            checked={newItem.isPopular}
                            onCheckedChange={(checked) => setNewItem(prev => ({ ...prev, isPopular: checked }))}
                          />
                          <Label htmlFor="popular">Popular</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addMenuItem}>
                      Add Item
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{menuItems.length}</div>
                <p className="text-xs text-muted-foreground">Menu items</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available</CardTitle>
                <Eye className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {menuItems.filter(item => item.available).length}
                </div>
                <p className="text-xs text-muted-foreground">Currently available</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Popular Items</CardTitle>
                <Star className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {menuItems.filter(item => item.isPopular).length}
                </div>
                <p className="text-xs text-muted-foreground">Customer favorites</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Average item price</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search menu items, ingredients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-48">
                  <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="available">Available Only</SelectItem>
                      <SelectItem value="unavailable">Unavailable Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu Items Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading menu items...</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const CategoryIcon = getCategoryIcon(item.category)
              return (
                <Card key={item.id} className={`${!item.available ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                      </div>
                      <div className="flex gap-1">
                        {item.isPopular && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                        <Badge variant={item.available ? "default" : "secondary"} className="text-xs">
                        {item.available ? (
                            <><Eye className="h-3 w-3 mr-1" />Available</>
                          ) : (
                            <><EyeOff className="h-3 w-3 mr-1" />Unavailable</>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">{formatCurrency(item.price)}</div>
                      <div className="text-sm text-muted-foreground">{item.preparationTime} min</div>
                    </div>

                    {item.ingredients && item.ingredients.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Ingredients:</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {item.ingredients.join(', ')}
                        </div>
                      </div>
                    )}

                    {item.allergens && item.allergens.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-red-600 mb-1">Allergens:</div>
                        <div className="text-xs text-red-600">
                          {item.allergens.join(', ')}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleAvailability(item.id)}
                        className="flex-1"
                      >
                        {item.available ? (
                          <><EyeOff className="h-3 w-3 mr-1" />Hide</>
                        ) : (
                          <><Eye className="h-3 w-3 mr-1" />Show</>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePopular(item.id)}
                        className="flex-1"
                      >
                        <Star className={`h-3 w-3 mr-1 ${item.isPopular ? 'fill-current' : ''}`} />
                        {item.isPopular ? 'Unmark' : 'Popular'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteMenuItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}          </div>
          )}

          {filteredItems.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No menu items found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || categoryFilter !== "all" || availabilityFilter !== "all" 
                    ? "Try adjusting your search or filters."
                    : "Get started by adding your first menu item."
                  }
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Menu Item
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}