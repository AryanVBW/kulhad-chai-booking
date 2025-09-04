"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
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
  ShoppingCart
} from "lucide-react"

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

      {/* Back to Main Site */}
      <div className="px-4 py-4 mt-auto border-t border-sidebar-border">
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