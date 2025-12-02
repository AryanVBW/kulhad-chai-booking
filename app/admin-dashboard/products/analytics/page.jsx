"use client";

import { useMemo, useState } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, TrendingUp, Award, ShoppingCart } from "lucide-react";
import { useMultipleCachedData } from "@/lib/supabase-service-cached";
import { getProducts, getInvoices } from "@/lib/supabase-service-cached";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function ProductAnalyticsPage() {
    const { data, loading } = useMultipleCachedData([
        { cacheType: 'products', fetchFunction: getProducts },
        { cacheType: 'invoices', fetchFunction: getInvoices },
    ]);

    const [sortBy, setSortBy] = useState("revenue"); // revenue, quantity

    const products = data.products || [];
    const invoices = data.invoices || [];

    const metrics = useMemo(() => {
        // Calculate sales per product
        const productStats = {};
        let totalProductsSold = 0;

        invoices.forEach(inv => {
            if (!inv.items) return;
            // Parse items if it's a string (legacy data) or use directly if array
            let items = [];
            try {
                items = typeof inv.items === 'string' ? JSON.parse(inv.items) : inv.items;
            } catch (e) {
                console.error("Error parsing invoice items", e);
            }

            if (Array.isArray(items)) {
                items.forEach(item => {
                    const productId = item.id || item.productId; // Handle different data structures
                    if (!productId) return;

                    if (!productStats[productId]) {
                        productStats[productId] = {
                            id: productId,
                            name: item.name || "Unknown Product",
                            quantity: 0,
                            revenue: 0,
                            category: "Uncategorized"
                        };

                        // Try to find category from products list
                        const productDef = products.find(p => p.id === productId || p.id === Number(productId));
                        if (productDef) {
                            productStats[productId].name = productDef.name;
                            productStats[productId].category = productDef.category || "Uncategorized";
                        }
                    }

                    const qty = Number(item.quantity || 0);
                    const price = Number(item.price || 0);

                    productStats[productId].quantity += qty;
                    productStats[productId].revenue += (qty * price);
                    totalProductsSold += qty;
                });
            }
        });

        const productList = Object.values(productStats);

        // Best Selling Product
        const bestSeller = [...productList].sort((a, b) => b.quantity - a.quantity)[0];

        // Sales by Category
        const categoryStats = {};
        productList.forEach(p => {
            if (!categoryStats[p.category]) {
                categoryStats[p.category] = 0;
            }
            categoryStats[p.category] += p.revenue;
        });

        const categoryData = Object.entries(categoryStats)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        const topCategory = categoryData.length > 0 ? categoryData[0] : null;

        // Top Products Chart
        const topProductsData = [...productList]
            .sort((a, b) => b[sortBy] - a[sortBy])
            .slice(0, 10);

        return { totalProductsSold, bestSeller, topCategory, categoryData, topProductsData, productList };
    }, [products, invoices, sortBy]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="flex">
                <AdminSidebar />
                <div className="flex-1 p-8">
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-2">
                            <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                        </div>
                        <h1 className="text-3xl font-bold">Product Performance</h1>
                        <p className="text-muted-foreground">Analyze sales, revenue, and popularity of your menu items</p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Items Sold</CardTitle>
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.totalProductsSold}</div>
                                <p className="text-xs text-muted-foreground">Across all orders</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                                <Package className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold truncate">{metrics.topCategory?.name || "-"}</div>
                                <p className="text-xs text-muted-foreground">
                                    {metrics.topCategory ? formatCurrency(metrics.topCategory.value) : "No sales"}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Best Seller</CardTitle>
                                <Award className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold truncate">{metrics.bestSeller?.name || "-"}</div>
                                <p className="text-xs text-muted-foreground">
                                    {metrics.bestSeller ? `${metrics.bestSeller.quantity} sold` : "No sales"}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Revenue by Category</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={metrics.categoryData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {metrics.categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => formatCurrency(value)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="col-span-1">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Top 10 Products</CardTitle>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-[120px] h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="revenue">By Revenue</SelectItem>
                                        <SelectItem value="quantity">By Quantity</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={metrics.topProductsData} layout="vertical" margin={{ left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                                            <Tooltip formatter={(value) => sortBy === 'revenue' ? formatCurrency(value) : value} />
                                            <Bar dataKey={sortBy} fill="#8884d8" radius={[0, 4, 4, 0]}>
                                                {metrics.topProductsData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Performance Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="max-h-[400px] overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product Name</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead className="text-right">Quantity Sold</TableHead>
                                            <TableHead className="text-right">Total Revenue</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {metrics.productList.sort((a, b) => b.revenue - a.revenue).map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell className="font-medium">{product.name}</TableCell>
                                                <TableCell>{product.category}</TableCell>
                                                <TableCell className="text-right">{product.quantity}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(product.revenue)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
