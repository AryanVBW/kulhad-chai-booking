"use client"

import { ProtectedRoute } from "@/components/protected-route"

interface ShopPortalLayoutProps {
  children: React.ReactNode
}

export default function ShopPortalLayout({ children }: ShopPortalLayoutProps) {
  return (
    <ProtectedRoute adminOnly={true}>
      {children}
    </ProtectedRoute>
  )
}