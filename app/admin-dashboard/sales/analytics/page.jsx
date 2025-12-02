"use client";

import { useMemo } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, DollarSign, TrendingUp, Activity } from "lucide-react";
import { useMultipleCachedData } from "@/lib/supabase-service-cached";
import { getInvoices } from "@/lib/supabase-service-cached";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, getHours, parseISO } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function SalesAnalyticsPage() {
    const { data, loading } = useMultipleCachedData([
        { cacheType: 'invoices', fetchFunction: getInvoices },
    ]);

    const invoices = data.invoices || [];

    const metrics = useMemo(() => {
        const totalSalesCount = invoices.length;
        const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
        const averageTransactionValue = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;
        const highestSale = invoices.reduce((max, inv) => Math.max(max, inv.totalAmount || 0), 0);

        // Hourly Sales Distribution
        const hourlyData = Array(24).fill(0).map((_, i) => ({ hour: i, count: 0, revenue: 0 }));
        invoices.forEach(inv => {
            const date = new Date(inv.createdAt);
            const hour = getHours(date);
            hourlyData[hour].count += 1;
            hourlyData[hour].revenue += (inv.totalAmount || 0);
        });

        const hourlyChartData = hourlyData.map(d => ({
            time: `${d.hour}:00`,
            count: d.count,
            revenue: d.revenue
        }));

        // Daily Sales Trend (Current Month)
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);
        const daysInMonth = eachDayOfInterval({ start, end });

        const dailyData = daysInMonth.map(date => {
            const dayInvoices = invoices.filter(inv =>
                isWithinInterval(new Date(inv.createdAt), {
                    start: new Date(date.setHours(0, 0, 0, 0)),
                    end: new Date(date.setHours(23, 59, 59, 999))
                })
            );

            return {
                date: format(date, 'MMM dd'),
                sales: dayInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
                count: dayInvoices.length
            };
        });

        // Recent Transactions
        const recentTransactions = [...invoices]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);

        return {
            totalSalesCount,
            averageTransactionValue,
            highestSale,
            hourlyChartData,
            dailyData,
            recentTransactions
        };
    }, [invoices]);

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
                        <h1 className="text-3xl font-bold">Sales Analytics</h1>
                        <p className="text-muted-foreground">Deep dive into your sales performance and trends</p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Sales Count</CardTitle>
                                <Activity className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.totalSalesCount}</div>
                                <p className="text-xs text-muted-foreground">Lifetime orders</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg Transaction Value</CardTitle>
                                <CreditCard className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(metrics.averageTransactionValue)}</div>
                                <p className="text-xs text-muted-foreground">Per order average</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Highest Sale</CardTitle>
                                <TrendingUp className="h-4 w-4 text-purple-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(metrics.highestSale)}</div>
                                <p className="text-xs text-muted-foreground">Single largest order</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Hourly Sales Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={metrics.hourlyChartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="time" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#3b82f6" name="Orders" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Daily Sales Trend (This Month)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={metrics.dailyData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => formatCurrency(value)} />
                                            <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} name="Sales" dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Transactions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="max-h-[400px] overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order ID</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {metrics.recentTransactions.map((inv) => (
                                            <TableRow key={inv.id}>
                                                <TableCell className="font-medium">#{inv.id}</TableCell>
                                                <TableCell>{format(new Date(inv.createdAt), 'MMM dd, HH:mm')}</TableCell>
                                                <TableCell>{inv.customerName || 'Walk-in'}</TableCell>
                                                <TableCell>
                                                    <Badge variant={inv.status === 'paid' ? 'default' : 'secondary'}>
                                                        {inv.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-bold">{formatCurrency(inv.totalAmount)}</TableCell>
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
