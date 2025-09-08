import { supabase } from './supabase'
import { menuSyncService } from './menu-sync'
import type { MenuItem, Order, OrderItem, Table } from './types'

// Menu Items Operations
export const menuItemsService = {
  async getAll(): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching menu items:', error)
      throw error
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category as MenuItem['category'],
      image: item.image || undefined,
      available: item.available,
      preparationTime: item.preparation_time,
      isCombo: item.is_combo,
      comboItems: item.combo_items || undefined
    }))
  },

  async getById(id: string): Promise<MenuItem | null> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching menu item:', error)
      return null
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category as MenuItem['category'],
      image: data.image || undefined,
      available: data.available,
      preparationTime: data.preparation_time,
      isCombo: data.is_combo,
      comboItems: data.combo_items || undefined
    }
  },

  async create(item: Omit<MenuItem, 'id'>): Promise<MenuItem | null> {
    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        image: item.image,
        available: item.available,
        preparation_time: item.preparationTime,
        is_combo: item.isCombo,
        combo_items: item.comboItems
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating menu item:', error)
      throw error
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category as MenuItem['category'],
      image: data.image || undefined,
      available: data.available,
      preparationTime: data.preparation_time,
      isCombo: data.is_combo,
      comboItems: data.combo_items || undefined
    }
  },

  async update(id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
    const { data, error } = await supabase
      .from('menu_items')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.description && { description: updates.description }),
        ...(updates.price && { price: updates.price }),
        ...(updates.category && { category: updates.category }),
        ...(updates.image !== undefined && { image: updates.image }),
        ...(updates.available !== undefined && { available: updates.available }),
        ...(updates.preparationTime && { preparation_time: updates.preparationTime }),
        ...(updates.isCombo !== undefined && { is_combo: updates.isCombo }),
        ...(updates.comboItems !== undefined && { combo_items: updates.comboItems })
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating menu item:', error)
      throw error
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category as MenuItem['category'],
      image: data.image || undefined,
      available: data.available,
      preparationTime: data.preparation_time,
      isCombo: data.is_combo,
      comboItems: data.combo_items || undefined
    }
  }
}

// Tables Operations
export const tablesService = {
  async getAll(): Promise<Table[]> {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .order('number', { ascending: true })

    if (error) {
      console.error('Error fetching tables:', error)
      throw error
    }

    return data.map(table => ({
      id: table.id,
      number: table.number,
      capacity: table.capacity,
      status: table.status as Table['status'],
      qrCode: table.qr_code
    }))
  },

  async getById(id: string): Promise<Table | null> {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching table:', error)
      return null
    }

    return {
      id: data.id,
      number: data.number,
      capacity: data.capacity,
      status: data.status as Table['status'],
      qrCode: data.qr_code
    }
  },

  async updateStatus(id: string, status: Table['status']): Promise<Table | null> {
    const { data, error } = await supabase
      .from('tables')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating table status:', error)
      throw error
    }

    return {
      id: data.id,
      number: data.number,
      capacity: data.capacity,
      status: data.status as Table['status'],
      qrCode: data.qr_code
    }
  },

  async create(table: Omit<Table, 'id'>): Promise<Table> {
    const { data, error } = await supabase
      .from('tables')
      .insert({
        number: table.number,
        capacity: table.capacity,
        status: table.status,
        qr_code: table.qrCode
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating table:', error)
      throw error
    }

    return {
      id: data.id,
      number: data.number,
      capacity: data.capacity,
      status: data.status as Table['status'],
      qrCode: data.qr_code
    }
  }
}

// Orders Operations
export const ordersService = {
  async getAll(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          menu_item_id,
          quantity,
          price,
          notes
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      throw error
    }

    return data.map(order => ({
      id: order.id,
      tableId: order.table_id,
      items: order.order_items.map((item: any) => {
        // Keep the database UUID as menuItemId for proper lookup
        // The frontend will use this UUID to find menu items
        return {
          menuItemId: item.menu_item_id,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes || undefined
        }
      }),
      status: order.status as Order['status'],
      totalAmount: order.total_amount,
      createdAt: new Date(order.created_at),
      updatedAt: new Date(order.updated_at),
      customerName: order.customer_name || undefined,
      customerPhone: order.customer_phone || undefined,
      notes: order.notes || undefined
    }))
  },

  async getById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          menu_item_id,
          quantity,
          price,
          notes
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching order:', error)
      return null
    }

    return {
      id: data.id,
      tableId: data.table_id,
      items: data.order_items.map((item: any) => ({
        menuItemId: item.menu_item_id,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes || undefined
      })),
      status: data.status as Order['status'],
      totalAmount: data.total_amount,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      customerName: data.customer_name || undefined,
      customerPhone: data.customer_phone || undefined,
      notes: data.notes || undefined
    }
  },

  async create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order | null> {
    console.log('Creating order with data:', order)
    
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        table_id: order.tableId,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        status: order.status,
        total_amount: order.totalAmount,
        notes: order.notes
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      throw orderError
    }
    
    console.log('Order created successfully:', orderData)

    // Map frontend menu item IDs to database UUIDs
    const orderItems = []
    for (const item of order.items) {
      let menuItemUuid = item.menuItemId
      
      // Check if it's already a UUID format
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidPattern.test(item.menuItemId)) {
        // Use menu sync service to get the database UUID
        const dbId = menuSyncService.getDbId(item.menuItemId)
        if (dbId) {
          menuItemUuid = dbId
        } else {
          console.error(`Could not find database ID for menu item: ${item.menuItemId}`)
          throw new Error(`Menu item not found in database: ${item.menuItemId}`)
        }
      }
      
      orderItems.push({
        order_id: orderData.id,
        menu_item_id: menuItemUuid,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes
      })
    }

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      throw itemsError
    }

    return {
      id: orderData.id,
      tableId: orderData.table_id,
      items: order.items,
      status: orderData.status as Order['status'],
      totalAmount: orderData.total_amount,
      createdAt: new Date(orderData.created_at),
      updatedAt: new Date(orderData.updated_at),
      customerName: orderData.customer_name || undefined,
      customerPhone: orderData.customer_phone || undefined,
      notes: orderData.notes || undefined
    }
  },

  async updateStatus(id: string, status: Order['status']): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        order_items (
          id,
          menu_item_id,
          quantity,
          price,
          notes
        )
      `)
      .single()

    if (error) {
      console.error('Error updating order status:', error)
      throw error
    }

    return {
      id: data.id,
      tableId: data.table_id,
      items: data.order_items.map((item: any) => ({
        menuItemId: item.menu_item_id,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes || undefined
      })),
      status: data.status as Order['status'],
      totalAmount: data.total_amount,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      customerName: data.customer_name || undefined,
      customerPhone: data.customer_phone || undefined,
      notes: data.notes || undefined
    }
  },

  async getByStatus(status: Order['status']): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          menu_item_id,
          quantity,
          price,
          notes
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders by status:', error)
      throw error
    }

    return data.map(order => ({
      id: order.id,
      tableId: order.table_id,
      items: order.order_items.map((item: any) => ({
        menuItemId: item.menu_item_id,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes || undefined
      })),
      status: order.status as Order['status'],
      totalAmount: order.total_amount,
      createdAt: new Date(order.created_at),
      updatedAt: new Date(order.updated_at),
      customerName: order.customer_name || undefined,
      customerPhone: order.customer_phone || undefined,
      notes: order.notes || undefined
    }))
  }
}

// Real-time subscriptions
export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  const channel = supabase
    .channel('orders')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'orders'
    }, async () => {
      // Fetch updated orders when changes occur
      const orders = await ordersService.getAll()
      callback(orders)
    })
    .subscribe()

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel)
  }
}

export const subscribeToOrderItems = (callback: (payload: any) => void) => {
  return supabase
    .channel('order_items')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'order_items'
    }, callback)
    .subscribe()
}

export const subscribeToTables = (callback: (payload: any) => void) => {
  return supabase
    .channel('tables')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'tables'
    }, callback)
    .subscribe()
}