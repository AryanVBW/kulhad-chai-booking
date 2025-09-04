"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Upload, Eye, Settings, Store, MapPin, Phone, Mail, Globe } from "lucide-react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import Image from "next/image"

interface ShopSettings {
  name: string
  address: string
  phone: string
  email: string
  website: string
  gst: string
  logo: string
  tagline: string
  footerText: string
  currency: string
  taxRate: number
  serviceCharge: number
}

const defaultSettings: ShopSettings = {
  name: "Kulhad Chai Restaurant",
  address: "123 Main Street, City, State 12345",
  phone: "+1 (555) 123-4567",
  email: "info@kulhadchai.com",
  website: "www.kulhadchai.com",
  gst: "GST123456789",
  logo: "",
  tagline: "Authentic Chai & Delicious Food",
  footerText: "Thank you for visiting! Come again soon.",
  currency: "₹",
  taxRate: 18,
  serviceCharge: 10
}

export default function BillSettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<ShopSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('shop-settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const handleSave = () => {
    setIsLoading(true)
    // Save to localStorage
    localStorage.setItem('shop-settings', JSON.stringify(settings))
    setTimeout(() => {
      setIsLoading(false)
      alert('Settings saved successfully!')
    }, 1000)
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSettings(prev => ({ ...prev, logo: e.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const BillPreview = () => (
    <div className="bg-white p-6 border rounded-lg shadow-lg max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-4">
        {settings.logo && (
          <img src={settings.logo} alt="Logo" className="h-16 mx-auto mb-2" />
        )}
        <h1 className="text-xl font-bold text-gray-800">{settings.name}</h1>
        <p className="text-sm text-gray-600">{settings.tagline}</p>
        <div className="text-xs text-gray-500 mt-2">
          <p>{settings.address}</p>
          <p>Phone: {settings.phone} | Email: {settings.email}</p>
          {settings.website && <p>Website: {settings.website}</p>}
          <p>GST: {settings.gst}</p>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      {/* Sample Bill Content */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Bill No: #001</span>
          <span>Date: {new Date().toLocaleDateString()}</span>
        </div>
        <div className="text-sm">
          <span>Table: 5</span>
        </div>
      </div>
      
      <Separator className="my-3" />
      
      {/* Sample Items */}
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Kulhad Chai x2</span>
          <span>{settings.currency}40</span>
        </div>
        <div className="flex justify-between">
          <span>Samosa x1</span>
          <span>{settings.currency}25</span>
        </div>
      </div>
      
      <Separator className="my-3" />
      
      {/* Totals */}
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{settings.currency}65</span>
        </div>
        <div className="flex justify-between">
          <span>Service Charge ({settings.serviceCharge}%):</span>
          <span>{settings.currency}6.50</span>
        </div>
        <div className="flex justify-between">
          <span>Tax ({settings.taxRate}%):</span>
          <span>{settings.currency}12.87</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>{settings.currency}84.37</span>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      {/* Footer */}
      <div className="text-center text-xs text-gray-500">
        <p>{settings.footerText}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar />
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bill Settings</h1>
                <p className="text-gray-600">Configure your shop details and bill format</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
        <div className={`grid ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
          {/* Settings Form */}
          <div className="space-y-6">
            {/* Shop Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="h-5 w-5 mr-2" />
                  Shop Information
                </CardTitle>
                <CardDescription>
                  Basic details about your restaurant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Shop Name</Label>
                    <Input
                      id="name"
                      value={settings.name}
                      onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter shop name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={settings.tagline}
                      onChange={(e) => setSettings(prev => ({ ...prev, tagline: e.target.value }))}
                      placeholder="Enter tagline"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={settings.address}
                    onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter complete address"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="logo">Logo</Label>
                  <div className="flex items-center space-x-4">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="flex-1"
                    />
                    {settings.logo && (
                      <img src={settings.logo} alt="Logo" className="h-12 w-12 object-contain border rounded" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  How customers can reach you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={settings.phone}
                      onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={settings.website}
                      onChange={(e) => setSettings(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="Enter website URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gst">GST Number</Label>
                    <Input
                      id="gst"
                      value={settings.gst}
                      onChange={(e) => setSettings(prev => ({ ...prev, gst: e.target.value }))}
                      placeholder="Enter GST number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bill Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Bill Configuration
                </CardTitle>
                <CardDescription>
                  Customize your bill format and calculations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currency">Currency Symbol</Label>
                    <Input
                      id="currency"
                      value={settings.currency}
                      onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                      placeholder="₹"
                    />
                  </div>
                  <div>
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      value={settings.taxRate}
                      onChange={(e) => setSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                      placeholder="18"
                    />
                  </div>
                  <div>
                    <Label htmlFor="serviceCharge">Service Charge (%)</Label>
                    <Input
                      id="serviceCharge"
                      type="number"
                      value={settings.serviceCharge}
                      onChange={(e) => setSettings(prev => ({ ...prev, serviceCharge: parseFloat(e.target.value) || 0 }))}
                      placeholder="10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="footerText">Footer Text</Label>
                  <Textarea
                    id="footerText"
                    value={settings.footerText}
                    onChange={(e) => setSettings(prev => ({ ...prev, footerText: e.target.value }))}
                    placeholder="Thank you message or additional information"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Bill Preview</CardTitle>
                  <CardDescription>
                    This is how your bills will look
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BillPreview />
                </CardContent>
              </Card>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}