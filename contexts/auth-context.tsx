"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'staff'
  permissions: {
    customers: { read: boolean; write: boolean; delete: boolean }
    products: { read: boolean; write: boolean; delete: boolean }
    invoices: { read: boolean; write: boolean; delete: boolean }
    payments: { read: boolean; write: boolean; delete: boolean }
    reports: { read: boolean; write: boolean; delete: boolean }
    users: { read: boolean; write: boolean; delete: boolean }
  }
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing user session
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Get user role from metadata or default to admin
        const userRole = user.user_metadata?.role || 'admin'
        const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User'
        
        // Set permissions based on role
        const getPermissions = (role: string) => {
          switch (role) {
            case 'admin':
              return {
                customers: { read: true, write: true, delete: true },
                products: { read: true, write: true, delete: true },
                invoices: { read: true, write: true, delete: true },
                payments: { read: true, write: true, delete: true },
                reports: { read: true, write: true, delete: true },
                users: { read: true, write: true, delete: true }
              }
            case 'manager':
              return {
                customers: { read: true, write: true, delete: false },
                products: { read: true, write: true, delete: false },
                invoices: { read: true, write: true, delete: false },
                payments: { read: true, write: false, delete: false },
                reports: { read: true, write: false, delete: false },
                users: { read: true, write: false, delete: false }
              }
            case 'staff':
              return {
                customers: { read: true, write: false, delete: false },
                products: { read: true, write: false, delete: false },
                invoices: { read: true, write: false, delete: false },
                payments: { read: false, write: false, delete: false },
                reports: { read: false, write: false, delete: false },
                users: { read: false, write: false, delete: false }
              }
            default:
              return {
                customers: { read: false, write: false, delete: false },
                products: { read: false, write: false, delete: false },
                invoices: { read: false, write: false, delete: false },
                payments: { read: false, write: false, delete: false },
                reports: { read: false, write: false, delete: false },
                users: { read: false, write: false, delete: false }
              }
          }
        }
        
        const authUser: User = {
          id: user.id,
          name: userName,
          email: user.email || '',
          role: userRole as 'admin' | 'manager' | 'staff',
          permissions: getPermissions(userRole)
        }
        setUser(authUser)
      }
      setIsLoading(false)
    }
    
    checkUser()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('Login error:', error)
        setIsLoading(false)
        return false
      }
      
      if (data.user) {
        // Get user role from metadata or default to admin
        const userRole = data.user.user_metadata?.role || 'admin'
        const userName = data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User'
        
        // Set permissions based on role (reuse the same logic)
        const getPermissions = (role: string) => {
          switch (role) {
            case 'admin':
              return {
                customers: { read: true, write: true, delete: true },
                products: { read: true, write: true, delete: true },
                invoices: { read: true, write: true, delete: true },
                payments: { read: true, write: true, delete: true },
                reports: { read: true, write: true, delete: true },
                users: { read: true, write: true, delete: true }
              }
            case 'manager':
              return {
                customers: { read: true, write: true, delete: false },
                products: { read: true, write: true, delete: false },
                invoices: { read: true, write: true, delete: false },
                payments: { read: true, write: false, delete: false },
                reports: { read: true, write: false, delete: false },
                users: { read: true, write: false, delete: false }
              }
            case 'staff':
              return {
                customers: { read: true, write: false, delete: false },
                products: { read: true, write: false, delete: false },
                invoices: { read: true, write: false, delete: false },
                payments: { read: false, write: false, delete: false },
                reports: { read: false, write: false, delete: false },
                users: { read: false, write: false, delete: false }
              }
            default:
              return {
                customers: { read: false, write: false, delete: false },
                products: { read: false, write: false, delete: false },
                invoices: { read: false, write: false, delete: false },
                payments: { read: false, write: false, delete: false },
                reports: { read: false, write: false, delete: false },
                users: { read: false, write: false, delete: false }
              }
          }
        }
        
        const authUser: User = {
          id: data.user.id,
          name: userName,
          email: data.user.email || '',
          role: userRole as 'admin' | 'manager' | 'staff',
          permissions: getPermissions(userRole)
        }
        setUser(authUser)
        setIsLoading(false)
        return true
      }
      
      setIsLoading(false)
      return false
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
      return false
    }
  }

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    
    // Redirect to appropriate login page based on current path
    const currentPath = window.location.pathname
    if (currentPath.startsWith('/shop-portal')) {
      router.push('/shop-portal/login')
    } else {
      router.push('/admin/login')
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}