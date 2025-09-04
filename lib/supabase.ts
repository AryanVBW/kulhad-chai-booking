import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Database types
export type Database = {
  public: {
    Tables: {
      menu_items: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          category: string
          image: string | null
          available: boolean
          preparation_time: number
          is_combo: boolean
          combo_items: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          category: string
          image?: string | null
          available?: boolean
          preparation_time?: number
          is_combo?: boolean
          combo_items?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          category?: string
          image?: string | null
          available?: boolean
          preparation_time?: number
          is_combo?: boolean
          combo_items?: string[] | null
          updated_at?: string
        }
      }
      tables: {
        Row: {
          id: string
          number: number
          capacity: number
          status: 'available' | 'occupied' | 'reserved' | 'cleaning'
          qr_code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          number: number
          capacity: number
          status?: 'available' | 'occupied' | 'reserved' | 'cleaning'
          qr_code: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          number?: number
          capacity?: number
          status?: 'available' | 'occupied' | 'reserved' | 'cleaning'
          qr_code?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          table_id: string
          customer_name: string | null
          customer_phone: string | null
          status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled'
          total_amount: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          table_id: string
          customer_name?: string | null
          customer_phone?: string | null
          status?: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled'
          total_amount: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          table_id?: string
          customer_name?: string | null
          customer_phone?: string | null
          status?: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled'
          total_amount?: number
          notes?: string | null
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string
          quantity: number
          price: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          menu_item_id: string
          quantity: number
          price: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          menu_item_id?: string
          quantity?: number
          price?: number
          notes?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}