// Local storage utilities for restaurant data

import type { MenuItem, Table, Order, Bill } from "./types"
import { initialMenuItems, initialTables } from "./data"

const STORAGE_KEYS = {
  MENU_ITEMS: "restaurant_menu_items",
  TABLES: "restaurant_tables",
  ORDERS: "restaurant_orders",
  BILLS: "restaurant_bills",
}

// Menu Items
export const getMenuItems = (): MenuItem[] => {
  if (typeof window === "undefined") return initialMenuItems
  const stored = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS)
  return stored ? JSON.parse(stored) : initialMenuItems
}

export const saveMenuItems = (items: MenuItem[]): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(items))
  }
}

// Tables
export const getTables = (): Table[] => {
  if (typeof window === "undefined") return initialTables
  const stored = localStorage.getItem(STORAGE_KEYS.TABLES)
  return stored ? JSON.parse(stored) : initialTables
}

export const saveTables = (tables: Table[]): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables))
  }
}

// Orders
export const getOrders = (): Order[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEYS.ORDERS)
  return stored
    ? JSON.parse(stored).map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
      }))
    : []
}

export const saveOrders = (orders: Order[]): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
  }
}

// Bills
export const getBills = (): Bill[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEYS.BILLS)
  return stored
    ? JSON.parse(stored).map((bill: any) => ({
        ...bill,
        createdAt: new Date(bill.createdAt),
        paidAt: bill.paidAt ? new Date(bill.paidAt) : undefined,
      }))
    : []
}

export const saveBills = (bills: Bill[]): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills))
  }
}

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const calculateTax = (amount: number, taxRate = 0.18): number => {
  return Math.round(amount * taxRate * 100) / 100
}
