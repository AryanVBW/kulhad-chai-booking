"use client";

import { useState, useEffect, Suspense, lazy, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Package, FileText, CreditCard, TrendingUp, AlertTriangle, DollarSign, Calendar, BarChart3 } from "lucide-react";
import { getCustomers, getProducts, getInvoices, getLowStockProducts } from "@/lib/supabase-service-cached";
import { useMultipleCachedData } from "@/hooks/useCachedData";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderNotification } from "@/components/order-notification";

// Lazy load chart components
const ChartContainer = lazy(() => import("@/components/ui/chart").then(module => ({
  default: module.ChartContainer
})));
const ChartTooltip = lazy(() => import("@/components/ui/chart").then(module => ({
  default: module.ChartTooltip
})));
const ChartTooltipContent = lazy(() => import("@/components/ui/chart").then(module => ({
  default: module.ChartTooltipContent
})));
const AreaChart = lazy(() => import("recharts").then(module => ({
  default: module.AreaChart
})));
const LineChart = lazy(() => import("recharts").then(module => ({
  default: module.LineChart
})));
const BarChart = lazy(() => import("recharts").then(module => ({
  default: module.BarChart
})));
const Area = lazy(() => import("recharts").then(module => ({
  default: module.Area
})));
const Line = lazy(() => import("recharts").then(module => ({
  default: module.Line
})));
const Bar = lazy(() => import("recharts").then(module => ({
  default: module.Bar
})));
const XAxis = lazy(() => import("recharts").then(module => ({
  default: module.XAxis
})));
const YAxis = lazy(() => import("recharts").then(module => ({
  default: module.YAxis
})));
export default function AdminDashboard() {
  // Use cached data hook for better performance
  const { data, loading, refetchAll } = useMultipleCachedData([
    { cacheType: 'customers', fetchFunction: getCustomers },
    { cacheType: 'products', fetchFunction: getProducts },
    { cacheType: 'invoices', fetchFunction: getInvoices },
    { cacheType: 'lowStockProducts', fetchFunction: getLowStockProducts },
  ]);

  const customers = data.customers || [];
  const products = data.products || [];
  const invoices = data.invoices || [];
  const lowStockProducts = data.lowStockProducts || [];
  const totalRevenue = invoices.filter(inv => inv.paymentStatus === "paid").reduce((sum, inv) => sum + inv.totalAmount, 0);
  const pendingAmount = invoices.filter(inv => inv.paymentStatus !== "paid").reduce((sum, inv) => sum + inv.balanceDue, 0);
  const thisMonthInvoices = invoices.filter(inv => {
    const invoiceDate = new Date(inv.createdAt);
    const now = new Date();
    return invoiceDate.getMonth() === now.getMonth() && invoiceDate.getFullYear() === now.getFullYear();
  });

  // Generate sales data for the last 7 days
  const salesData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.createdAt);
        return invDate.toDateString() === date.toDateString() && inv.paymentStatus === 'paid';
      });
      const revenue = dayInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const orders = dayInvoices.length;
      data.push({
        date: date.toLocaleDateString('en-US', {
          weekday: 'short'
        }),
        revenue: revenue,
        orders: orders
      });
    }
    return data;
  }, [invoices]);

  // Generate monthly revenue data for the last 6 months
  const monthlyData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.createdAt);
        return invDate.getMonth() === date.getMonth() && invDate.getFullYear() === date.getFullYear() && inv.paymentStatus === 'paid';
      });
      const revenue = monthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      data.push({
        month: date.toLocaleDateString('en-US', {
          month: 'short'
        }),
        revenue: revenue
      });
    }
    return data;
  }, [invoices]);

  // Generate top products data
  const topProductsData = useMemo(() => {
    const productSales = {};
    invoices.forEach(invoice => {
      if (invoice.paymentStatus === 'paid') {
        invoice.items.forEach(item => {
          if (!productSales[item.productId]) {
            productSales[item.productId] = {
              name: item.productName,
              quantity: 0,
              revenue: 0
            };
          }
          productSales[item.productId].quantity += item.quantity;
          productSales[item.productId].revenue += item.totalAmount;
        });
      }
    });
    return Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [invoices]);
  // Calculate Inventory Value
  const inventoryValue = products.reduce((sum, product) => {
    return sum + (product.price * product.stock);
  }, 0);

  // Calculate Top Customer
  const topCustomer = useMemo(() => {
    const customerSpend = {};
    thisMonthInvoices.forEach(inv => {
      if (inv.paymentStatus === 'paid') {
        if (!customerSpend[inv.customerName]) {
          customerSpend[inv.customerName] = 0;
        }
        customerSpend[inv.customerName] += inv.totalAmount;
      }
    });

    let top = { name: 'N/A', amount: 0 };
    Object.entries(customerSpend).forEach(([name, amount]) => {
      if (amount > top.amount) {
        top = { name, amount };
      }
    });
    return top;
  }, [thisMonthInvoices]);

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))"
    },
    orders: {
      label: "Orders",
      color: "hsl(var(--chart-2))"
    }
  };
  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };
  return <div className="min-h-screen bg-background">
    <OrderNotification />
    <div className="flex">
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Business Dashboard</h1>
          <p className="text-muted-foreground">Overview of your business performance and key metrics</p>
        </div>

        {/* Key Metrics Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                From {invoices.filter(inv => inv.paymentStatus === 'paid').length} paid invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(pendingAmount)}</div>
              <p className="text-xs text-muted-foreground">
                From {invoices.filter(inv => inv.paymentStatus !== 'paid').length} unpaid invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(inventoryValue)}</div>
              <p className="text-xs text-muted-foreground">
                Total value of stock on hand
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
              <p className="text-xs text-muted-foreground">
                Active customer base
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                {products.filter(p => p.isActive).length} active products
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Customer (Month)</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate" title={topCustomer.name}>{topCustomer.name}</div>
              <p className="text-xs text-muted-foreground">
                Spent {formatCurrency(topCustomer.amount)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Charts Area (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Daily Sales Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Daily Sales (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <AreaChart data={salesData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="var(--color-revenue)" fillOpacity={0.3} />
                    </AreaChart>
                  </ChartContainer>
                </Suspense>
              </CardContent>
            </Card>

            {/* Monthly Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Monthly Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <LineChart data={monthlyData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={3} dot={{
                        fill: "var(--color-revenue)",
                        strokeWidth: 2,
                        r: 4
                      }} />
                    </LineChart>
                  </ChartContainer>
                </Suspense>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Top Selling Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <BarChart data={topProductsData} layout="horizontal">
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="revenue" fill="var(--color-revenue)" />
                    </BarChart>
                  </ChartContainer>
                </Suspense>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column (1/3 width) */}
          <div className="space-y-6">
            {/* Quick Actions - Compact Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="cursor-pointer hover:shadow-md transition-shadow p-4 flex flex-col items-center justify-center text-center h-32" onClick={() => window.location.href = '/admin-dashboard/invoices'}>
                <FileText className="h-8 w-8 mb-2 text-primary" />
                <span className="text-sm font-medium">New Invoice</span>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow p-4 flex flex-col items-center justify-center text-center h-32" onClick={() => window.location.href = '/admin-dashboard/products'}>
                <Package className="h-8 w-8 mb-2 text-primary" />
                <span className="text-sm font-medium">Products</span>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow p-4 flex flex-col items-center justify-center text-center h-32" onClick={() => window.location.href = '/admin-dashboard/customers'}>
                <Users className="h-8 w-8 mb-2 text-primary" />
                <span className="text-sm font-medium">Customers</span>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow p-4 flex flex-col items-center justify-center text-center h-32" onClick={() => window.location.href = '/admin-dashboard/payments'}>
                <CreditCard className="h-8 w-8 mb-2 text-primary" />
                <span className="text-sm font-medium">Payments</span>
              </Card>
            </div>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Calendar className="mr-2 h-4 w-4" />
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Orders</span>
                  <span className="font-semibold">{thisMonthInvoices.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Paid Orders</span>
                  <span className="font-semibold text-green-600">
                    {thisMonthInvoices.filter(inv => inv.paymentStatus === 'paid').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending Orders</span>
                  <span className="font-semibold text-orange-600">
                    {thisMonthInvoices.filter(inv => inv.paymentStatus !== 'paid').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Order Value</span>
                  <span className="font-semibold">
                    {formatCurrency(thisMonthInvoices.length > 0 ? thisMonthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0) / thisMonthInvoices.length : 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            {lowStockProducts.length > 0 && <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-800 text-base">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Low Stock ({lowStockProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockProducts.slice(0, 3).map(product => <div key={product.id} className="flex justify-between items-center text-sm">
                    <span className="font-medium truncate max-w-[120px]">{product.name}</span>
                    <Badge variant="outline" className="text-orange-700 border-orange-300">
                      {product.stock} left
                    </Badge>
                  </div>)}
                  {lowStockProducts.length > 3 && <p className="text-xs text-orange-600 pt-2">
                    + {lowStockProducts.length - 3} more
                  </p>}
                </div>
              </CardContent>
            </Card>}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {thisMonthInvoices.slice(-5).map(invoice => <div key={invoice.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <div className="truncate">
                        <p className="text-sm font-medium truncate">
                          {invoice.customerName}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium">{formatCurrency(invoice.totalAmount)}</p>
                    </div>
                  </div>)}
                  {thisMonthInvoices.length === 0 && <p className="text-center text-gray-500 py-4 text-sm">
                    No recent activity
                  </p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </div>;
}
