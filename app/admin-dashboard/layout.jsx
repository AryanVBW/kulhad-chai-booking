"use client";

import { ProtectedRoute } from "@/components/protected-route";
export default function AdminLayout({
  children
}) {
  return <ProtectedRoute adminOnly={true}>
      {children}
    </ProtectedRoute>;
}
