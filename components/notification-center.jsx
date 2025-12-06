"use client";

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/utils/supabase/client';
import { formatDistanceToNow } from 'date-fns';

export function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch of recent pending orders
    const fetchRecentOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching recent orders:', error);
          return;
        }

        if (data) {
          setNotifications(data);
          setUnreadCount(data.length);
        }
      } catch (error) {
        console.error('Error fetching recent orders:', error);
      }
    };

    fetchRecentOrders();

    // Subscribe to new orders
    const channel = supabase.channel('notification-center')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders'
      }, payload => {
        try {
          const newOrder = payload.new;
          if (newOrder.status === 'pending') {
            setNotifications(prev => [newOrder, ...prev]);
            setUnreadCount(prev => prev + 1);
          }
        } catch (error) {
          console.error('Error processing new order notification:', error);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders'
      }, payload => {
        try {
          // If order status changes from pending, remove from notifications or mark as read
          const updatedOrder = payload.new;
          if (updatedOrder.status !== 'pending') {
            setNotifications(prev => prev.filter(n => n.id !== updatedOrder.id));
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        } catch (error) {
          console.error('Error processing order update notification:', error);
        }
      })
      .subscribe((status, err) => {
        if (err) {
          console.error('Notification center subscription error:', err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (open) {
      // Optional: Mark all as read when opening? 
      // For now, we keep them as "unread" until actioned or explicitly dismissed
    }
  };

  const markAsRead = (id) => {
    // In a real app, we might update a 'read' status in DB.
    // Here we just remove it from the list or visually mark it.
    // Let's remove it from the list for now as "dismissed"
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} New
            </Badge>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">No new notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-4 hover:bg-muted/50 transition-colors relative group">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium text-sm flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 inline-block"></span>
                      New Order #{notification.id.slice(-4)}
                    </div>
                    <span className="text-[10px] text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2 pl-4">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {notification.customer_name}
                    </div>
                    <div className="font-medium text-foreground mt-1">
                      ₹{notification.total_amount}
                    </div>
                  </div>
                  <div className="pl-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs w-full"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
