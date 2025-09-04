"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Settings,
  Store,
  Users,
  Clock,
  Wifi,
  Bell,
  Save,
  Upload,
  Check,
  AlertCircle
} from 'lucide-react'
import { menuItemsService, tablesService } from '@/lib/database'
import type { MenuItem, Table } from '@/lib/types'

interface RestaurantSettings {
  name: string
  address: string
  phone: string
  email: string
  website: string
  description: string
  openingHours: {
    monday: { open: string; close: string; closed: boolean }
    tuesday: { open: string; close: string; closed: boolean }
    wednesday: { open: string; close: string; closed: boolean }
    thursday: { open: string; close: string; closed: boolean }
    friday: { open: string; close: string; closed: boolean }
    saturday: { open: string; close: string; closed: boolean }
    sunday: { open: string; close: string; closed: boolean }
  }
  taxRate: number
  serviceCharge: number
  currency: string
  autoAcceptOrders: boolean
  orderNotifications: boolean
  maxOrdersPerHour: number
}

interface SystemSettings {
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  backupEnabled: boolean
  maintenanceMode: boolean
}

const defaultRestaurantSettings: RestaurantSettings = {
  name: 'Kulhad Chai Restaurant',
  address: '123 Main Street, City, State 12345',
  phone: '+1 (555) 123-4567',
  email: 'info@kulhadchai.com',
  website: 'www.kulhadchai.com',
  description: 'Authentic Chai & Delicious Food Experience',
  openingHours: {
    monday: { open: '09:00', close: '22:00', closed: false },
    tuesday: { open: '09:00', close: '22:00', closed: false },
    wednesday: { open: '09:00', close: '22:00', closed: false },
    thursday: { open: '09:00', close: '22:00', closed: false },
    friday: { open: '09:00', close: '23:00', closed: false },
    saturday: { open: '09:00', close: '23:00', closed: false },
    sunday: { open: '10:00', close: '21:00', closed: false }
  },
  taxRate: 18,
  serviceCharge: 10,
  currency: '₹',
  autoAcceptOrders: false,
  orderNotifications: true,
  maxOrdersPerHour: 50
}

const defaultSystemSettings: SystemSettings = {
  theme: 'light',
  language: 'en',
  timezone: 'Asia/Kolkata',
  backupEnabled: true,
  maintenanceMode: false
}

export default function SettingsPage() {
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings>(defaultRestaurantSettings)
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(defaultSystemSettings)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  useEffect(() => {
    loadData()
    loadSettings()
  }, [])

  const loadData = async () => {
    try {
      const [loadedMenuItems, loadedTables] = await Promise.all([
        menuItemsService.getAll(),
        tablesService.getAll()
      ])
      setMenuItems(loadedMenuItems)
      setTables(loadedTables)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const loadSettings = () => {
    const savedRestaurantSettings = localStorage.getItem('restaurant-settings')
    const savedSystemSettings = localStorage.getItem('system-settings')
    
    if (savedRestaurantSettings) {
      setRestaurantSettings(JSON.parse(savedRestaurantSettings))
    }
    if (savedSystemSettings) {
      setSystemSettings(JSON.parse(savedSystemSettings))
    }
  }

  const saveSettings = async () => {
    setIsLoading(true)
    setSaveStatus('saving')
    
    try {
      localStorage.setItem('restaurant-settings', JSON.stringify(restaurantSettings))
      localStorage.setItem('system-settings', JSON.stringify(systemSettings))
      
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const updateRestaurantSetting = (key: keyof RestaurantSettings, value: any) => {
    setRestaurantSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateSystemSetting = (key: keyof SystemSettings, value: any) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateOpeningHours = (day: keyof RestaurantSettings['openingHours'], field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setRestaurantSettings(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value
        }
      }
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-orange-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Restaurant Settings</h1>
                <p className="text-gray-600">Manage your restaurant configuration and preferences</p>
              </div>
            </div>
            <Button 
              onClick={saveSettings} 
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
          
          {saveStatus !== 'idle' && (
            <div className="mt-4">
              {saveStatus === 'saved' && (
                <Alert className="border-green-200 bg-green-50">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Settings saved successfully!
                  </AlertDescription>
                </Alert>
              )}
              {saveStatus === 'error' && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Error saving settings. Please try again.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="restaurant" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="restaurant" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Restaurant
            </TabsTrigger>
            <TabsTrigger value="operations" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Operations
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Overview
            </TabsTrigger>
          </TabsList>

          {/* Restaurant Information */}
          <TabsContent value="restaurant" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Restaurant Name</Label>
                    <Input
                      id="name"
                      value={restaurantSettings.name}
                      onChange={(e) => updateRestaurantSetting('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={restaurantSettings.phone}
                      onChange={(e) => updateRestaurantSetting('phone', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={restaurantSettings.email}
                      onChange={(e) => updateRestaurantSetting('email', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={restaurantSettings.website}
                      onChange={(e) => updateRestaurantSetting('website', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={restaurantSettings.address}
                    onChange={(e) => updateRestaurantSetting('address', e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={restaurantSettings.description}
                    onChange={(e) => updateRestaurantSetting('description', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing & Charges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      value={restaurantSettings.currency}
                      onChange={(e) => updateRestaurantSetting('currency', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      min="0"
                      max="100"
                      value={restaurantSettings.taxRate}
                      onChange={(e) => updateRestaurantSetting('taxRate', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="serviceCharge">Service Charge (%)</Label>
                    <Input
                      id="serviceCharge"
                      type="number"
                      min="0"
                      max="100"
                      value={restaurantSettings.serviceCharge}
                      onChange={(e) => updateRestaurantSetting('serviceCharge', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Operations */}
          <TabsContent value="operations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Opening Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(restaurantSettings.openingHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-24 font-medium capitalize">{day}</div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={!hours.closed}
                          onCheckedChange={(checked) => updateOpeningHours(day as keyof RestaurantSettings['openingHours'], 'closed', !checked)}
                        />
                        <span className="text-sm text-gray-600">Open</span>
                      </div>
                      {!hours.closed && (
                        <>
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">From:</Label>
                            <Input
                              type="time"
                              value={hours.open}
                              onChange={(e) => updateOpeningHours(day as keyof RestaurantSettings['openingHours'], 'open', e.target.value)}
                              className="w-32"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">To:</Label>
                            <Input
                              type="time"
                              value={hours.close}
                              onChange={(e) => updateOpeningHours(day as keyof RestaurantSettings['openingHours'], 'close', e.target.value)}
                              className="w-32"
                            />
                          </div>
                        </>
                      )}
                      {hours.closed && (
                        <Badge variant="secondary">Closed</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Auto Accept Orders</Label>
                    <p className="text-sm text-gray-600">Automatically accept incoming orders</p>
                  </div>
                  <Switch
                    checked={restaurantSettings.autoAcceptOrders}
                    onCheckedChange={(checked) => updateRestaurantSetting('autoAcceptOrders', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Order Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications for new orders</p>
                  </div>
                  <Switch
                    checked={restaurantSettings.orderNotifications}
                    onCheckedChange={(checked) => updateRestaurantSetting('orderNotifications', checked)}
                  />
                </div>
                <div>
                  <Label htmlFor="maxOrders">Maximum Orders Per Hour</Label>
                  <Input
                    id="maxOrders"
                    type="number"
                    min="1"
                    value={restaurantSettings.maxOrdersPerHour}
                    onChange={(e) => updateRestaurantSetting('maxOrdersPerHour', parseInt(e.target.value))}
                    className="w-32"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <select
                      id="theme"
                      value={systemSettings.theme}
                      onChange={(e) => updateSystemSetting('theme', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      value={systemSettings.timezone}
                      onChange={(e) => updateSystemSetting('timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Automatic Backup</Label>
                    <p className="text-sm text-gray-600">Enable daily automatic backups</p>
                  </div>
                  <Switch
                    checked={systemSettings.backupEnabled}
                    onCheckedChange={(checked) => updateSystemSetting('backupEnabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Maintenance Mode</Label>
                    <p className="text-sm text-gray-600">Temporarily disable customer access</p>
                  </div>
                  <Switch
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => updateSystemSetting('maintenanceMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-orange-600" />
                    Menu Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{menuItems.length}</div>
                  <p className="text-sm text-gray-600">Total menu items</p>
                  <div className="mt-2">
                    <Badge variant="outline">
                      {menuItems.filter(item => item.available).length} Available
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Tables
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{tables.length}</div>
                  <p className="text-sm text-gray-600">Total tables</p>
                  <div className="mt-2 space-x-2">
                    <Badge variant="outline" className="text-green-600">
                      {tables.filter(table => table.status === 'available').length} Available
                    </Badge>
                    <Badge variant="outline" className="text-red-600">
                      {tables.filter(table => table.status === 'occupied').length} Occupied
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-purple-600" />
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Notifications</span>
                      <Badge variant={restaurantSettings.orderNotifications ? 'default' : 'secondary'}>
                        {restaurantSettings.orderNotifications ? 'On' : 'Off'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto Accept</span>
                      <Badge variant={restaurantSettings.autoAcceptOrders ? 'default' : 'secondary'}>
                        {restaurantSettings.autoAcceptOrders ? 'On' : 'Off'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Maintenance</span>
                      <Badge variant={systemSettings.maintenanceMode ? 'destructive' : 'default'}>
                        {systemSettings.maintenanceMode ? 'On' : 'Off'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}