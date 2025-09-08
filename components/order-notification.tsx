"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, X, Printer, Clock, User, Phone } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { printBill } from '@/lib/print-bill'

interface OrderItem {
  id: string
  menu_item_id: string
  quantity: number
  price: number
  special_instructions?: string
}

interface Order {
  id: string
  table_id: string
  customer_name: string
  customer_phone: string
  status: string
  total_amount: number
  notes?: string
  created_at: string
  items: OrderItem[]
}

export function OrderNotification() {
  const [newOrders, setNewOrders] = useState<Order[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [lastOrderTime, setLastOrderTime] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    
    // Subscribe to new orders
    const channel = supabase
      .channel('orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          const newOrder = payload.new as Order
          
          // Only show notification for new orders (not updates)
          if (newOrder.status === 'pending') {
            // Fetch order items
            const { data: orderItems } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', newOrder.id)
            
            const orderWithItems = {
              ...newOrder,
              items: orderItems || []
            }
            
            setNewOrders(prev => [...prev, orderWithItems])
            setIsVisible(true)
            setLastOrderTime(newOrder.created_at)
            
            // Play notification sound
            const audio = new Audio('/notify.wav')
            audio.play().catch(console.error)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleDismiss = (orderId: string) => {
    setNewOrders(prev => prev.filter(order => order.id !== orderId))
    if (newOrders.length <= 1) {
      setIsVisible(false)
    }
  }

  const handlePrintBill = (order: Order) => {
    printBill(order)
    handleDismiss(order.id)
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isVisible || newOrders.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md space-y-2">
      {newOrders.map((order) => (
        <Card key={order.id} className="shadow-lg border-l-4 border-l-orange-500 bg-white animate-in slide-in-from-right duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-lg">New Order!</CardTitle>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  #{order.id.slice(-6)}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(order.id)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{formatTime(order.created_at)}</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{order.customer_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{order.customer_phone}</span>
              </div>
            </div>

            <div className="bg-gray-50 p-2 rounded text-sm">
              <div className="font-medium mb-1">Items:</div>
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.quantity}x Item</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t pt-1 mt-1 font-semibold flex justify-between">
                <span>Total:</span>
                <span>₹{order.total_amount}</span>
              </div>
            </div>

            {order.notes && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Notes:</span> {order.notes}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => handlePrintBill(order)}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                size="sm"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Bill
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDismiss(order.id)}
                size="sm"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}