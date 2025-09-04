"use client"

import { AuthProvider } from "@/contexts/auth-context"

interface AdminAuthLayoutProps {
  children: React.ReactNode
}

export default function AdminAuthLayout({ children }: AdminAuthLayoutProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}