"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
export function ProtectedRoute({
  children,
  adminOnly = false,
  allowedRoles
}) {
  const {
    user,
    isLoading
  } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Determine which login page to redirect to based on current path
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/shop-portal')) {
          router.push('/shop-portal/login');
        } else {
          router.push('/admin/login');
        }
        return;
      }

      // Check if admin access is required
      if (adminOnly) {
        const isAdmin = user.user_metadata?.role === 'admin' || user.email === 'admin@kulhadchai.shop';
        if (!isAdmin) {
          // Redirect to appropriate login page
          const currentPath = window.location.pathname;
          if (currentPath.startsWith('/shop-portal')) {
            router.push('/shop-portal/login');
          } else {
            router.push('/admin/login');
          }
          return;
        }
      }

      // Check if specific roles are allowed
      if (allowedRoles && allowedRoles.length > 0) {
        const userRole = user.user_metadata?.role;
        const hasAccess = allowedRoles.includes(userRole) || userRole === 'admin' && user.email === 'admin@kulhadchai.shop' || userRole === 'manager' && user.email === 'shop@kulhadchai.shop';
        if (!hasAccess) {
          // Redirect to appropriate login page
          const currentPath = window.location.pathname;
          if (currentPath.startsWith('/shop-portal')) {
            router.push('/shop-portal/login');
          } else {
            router.push('/admin/login');
          }
          return;
        }
      }
      setIsChecking(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading]);
  if (isLoading || isChecking) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>;
  }
  if (!user) {
    return null; // Will redirect to login
  }
  return <>{children}</>;
}
