"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: {
    module: string
    permission: 'read' | 'write' | 'delete'
  }[]
}

export function ProtectedRoute({ children, requiredPermissions = [] }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/admin/login')
        return
      }

      // Check if user has required permissions
      if (requiredPermissions.length > 0) {
        const hasPermissions = requiredPermissions.every(({ module, permission }) => {
          const modulePermissions = user.permissions[module as keyof typeof user.permissions]
          return modulePermissions && modulePermissions[permission]
        })

        if (!hasPermissions) {
          router.push('/admin-dashboard') // Redirect to dashboard if no permissions
          return
        }
      }

      setIsChecking(false)
    }
  }, [user, isLoading, router, requiredPermissions])

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return <>{children}</>
}