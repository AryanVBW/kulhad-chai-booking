"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Users,
  Package,
  FileText,
  CreditCard,
  Receipt,
  Settings,
  Shield,
  Activity,
  ArrowLeft,
  ShoppingCart,
  LogOut,
  User,
  QrCode,
  Menu,
  Coffee
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface AdminSidebarProps {
  title?: string
  subtitle?: string
}

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  isActive?: boolean
}

function UserInfo() {
  const { user, logout } = useAuth()

  if (!user) return null

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default'
      case 'manager': return 'secondary'
      case 'staff': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 p-2 rounded-lg bg-sidebar-accent/50">
        <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-sidebar-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-sidebar-foreground truncate">
            {user.name}
          </p>
          <div className="flex items-center space-x-1">
            <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
              {user.role}
            </Badge>
          </div>
        </div>
      </div>
      
      <Button
        onClick={logout}
        variant="ghost"
        className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-red-600"
      >
        <LogOut className="mr-3 h-4 w-4" />
        Logout
      </Button>
    </div>
  )
}

export function AdminSidebar({ title = "Business Admin", subtitle = "Kulhad Chai Management" }: AdminSidebarProps) {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      href: "/admin-dashboard",
      label: "Dashboard",
      icon: TrendingUp,
      isActive: pathname === "/admin-dashboard"
    },
    {
      href: "/admin-dashboard/customers",
      label: "Customers",
      icon: Users,
      isActive: pathname === "/admin-dashboard/customers"
    },
    {
      href: "/admin-dashboard/products",
      label: "Products",
      icon: Package,
      isActive: pathname === "/admin-dashboard/products"
    },
    {
      href: "/admin-dashboard/invoices",
      label: "Invoices",
      icon: FileText,
      isActive: pathname === "/admin-dashboard/invoices"
    },
    {
      href: "/admin-dashboard/payments",
      label: "Payments",
      icon: CreditCard,
      isActive: pathname === "/admin-dashboard/payments"
    },
    {
      href: "/analytics-dashboard",
      label: "Analytics",
      icon: TrendingUp,
      isActive: pathname === "/analytics-dashboard"
    },
    {
      href: "/admin-dashboard/reports",
      label: "Reports",
      icon: FileText,
      isActive: pathname === "/admin-dashboard/reports"
    },
    {
      href: "/admin-dashboard/users",
      label: "User Management",
      icon: Shield,
      isActive: pathname === "/admin-dashboard/users"
    },
    {
      href: "/admin-dashboard/orders",
      label: "Orders Management",
      icon: ShoppingCart,
      isActive: pathname === "/admin-dashboard/orders"
    },
    {
      href: "/admin-dashboard/tables",
      label: "Tables & QR Codes",
      icon: QrCode,
      isActive: pathname === "/admin-dashboard/tables"
    },
    {
      href: "/admin-dashboard/menu",
      label: "Menu Management",
      icon: Menu,
      isActive: pathname === "/admin-dashboard/menu"
    },
    {
      href: "/admin-dashboard/custom-bills",
      label: "Custom Bills",
      icon: Receipt,
      isActive: pathname === "/admin-dashboard/custom-bills"
    },
    {
      href: "/admin-dashboard/bill-settings",
      label: "Bill Settings",
      icon: Settings,
      isActive: pathname === "/admin-dashboard/bill-settings"
    }
  ]

  return (
    <div className="w-64 bg-sidebar text-sidebar-foreground min-h-screen">
      {/* Header with Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3 mb-3">
          <Image
            src="/logo_with_name.png"
            alt="Kulhad Chai Restaurant"
            width={100}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </div>
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-sm text-sidebar-foreground/70">{subtitle}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={item.isActive ? "default" : "ghost"}
                className={`w-full justify-start ${
                  item.isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* User Info and Actions */}
      <div className="px-4 py-4 mt-auto border-t border-sidebar-border space-y-3">
        {/* Current User Info */}
        <UserInfo />
        
        {/* Back to Main Site */}
        <Link href="/">
          <Button
            variant="outline"
            className="w-full justify-start text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent"
          >
            <ArrowLeft className="mr-3 h-4 w-4" />
            Back to Menu
          </Button>
        </Link>
      </div>
    </div>
  )
}