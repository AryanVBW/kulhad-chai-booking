"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Clock,
  Star,
  Calendar,
  Download,
  Filter,
} from "lucide-react"
import type { Order, Bill, MenuItem, Table } from "@/lib/types"
import { getOrders, getBills, getMenuItems, getTables } from "@/lib/store"

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days ago
    end: new Date().toISOString().split("T")[0], // today
  })
  const [selectedMetric, setSelectedMetric] = useState<string>("revenue")

  useEffect(() => {
    setOrders(getOrders())
    setBills(getBills())
    setMenuItems(getMenuItems())
    setTables(getTables())
  }, [])

  // Filter data by date range
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt).toDateString()
      const startDate = new Date(dateRange.start).toDateString()
      const endDate = new Date(dateRange.end).toDateString()
      return orderDate >= startDate && orderDate <= endDate
    })
  }, [orders, dateRange])

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const billDate = new Date(bill.createdAt).toDateString()
      const startDate = new Date(dateRange.start).toDateString()
      const endDate = new Date(dateRange.end).toDateString()
      return billDate >= startDate && billDate <= endDate
    })
  }, [bills, dateRange])

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalRevenue = filteredBills.reduce((sum, bill) => sum + bill.total, 0)
    const totalOrders = filteredOrders.length
    const completedOrders = filteredOrders.filter((order) => order.status === "completed").length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Calculate growth compared to previous period
    const periodDays = Math.ceil(
      (new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) / (1000 * 60 * 60 * 24),
    )
    const previousStart = new Date(new Date(dateRange.start).getTime() - periodDays * 24 * 60 * 60 * 1000)
    const previousEnd = new Date(dateRange.start)

    const previousOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= previousStart && orderDate < previousEnd
    })

    const previousBills = bills.filter((bill) => {
      const billDate = new Date(bill.createdAt)
      return billDate >= previousStart && billDate < previousEnd
    })

    const previousRevenue = previousBills.reduce((sum, bill) => sum + bill.total, 0)
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0

    return {
      totalRevenue,
      totalOrders,
      completedOrders,
      averageOrderValue,
      revenueGrowth,
      completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
    }
  }, [filteredOrders, filteredBills, orders, bills, dateRange])

  // Daily revenue chart data
  const dailyRevenueData = useMemo(() => {
    const dailyData: { [key: string]: number } = {}

    filteredBills.forEach((bill) => {
      const date = new Date(bill.createdAt).toISOString().split("T")[0]
      dailyData[date] = (dailyData[date] || 0) + bill.total
    })

    return Object.entries(dailyData)
      .map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [filteredBills])

  // Popular items analysis
  const popularItems = useMemo(() => {
    const itemCounts: { [key: string]: { count: number; revenue: number; name: string } } = {}

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const menuItem = menuItems.find((mi) => mi.id === item.menuItemId)
        if (menuItem) {
          if (!itemCounts[item.menuItemId]) {
            itemCounts[item.menuItemId] = { count: 0, revenue: 0, name: menuItem.name }
          }
          itemCounts[item.menuItemId].count += item.quantity
          itemCounts[item.menuItemId].revenue += item.price * item.quantity
        }
      })
    })

    return Object.entries(itemCounts)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [filteredOrders, menuItems])

  // Table utilization data
  const tableUtilization = useMemo(() => {
    const tableUsage: { [key: string]: number } = {}

    filteredOrders.forEach((order) => {
      const table = tables.find((t) => t.id === order.tableId)
      if (table) {
        tableUsage[`Table ${table.number}`] = (tableUsage[`Table ${table.number}`] || 0) + 1
      }
    })

    return Object.entries(tableUsage).map(([table, orders]) => ({ table, orders }))
  }, [filteredOrders, tables])

  // Order status distribution
  const orderStatusData = useMemo(() => {
    const statusCounts: { [key: string]: number } = {}

    filteredOrders.forEach((order) => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
    })

    return Object.entries(statusCounts).map(([status, count]) => ({ status, count }))
  }, [filteredOrders])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  const exportReport = () => {
    const reportData = {
      dateRange,
      metrics,
      dailyRevenue: dailyRevenueData,
      popularItems,
      tableUtilization,
      orderStatus: orderStatusData,
      generatedAt: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `analytics-report-${dateRange.start}-to-${dateRange.end}.json`
    link.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Analytics & Reports</h1>
          <p className="text-purple-100">Business insights and performance metrics</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-40"
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-40"
                />
              </div>
              <div>
                <Label htmlFor="metric">Primary Metric</Label>
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="orders">Orders</SelectItem>
                    <SelectItem value="customers">Customers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={exportReport} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-800">₹{Math.round(metrics.totalRevenue)}</p>
                  <div className="flex items-center mt-2">
                    {metrics.revenueGrowth >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        metrics.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {Math.abs(metrics.revenueGrowth).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Orders</p>
                  <p className="text-3xl font-bold text-blue-800">{metrics.totalOrders}</p>
                  <p className="text-sm text-blue-600 mt-2">{metrics.completedOrders} completed</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Avg Order Value</p>
                  <p className="text-3xl font-bold text-orange-800">₹{Math.round(metrics.averageOrderValue)}</p>
                  <p className="text-sm text-orange-600 mt-2">Per transaction</p>
                </div>
                <Star className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Completion Rate</p>
                  <p className="text-3xl font-bold text-purple-800">{metrics.completionRate.toFixed(1)}%</p>
                  <p className="text-sm text-purple-600 mt-2">Order success</p>
                </div>
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value}`, "Revenue"]} />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Items */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularItems.slice(0, 8).map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.count} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{item.revenue}</p>
                      <p className="text-sm text-gray-600">revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Table Utilization */}
          <Card>
            <CardHeader>
              <CardTitle>Table Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tableUtilization}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="table" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}`, "Orders"]} />
                  <Bar dataKey="orders" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Summary Report */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Period Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Performance Highlights</h4>
                <ul className="space-y-2 text-sm">
                  <li>• {metrics.totalOrders} total orders processed</li>
                  <li>• ₹{Math.round(metrics.totalRevenue)} in total revenue</li>
                  <li>• {metrics.completionRate.toFixed(1)}% order completion rate</li>
                  <li>• ₹{Math.round(metrics.averageOrderValue)} average order value</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Top Performers</h4>
                <ul className="space-y-2 text-sm">
                  {popularItems.slice(0, 3).map((item, index) => (
                    <li key={item.id}>
                      • #{index + 1} {item.name} ({item.count} orders)
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Insights</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    • Revenue {metrics.revenueGrowth >= 0 ? "increased" : "decreased"} by{" "}
                    {Math.abs(metrics.revenueGrowth).toFixed(1)}%
                  </li>
                  <li>• Most active table: {tableUtilization[0]?.table || "N/A"}</li>
                  <li>• Peak performance on weekends</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
