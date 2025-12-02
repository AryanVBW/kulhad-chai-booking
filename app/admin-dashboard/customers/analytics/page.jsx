"use client";

import { useMemo } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, UserPlus, UserCheck, Wallet, TrendingUp } from "lucide-react";
import { useMultipleCachedData } from "@/lib/supabase-service-cached";
import { getCustomers, getInvoices } from "@/lib/supabase-service-cached";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { format, subDays, startOfMonth, isAfter, parseISO } from "date-fns";

export default function CustomerAnalyticsPage() {
    const { data, loading } = useMultipleCachedData([
        { cacheType: 'customers', fetchFunction: getCustomers },
        { cacheType: 'invoices', fetchFunction: getInvoices },
    ]);

    const customers = data.customers || [];
    const invoices = data.invoices || [];

    const metrics = useMemo(() => {
        const now = new Date();
        const startOfThisMonth = startOfMonth(now);
        const thirtyDaysAgo = subDays(now, 30);

        const totalCustomers = customers.length;

        const newCustomers = customers.filter(c => {
            if (!c.createdAt) return false;
            return isAfter(new Date(c.createdAt), startOfThisMonth);
        }).length;

        // Active customers: those who placed an order in the last 30 days
        const activeCustomerIds = new Set(
            invoices
                .filter(inv => isAfter(new Date(inv.createdAt), thirtyDaysAgo))
                .map(inv => inv.customerId)
        );
        const activeCustomers = activeCustomerIds.size;

        // LTV Calculation
        const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
        const averageLTV = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

        // Customer Growth Chart Data (Cumulative)
        // Group customers by creation date
        const customersByDate = {};
        customers.forEach(c => {
            if (!c.createdAt) return;
            const dateStr = format(new Date(c.createdAt), 'yyyy-MM-dd');
            customersByDate[dateStr] = (customersByDate[dateStr] || 0) + 1;
        });

        const sortedDates = Object.keys(customersByDate).sort();
        let cumulativeCount = 0;
        const growthData = sortedDates.map(date => {
            cumulativeCount += customersByDate[date];
            return {
                date: format(parseISO(date), 'MMM dd'),
                count: cumulativeCount
            };
        });

        // Top Spenders Chart Data
        const spendByCustomer = {};
        invoices.forEach(inv => {
            if (!inv.customerId) return;
            spendByCustomer[inv.customerId] = (spendByCustomer[inv.customerId] || 0) + (inv.totalAmount || 0);
        });

        const topSpendersData = Object.entries(spendByCustomer)
            .map(([id, spend]) => {
                const customer = customers.find(c => c.id === id || c.id === Number(id));
                return {
                    name: customer?.name || `ID: ${id}`,
                    spend: spend
                };
            })
            .sort((a, b) => b.spend - a.spend)
            .slice(0, 5);

        return { totalCustomers, newCustomers, activeCustomers, averageLTV, growthData, topSpendersData };
    }, [customers, invoices]);

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
                        <h1 className="text-3xl font-bold">Customer Analytics</h1>
                        <p className="text-muted-foreground">Insights into customer growth, retention, and value</p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.totalCustomers}</div>
                                <p className="text-xs text-muted-foreground">All time</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">New (This Month)</CardTitle>
                                <UserPlus className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.newCustomers}</div>
                                <p className="text-xs text-muted-foreground">Joined this month</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active (30 Days)</CardTitle>
                                <UserCheck className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.activeCustomers}</div>
                                <p className="text-xs text-muted-foreground">Placed order recently</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg Lifetime Value</CardTitle>
                                <Wallet className="h-4 w-4 text-purple-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(metrics.averageLTV)}</div>
                                <p className="text-xs text-muted-foreground">Revenue per customer</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Customer Growth</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={metrics.growthData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Total Customers" dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Top 5 Spenders</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={metrics.topSpendersData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" width={100} />
                                            <Tooltip formatter={(value) => formatCurrency(value)} />
                                            <Legend />
                                            <Bar dataKey="spend" fill="#10b981" name="Total Spend" radius={[0, 4, 4, 0]} />
                                        </BarChart>
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
