"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, Search, Filter, Clock, CheckCircle, XCircle, Printer, ArrowLeft, Bell, Coffee } from "lucide-react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { OrderNotification } from "@/components/order-notification";
import { ordersService, tablesService, menuItemsService, subscribeToOrders } from "@/lib/database";
export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [ordersData, tablesData, menuItemsData] = await Promise.all([ordersService.getAll(), tablesService.getAll(), menuItemsService.getAll()]);
        setOrders(ordersData);
        setTables(tablesData);
        setMenuItems(menuItemsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Real-time subscription for orders (Supabase realtime)
  useEffect(() => {
    // Subscribe to any changes on the orders table and refresh local state
    const unsubscribe = subscribeToOrders((latestOrders) => {
      setOrders(latestOrders);
    });

    return () => {
      // Clean up Supabase channel on unmount
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders;
    if (searchTerm) {
      filtered = filtered.filter(order => order.id.toLowerCase().includes(searchTerm.toLowerCase()) || order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || getTableNumber(order.tableId).toString().includes(searchTerm));
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const updatedOrder = await ordersService.updateStatus(orderId, newStatus);
      if (updatedOrder) {
        setOrders(prevOrders => prevOrders.map(order => order.id === orderId ? updatedOrder : order));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };
  const getTableNumber = tableId => {
    const table = tables.find(t => t.id === tableId);
    return table?.number || 0;
  };
  const getMenuItemName = menuItemId => {
    // First try to find by exact ID match
    let menuItem = menuItems.find(item => item.id === menuItemId);
    if (!menuItem) {
      // If not found, try to find by name matching from menu data
      // This handles cases where IDs might not match due to sync issues
      try {
        // Import menu data to get fallback names
        const {
          completeMenuItems
        } = require('@/lib/menu-data');
        const fallbackItem = completeMenuItems.find(item => item.id === menuItemId);
        if (fallbackItem) {
          return fallbackItem.name;
        }
      } catch (error) {
        console.warn('Could not load menu data for fallback lookup');
      }
      console.warn(`Menu item not found for ID: ${menuItemId}. Available items: ${menuItems.length}`);
    }
    return menuItem?.name || 'Unknown Item';
  };
  const getStatusBadge = status => {
    const statusConfig = {
      pending: {
        label: "Pending",
        variant: "secondary",
        icon: Clock
      },
      preparing: {
        label: "Preparing",
        variant: "default",
        icon: Coffee
      },
      ready: {
        label: "Ready",
        variant: "outline",
        icon: Bell
      },
      served: {
        label: "Served",
        variant: "default",
        icon: CheckCircle
      },
      completed: {
        label: "Completed",
        variant: "default",
        icon: CheckCircle
      },
      cancelled: {
        label: "Cancelled",
        variant: "destructive",
        icon: XCircle
      }
    };
    const config = statusConfig[status];
    const Icon = config.icon;
    return <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>;
  };
  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };
  const printBill = order => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const billHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill - Order #${order.id}</title>
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
            <div class="shop-name">☕ Kulhad Chai Restaurant</div>
            <div class="shop-details">
              📍 123 Main Street, City, State 12345<br>
              📞 +1 (555) 123-4567
            </div>
          </div>
          
          <div class="bill-info">
            <div><strong>Order ID:</strong> #${order.id}</div>
            <div><strong>Table:</strong> ${getTableNumber(order.tableId)}</div>
            <div><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</div>
            ${order.customerName ? `<div><strong>Customer:</strong> ${order.customerName}</div>` : ''}
            ${order.customerPhone ? `<div><strong>Phone:</strong> ${order.customerPhone}</div>` : ''}
          </div>
          
          <div class="items">
            <div style="border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px;">
              <strong>ITEMS ORDERED</strong>
            </div>
            ${order.items.map(item => `
              <div class="item">
                <span>${getMenuItemName(item.menuItemId)} x${item.quantity}</span>
                <span>${formatCurrency(item.price * item.quantity)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="totals">
            <div class="final-total">
              <div class="total-line">
                <span><strong>TOTAL AMOUNT</strong></span>
                <span><strong>${formatCurrency(order.totalAmount)}</strong></span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            Thank you for visiting!<br>
            Please visit again! 🙏
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(billHTML);
    printWindow.document.close();
    printWindow.print();
  };
  return <div className="min-h-screen bg-background">
      <OrderNotification />
      <div className="flex">
        <AdminSidebar />
        
        <div className="flex-1 p-8">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
            <h1 className="text-3xl font-bold mb-2">Orders Management</h1>
            <p className="text-muted-foreground">Manage and track all restaurant orders in real-time</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
                <p className="text-xs text-muted-foreground">All time orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'pending').length}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting preparation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Preparing</CardTitle>
                <Coffee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'preparing').length}
                </div>
                <p className="text-xs text-muted-foreground">In kitchen</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(orders.filter(o => o.status === 'served').reduce((sum, o) => sum + o.totalAmount, 0))}
                </div>
                <p className="text-xs text-muted-foreground">From served orders</p>
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
                    <Input placeholder="Search by order ID, customer name, or table number..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Orders</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="served">Served</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Orders ({filteredOrders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map(order => <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{getTableNumber(order.tableId)}</TableCell>
                      <TableCell>
                        {order.customerName || 'Walk-in'}
                        {order.customerPhone && <div className="text-xs text-muted-foreground">
                            {order.customerPhone}
                          </div>}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.items.slice(0, 2).map(item => getMenuItemName(item.menuItemId)).join(', ')}
                          {order.items.length > 2 && '...'}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {order.status === 'pending' && <Button size="sm" onClick={() => updateOrderStatus(order.id, 'preparing')}>
                              Start Preparing
                            </Button>}
                          {order.status === 'preparing' && <Button size="sm" onClick={() => updateOrderStatus(order.id, 'ready')}>
                              Mark Ready
                            </Button>}
                          {order.status === 'ready' && <Button size="sm" onClick={() => updateOrderStatus(order.id, 'served')}>
                              Mark Served
                            </Button>}
                          <Button size="sm" variant="outline" onClick={() => printBill(order)}>
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
              
              {filteredOrders.length === 0 && <div className="text-center py-8 text-muted-foreground">
                  No orders found matching your criteria.
                </div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
}
