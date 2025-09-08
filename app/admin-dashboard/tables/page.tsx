"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  QrCode, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  ArrowLeft,
  Users,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { tablesService } from "@/lib/database"
import type { Table } from "@/lib/types"
import QRCode from 'qrcode'

export default function TablesManagement() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [newTable, setNewTable] = useState({ number: '', capacity: '' })

  // Load tables from database
  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
    try {
      setLoading(true)
      const data = await tablesService.getAll()
      setTables(data)
    } catch (error) {
      console.error('Error loading tables:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTableStatus = async (tableId: string, newStatus: Table['status']) => {
    try {
      await tablesService.updateStatus(tableId, newStatus)
      setTables(prevTables => 
        prevTables.map(table => 
          table.id === tableId 
            ? { ...table, status: newStatus }
            : table
        )
      )
    } catch (error) {
      console.error('Error updating table status:', error)
    }
  }

  const addNewTable = async () => {
    if (!newTable.number || !newTable.capacity) return
    
    try {
      const tableData = {
        number: parseInt(newTable.number),
        capacity: parseInt(newTable.capacity),
        status: 'available' as const,
        qrCode: `https://restaurant-menu.com/table/${newTable.number}`
      }
      
      const newTableRecord = await tablesService.create(tableData)
      setTables(prev => [...prev, newTableRecord])
      setNewTable({ number: '', capacity: '' })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error('Error adding table:', error)
    }
  }

  const deleteTable = (tableId: string) => {
    setTables(prev => prev.filter(table => table.id !== tableId))
  }

  const generateQRCode = async (tableNumber: number) => {
    try {
      const menuUrl = `${window.location.origin}/menu?table=${tableNumber}`
      const qrCodeDataUrl = await QRCode.toDataURL(menuUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      return qrCodeDataUrl
    } catch (error) {
      console.error('Error generating QR code:', error)
      return null
    }
  }

  const downloadQRCode = async (table: Table) => {
    const qrCodeDataUrl = await generateQRCode(table.number)
    if (!qrCodeDataUrl) return

    const link = document.createElement('a')
    link.download = `table-${table.number}-qr-code.png`
    link.href = qrCodeDataUrl
    link.click()
  }

  const downloadAllQRCodes = async () => {
    for (const table of tables) {
      await downloadQRCode(table)
      // Add a small delay to prevent overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  const getStatusBadge = (status: Table['status']) => {
    const statusConfig = {
      available: { label: "Available", variant: "default" as const, icon: CheckCircle },
      occupied: { label: "Occupied", variant: "destructive" as const, icon: Users },
      reserved: { label: "Reserved", variant: "secondary" as const, icon: Clock },
      cleaning: { label: "Cleaning", variant: "outline" as const, icon: AlertCircle }
    }
    
    const config = statusConfig[status]
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getStatusColor = (status: Table['status']) => {
    const colors = {
      available: 'bg-green-100 border-green-300',
      occupied: 'bg-red-100 border-red-300',
      reserved: 'bg-yellow-100 border-yellow-300',
      cleaning: 'bg-gray-100 border-gray-300'
    }
    return colors[status]
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
                <h1 className="text-3xl font-bold mb-2">Tables & QR Codes</h1>
                <p className="text-muted-foreground">Manage restaurant tables and generate QR codes for digital menus</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={downloadAllQRCodes} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download All QR Codes
                </Button>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Table
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Table</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="tableNumber">Table Number</Label>
                        <Input
                          id="tableNumber"
                          type="number"
                          placeholder="Enter table number"
                          value={newTable.number}
                          onChange={(e) => setNewTable(prev => ({ ...prev, number: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="capacity">Capacity</Label>
                        <Input
                          id="capacity"
                          type="number"
                          placeholder="Enter seating capacity"
                          value={newTable.capacity}
                          onChange={(e) => setNewTable(prev => ({ ...prev, capacity: e.target.value }))}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={addNewTable}>
                          Add Table
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tables.length}</div>
                <p className="text-xs text-muted-foreground">Restaurant capacity</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {tables.filter(t => t.status === 'available').length}
                </div>
                <p className="text-xs text-muted-foreground">Ready for guests</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Occupied</CardTitle>
                <Users className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {tables.filter(t => t.status === 'occupied').length}
                </div>
                <p className="text-xs text-muted-foreground">Currently serving</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tables.reduce((sum, table) => sum + table.capacity, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Maximum guests</p>
              </CardContent>
            </Card>
          </div>

          {/* Tables Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tables.map((table) => (
              <Card key={table.id} className={`${getStatusColor(table.status)} border-2`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Table {table.number}</CardTitle>
                    {getStatusBadge(table.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Capacity: {table.capacity} guests</span>
                  </div>
                  
                  {/* Status Actions */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground mb-2">Change Status:</div>
                    <div className="grid grid-cols-2 gap-1">
                      <Button
                        size="sm"
                        variant={table.status === 'available' ? 'default' : 'outline'}
                        onClick={() => updateTableStatus(table.id, 'available')}
                        className="text-xs"
                      >
                        Available
                      </Button>
                      <Button
                        size="sm"
                        variant={table.status === 'occupied' ? 'default' : 'outline'}
                        onClick={() => updateTableStatus(table.id, 'occupied')}
                        className="text-xs"
                      >
                        Occupied
                      </Button>
                      <Button
                        size="sm"
                        variant={table.status === 'reserved' ? 'default' : 'outline'}
                        onClick={() => updateTableStatus(table.id, 'reserved')}
                        className="text-xs"
                      >
                        Reserved
                      </Button>
                      <Button
                        size="sm"
                        variant={table.status === 'maintenance' ? 'default' : 'outline'}
                        onClick={() => updateTableStatus(table.id, 'maintenance')}
                        className="text-xs"
                      >
                        Maintenance
                      </Button>
                    </div>
                  </div>

                  {/* QR Code Actions */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="text-xs font-medium text-muted-foreground">QR Code:</div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadQRCode(table)}
                        className="flex-1"
                      >
                        <QrCode className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteTable(table.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {tables.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No tables found</h3>
                <p className="text-muted-foreground mb-4">Get started by adding your first table.</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Table
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}