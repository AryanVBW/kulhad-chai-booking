"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authenticateUser, logoutUser, getCurrentUser } from '@/lib/business-store'

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
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      const authenticatedUser = authenticateUser(email, password)
      if (authenticatedUser) {
        setUser(authenticatedUser)
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

  const logout = () => {
    logoutUser()
    setUser(null)
    router.push('/admin/login')
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