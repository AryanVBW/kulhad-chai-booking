"use client";

import { useMemo, useState } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react";
import { useMultipleCachedData } from "@/lib/supabase-service-cached";
import { getInvoices } from "@/lib/supabase-service-cached";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, isWithinInterval, subPeriods, subDays, subMonths, subYears } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function RevenueAnalyticsPage() {
    const { data, loading } = useMultipleCachedData([
        { cacheType: 'invoices', fetchFunction: getInvoices },
    ]);

    const [timeframe, setTimeframe] = useState("monthly"); // daily, weekly, monthly, yearly

    const invoices = data.invoices || [];

    const metrics = useMemo(() => {
        const now = new Date();
        let start, end, previousStart, previousEnd, dateFormat, intervalFunc;

        switch (timeframe) {
            case "daily":
                start = startOfWeek(now, { weekStartsOn: 1 });
                end = endOfWeek(now, { weekStartsOn: 1 });
                previousStart = startOfWeek(subDays(now, 7), { weekStartsOn: 1 });
                previousEnd = endOfWeek(subDays(now, 7), { weekStartsOn: 1 });
                dateFormat = 'EEE';
                intervalFunc = eachDayOfInterval;
                break;
            case "weekly":
                start = startOfMonth(now);
                end = endOfMonth(now);
                previousStart = startOfMonth(subMonths(now, 1));
                previousEnd = endOfMonth(subMonths(now, 1));
                dateFormat = 'dd MMM';
                intervalFunc = eachWeekOfInterval;
                break;
            case "monthly":
                start = startOfYear(now);
                end = endOfYear(now);
                previousStart = startOfYear(subYears(now, 1));
                previousEnd = endOfYear(subYears(now, 1));
                dateFormat = 'MMM';
                intervalFunc = eachMonthOfInterval;
                break;
            case "yearly":
                // Just show last 5 years for yearly view
                start = startOfYear(subYears(now, 4));
                end = endOfYear(now);
                previousStart = startOfYear(subYears(now, 9)); // Comparison bit tricky for yearly, maybe skip or compare to 5 years before
                previousEnd = endOfYear(subYears(now, 5));
                dateFormat = 'yyyy';
                intervalFunc = null; // Custom handling for years
                break;
            default:
                start = startOfYear(now);
                end = endOfYear(now);
                previousStart = startOfYear(subYears(now, 1));
                previousEnd = endOfYear(subYears(now, 1));
                dateFormat = 'MMM';
                intervalFunc = eachMonthOfInterval;
        }

        // Filter invoices for current period
        const currentPeriodInvoices = invoices.filter(inv =>
            isWithinInterval(new Date(inv.createdAt), { start, end })
        );

        // Filter invoices for previous period
        const previousPeriodInvoices = invoices.filter(inv =>
            isWithinInterval(new Date(inv.createdAt), { start: previousStart, end: previousEnd })
        );

        const totalRevenue = currentPeriodInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
        const previousRevenue = previousPeriodInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

        const growth = previousRevenue === 0 ? 100 : ((totalRevenue - previousRevenue) / previousRevenue) * 100;

        // Chart Data Construction
        let chartData = [];

        if (timeframe === 'yearly') {
            const years = [0, 1, 2, 3, 4].map(i => subYears(now, 4 - i));
            chartData = years.map(date => {
                const yearStart = startOfYear(date);
                const yearEnd = endOfYear(date);
                const revenue = invoices
                    .filter(inv => isWithinInterval(new Date(inv.createdAt), { start: yearStart, end: yearEnd }))
                    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
                return { date: format(date, 'yyyy'), revenue };
            });
        } else {
            const intervals = intervalFunc({ start, end });
            chartData = intervals.map(date => {
                let intervalStart, intervalEnd;
                if (timeframe === 'daily') {
                    intervalStart = startOfDay(date);
                    intervalEnd = endOfDay(date);
                } else if (timeframe === 'weekly') {
                    intervalStart = startOfWeek(date);
                    intervalEnd = endOfWeek(date);
                } else { // monthly
                    intervalStart = startOfMonth(date);
                    intervalEnd = endOfMonth(date);
                }

                const revenue = invoices
                    .filter(inv => isWithinInterval(new Date(inv.createdAt), { start: intervalStart, end: intervalEnd }))
                    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

                return { date: format(date, dateFormat), revenue };
            });
        }

        // Payment Method Breakdown (All Time or Current Period? Let's do Current Period)
        const paymentStats = {};
        currentPeriodInvoices.forEach(inv => {
            const method = inv.paymentMethod || 'Cash'; // Default to Cash if missing
            if (!paymentStats[method]) paymentStats[method] = 0;
            paymentStats[method] += (inv.totalAmount || 0);
        });

        const paymentData = Object.entries(paymentStats).map(([name, value]) => ({ name, value }));

        return { totalRevenue, growth, chartData, paymentData };
    }, [invoices, timeframe]);

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
                    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="flex items-center gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </Button>
                            </div>
                            <h1 className="text-3xl font-bold">Revenue Analytics</h1>
                            <p className="text-muted-foreground">Detailed breakdown of your earnings and trends</p>
                        </div>
                        <Tabs value={timeframe} onValueChange={setTimeframe} className="w-[400px]">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="daily">Daily</TabsTrigger>
                                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                                <TabsTrigger value="yearly">Yearly</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue ({timeframe})</CardTitle>
                                <DollarSign className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                    {metrics.growth >= 0 ? (
                                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                                    )}
                                    <span className={metrics.growth >= 0 ? "text-green-500" : "text-red-500"}>
                                        {Math.abs(metrics.growth).toFixed(1)}%
                                    </span>
                                    <span className="ml-1">from previous period</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Top Payment Method</CardTitle>
                                <CreditCard className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {metrics.paymentData.sort((a, b) => b.value - a.value)[0]?.name || "-"}
                                </div>
                                <p className="text-xs text-muted-foreground">Most used for this period</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <Card className="col-span-1 lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Revenue Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={metrics.chartData}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => formatCurrency(value)} />
                                            <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Payment Methods</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={metrics.paymentData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {metrics.paymentData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => formatCurrency(value)} />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
