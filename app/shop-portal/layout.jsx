"use client";

import { ProtectedRoute } from "@/components/protected-route";
export default function ShopPortalLayout({
  children
}) {
  return <ProtectedRoute allowedRoles={['admin', 'manager']}>
      {children}
    </ProtectedRoute>;
}
