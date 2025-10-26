"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Lazy load heavy admin components
const AdminDashboard = dynamic(() => import('@/app/admin-dashboard/page'), {
  loading: () => <AdminDashboardSkeleton />,
  ssr: false
});
const AdminProducts = dynamic(() => import('@/app/admin-dashboard/products/page'), {
  loading: () => <AdminProductsSkeleton />,
  ssr: false
});
const AdminUsers = dynamic(() => import('@/app/admin-dashboard/users/page'), {
  loading: () => <AdminUsersSkeleton />,
  ssr: false
});
const AnalyticsDashboard = dynamic(() => import('@/app/analytics-dashboard/page'), {
  loading: () => <AnalyticsDashboardSkeleton />,
  ssr: false
});

// Loading skeletons for admin components
function AdminDashboardSkeleton() {
  return <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar Skeleton */}
        <div className="w-64 bg-sidebar min-h-screen">
          <div className="p-6">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="px-4 space-y-2">
            {Array.from({
            length: 6
          }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 p-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({
            length: 4
          }).map((_, i) => <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>)}
          </div>

          {/* Quick Actions Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.from({
            length: 6
          }).map((_, i) => <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>)}
          </div>
        </div>
      </div>
    </div>;
}
function AdminProductsSkeleton() {
  return <div className="min-h-screen bg-background">
      <div className="flex">
        <div className="w-64 bg-sidebar min-h-screen">
          <div className="p-6">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {Array.from({
            length: 4
          }).map((_, i) => <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>)}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>;
}
function AdminUsersSkeleton() {
  return <div className="min-h-screen bg-background">
      <div className="flex">
        <div className="w-64 bg-sidebar min-h-screen">
          <div className="p-6">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="space-y-4">
            {Array.from({
            length: 5
          }).map((_, i) => <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </div>
    </div>;
}
function AnalyticsDashboardSkeleton() {
  return <div className="min-h-screen bg-background">
      <div className="flex">
        <div className="w-64 bg-sidebar min-h-screen">
          <div className="p-6">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {Array.from({
            length: 4
          }).map((_, i) => <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({
            length: 4
          }).map((_, i) => <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>)}
          </div>
        </div>
      </div>
    </div>;
}
export { AdminDashboard, AdminProducts, AdminUsers, AnalyticsDashboard, AdminDashboardSkeleton, AdminProductsSkeleton, AdminUsersSkeleton, AnalyticsDashboardSkeleton };
