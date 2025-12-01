import { supabase } from './supabase';
import { menuSyncService } from './menu-sync';
import { notificationService } from './notification-service';
// Menu Items Operations
export const menuItemsService = {
  async getAll() {
    const {
      data,
      error
    } = await supabase.from('menu_items').select('*').eq('available', true).order('category', {
      ascending: true
    }).order('name', {
      ascending: true
    });
    if (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image || undefined,
      available: item.available,
      preparationTime: item.preparation_time,
      isCombo: item.is_combo,
      comboItems: item.combo_items || undefined
    }));
  },
  async getById(id) {
    const {
      data,
      error
    } = await supabase.from('menu_items').select('*').eq('id', id).single();
    if (error) {
      console.error('Error fetching menu item:', error);
      return null;
    }
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.image || undefined,
      available: data.available,
      preparationTime: data.preparation_time,
      isCombo: data.is_combo,
      comboItems: data.combo_items || undefined
    };
  },
  async create(item) {
    const {
      data,
      error
    } = await supabase.from('menu_items').insert({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      available: item.available,
      preparation_time: item.preparationTime,
      is_combo: item.isCombo,
      combo_items: item.comboItems
    }).select().single();
    if (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.image || undefined,
      available: data.available,
      preparationTime: data.preparation_time,
      isCombo: data.is_combo,
      comboItems: data.combo_items || undefined
    };
  },
  async update(id, updates) {
    const {
      data,
      error
    } = await supabase.from('menu_items').update({
      ...(updates.name && {
        name: updates.name
      }),
      ...(updates.description && {
        description: updates.description
      }),
      ...(updates.price && {
        price: updates.price
      }),
      ...(updates.category && {
        category: updates.category
      }),
      ...(updates.image !== undefined && {
        image: updates.image
      }),
      ...(updates.available !== undefined && {
        available: updates.available
      }),
      ...(updates.preparationTime && {
        preparation_time: updates.preparationTime
      }),
      ...(updates.isCombo !== undefined && {
        is_combo: updates.isCombo
      }),
      ...(updates.comboItems !== undefined && {
        combo_items: updates.comboItems
      })
    }).eq('id', id).select().single();
    if (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.image || undefined,
      available: data.available,
      preparationTime: data.preparation_time,
      isCombo: data.is_combo,
      comboItems: data.combo_items || undefined
    };
  }
};

// Tables Operations
export const tablesService = {
  async getAll() {
    const {
      data,
      error
    } = await supabase.from('tables').select('*').order('table_number', {
      ascending: true
    });
    if (error) {
      console.error('Error fetching tables:', error);
      throw error;
    }
    return data.map(table => ({
      id: table.id,
      number: table.table_number,
      capacity: table.capacity,
      status: table.status,
      qrCode: table.qr_code
    }));
  },
  async getById(id) {
    const {
      data,
      error
    } = await supabase.from('tables').select('*').eq('id', id).single();
    if (error) {
      console.error('Error fetching table:', error);
      return null;
    }
    return {
      id: data.id,
      number: data.table_number,
      capacity: data.capacity,
      status: data.status,
      qrCode: data.qr_code
    };
  },
  async updateStatus(id, status) {
    const {
      data,
      error
    } = await supabase.from('tables').update({
      status
    }).eq('id', id).select().single();
    if (error) {
      console.error('Error updating table status:', error);
      throw error;
    }
    return {
      id: data.id,
      number: data.table_number,
      capacity: data.capacity,
      status: data.status,
      qrCode: data.qr_code
    };
  },
  async create(table) {
    const {
      data,
      error
    } = await supabase.from('tables').insert({
      table_number: table.number,
      capacity: table.capacity,
      status: table.status,
      qr_code: table.qrCode
    }).select().single();
    if (error) {
      console.error('Error creating table:', error);
      throw error;
    }
    return {
      id: data.id,
      number: data.table_number,
      capacity: data.capacity,
      status: data.status,
      qrCode: data.qr_code
    };
  }
};

// Orders Operations
export const ordersService = {
  async getAll() {
    const {
      data,
      error
    } = await supabase.from('orders').select(`
        *,
        order_items (
          id,
          menu_item_id,
          quantity,
          price,
          notes
        )
      `).order('created_at', {
      ascending: false
    });
    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
    return data.map(order => ({
      id: order.id,
      tableId: order.table_id,
      items: order.order_items.map(item => {
        return {
          menuItemId: item.menu_item_id,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes || undefined
        };
      }),
      status: order.status,
      totalAmount: order.total_amount,
      createdAt: new Date(order.created_at),
      updatedAt: new Date(order.updated_at),
      customerName: order.customer_name || undefined,
      customerPhone: order.customer_phone || undefined,
      notes: order.notes || undefined
    }));
  },
  async getById(id) {
    const {
      data,
      error
    } = await supabase.from('orders').select(`
        *,
        order_items (
          id,
          menu_item_id,
          quantity,
          price,
          notes
        )
      `).eq('id', id).single();
    if (error) {
      console.error('Error fetching order:', error);
      return null;
    }
    return {
      id: data.id,
      tableId: data.table_id,
      items: data.order_items.map(item => ({
        menuItemId: item.menu_item_id,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes || undefined
      })),
      status: data.status,
      totalAmount: data.total_amount,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      customerName: data.customer_name || undefined,
      customerPhone: data.customer_phone || undefined,
      notes: data.notes || undefined
    };
  },
  async create(order) {
    console.log('Creating order with data:', order);
    const {
      data: orderData,
      error: orderError
    } = await supabase.from('orders').insert({
      table_id: order.tableId,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      status: order.status,
      total_amount: order.totalAmount,
      notes: order.notes
    }).select().single();
    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }
    console.log('Order created successfully:', orderData);

    // Map frontend menu item IDs to database UUIDs
    const orderItems = [];
    for (const item of order.items) {
      let menuItemUuid = item.menuItemId;

      // Check if it's already a UUID format
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(item.menuItemId)) {
        // Use menu sync service to get the database UUID
        const dbId = await menuSyncService.getDbId(item.menuItemId);
        if (dbId) {
          menuItemUuid = dbId;
        } else {
          console.error(`Could not find database ID for menu item: ${item.menuItemId}`);
          throw new Error(`Menu item not found in database: ${item.menuItemId}`);
        }
      }
      orderItems.push({
        order_id: orderData.id,
        menu_item_id: menuItemUuid,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes
      });
    }
    const {
      error: itemsError
    } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      throw itemsError;
    }
    return {
      id: orderData.id,
      tableId: orderData.table_id,
      items: order.items,
      status: orderData.status,
      totalAmount: orderData.total_amount,
      createdAt: new Date(orderData.created_at),
      updatedAt: new Date(orderData.updated_at),
      customerName: orderData.customer_name || undefined,
      customerPhone: orderData.customer_phone || undefined,
      notes: orderData.notes || undefined
    };
  },
  async updateStatus(id, status, previousStatus = null) {
    const {
      data,
      error
    } = await supabase.from('orders').update({
      status
    }).eq('id', id).select(`
        *,
        order_items (
          id,
          menu_item_id,
          quantity,
          price,
          notes
        )
      `).single();
    if (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
    
    const updatedOrder = {
      id: data.id,
      tableId: data.table_id,
      items: data.order_items.map(item => ({
        menuItemId: item.menu_item_id,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes || undefined
      })),
      status: data.status,
      totalAmount: data.total_amount,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      customerName: data.customer_name || undefined,
      customerPhone: data.customer_phone || undefined,
      notes: data.notes || undefined
    };

    // Send order status change notification (async, don't block response)
    try {
      await notificationService.sendOrderNotification(
        updatedOrder,
        'order_status_changed',
        { previousStatus }
      );
    } catch (notifErr) {
      console.error('Error sending order status change notification:', notifErr);
      // Don't fail the status update if notification fails
    }

    return updatedOrder;
  },
  async getByStatus(status) {
    const {
      data,
      error
    } = await supabase.from('orders').select(`
        *,
        order_items (
          id,
          menu_item_id,
          quantity,
          price,
          notes
        )
      `).eq('status', status).order('created_at', {
      ascending: false
    });
    if (error) {
      console.error('Error fetching orders by status:', error);
      throw error;
    }
    return data.map(order => ({
      id: order.id,
      tableId: order.table_id,
      items: order.order_items.map(item => ({
        menuItemId: item.menu_item_id,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes || undefined
      })),
      status: order.status,
      totalAmount: order.total_amount,
      createdAt: new Date(order.created_at),
      updatedAt: new Date(order.updated_at),
      customerName: order.customer_name || undefined,
      customerPhone: order.customer_phone || undefined,
      notes: order.notes || undefined
    }));
  }
};

export const subscribeToOrders = callback => {
  const channel = supabase.channel('orders').on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'orders'
  }, async () => {
    // Fetch updated orders when changes occur
    const orders = await ordersService.getAll();
    callback(orders);
  }).subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
export const subscribeToOrderItems = callback => {
  return supabase.channel('order_items').on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'order_items'
  }, callback).subscribe();
};
export const subscribeToTables = callback => {
  return supabase.channel('tables').on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'tables'
  }, callback).subscribe();
};

// Inventory Operations
export const inventoryService = {
  async getAll({ search, category, lowStockOnly } = {}) {
    let query = supabase
      .from('inventory_items')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (category) query = query.eq('category', category);
    if (search) {
      // Simple ILIKE filters on name or sku
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }
    if (lowStockOnly) {
      // Filter items where quantity_on_hand <= reorder_threshold
      query = query.lte('quantity_on_hand', supabase.rpc ? 'reorder_threshold' : 0); // fallback for client; adjusted later
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching inventory items:', error);
      throw error;
    }
    // Apply low-stock filter client-side if needed
    const items = data.map((i) => ({
      id: i.id,
      sku: i.sku,
      name: i.name,
      category: i.category || undefined,
      unit: i.unit || 'pcs',
      reorderThreshold: i.reorder_threshold || 0,
      reorderQuantity: i.reorder_quantity || 0,
      quantityOnHand: i.quantity_on_hand || 0,
      isActive: i.is_active,
      createdAt: new Date(i.created_at),
      updatedAt: new Date(i.updated_at)
    }));
    return lowStockOnly ? items.filter((x) => x.quantityOnHand <= x.reorderThreshold && x.reorderThreshold > 0) : items;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.error('Error fetching inventory item:', error);
      return null;
    }
    return {
      id: data.id,
      sku: data.sku,
      name: data.name,
      category: data.category || undefined,
      unit: data.unit || 'pcs',
      reorderThreshold: data.reorder_threshold || 0,
      reorderQuantity: data.reorder_quantity || 0,
      quantityOnHand: data.quantity_on_hand || 0,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async create(item) {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        sku: item.sku,
        name: item.name,
        category: item.category,
        unit: item.unit || 'pcs',
        reorder_threshold: item.reorderThreshold || 0,
        reorder_quantity: item.reorderQuantity || 0,
        quantity_on_hand: item.quantityOnHand || 0,
        is_active: item.isActive !== undefined ? item.isActive : true
      })
      .select()
      .single();
    if (error) {
      console.error('Error creating inventory item:', error);
      throw error;
    }
    return {
      id: data.id,
      sku: data.sku,
      name: data.name,
      category: data.category || undefined,
      unit: data.unit || 'pcs',
      reorderThreshold: data.reorder_threshold || 0,
      reorderQuantity: data.reorder_quantity || 0,
      quantityOnHand: data.quantity_on_hand || 0,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('inventory_items')
      .update({
        ...(updates.sku !== undefined && { sku: updates.sku }),
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.category !== undefined && { category: updates.category }),
        ...(updates.unit !== undefined && { unit: updates.unit }),
        ...(updates.reorderThreshold !== undefined && { reorder_threshold: updates.reorderThreshold }),
        ...(updates.reorderQuantity !== undefined && { reorder_quantity: updates.reorderQuantity }),
        ...(updates.quantityOnHand !== undefined && { quantity_on_hand: updates.quantityOnHand }),
        ...(updates.isActive !== undefined && { is_active: updates.isActive })
      })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
    return {
      id: data.id,
      sku: data.sku,
      name: data.name,
      category: data.category || undefined,
      unit: data.unit || 'pcs',
      reorderThreshold: data.reorder_threshold || 0,
      reorderQuantity: data.reorder_quantity || 0,
      quantityOnHand: data.quantity_on_hand || 0,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async softDelete(id) {
    const { data, error } = await supabase
      .from('inventory_items')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error soft-deleting inventory item:', error);
      throw error;
    }
    return { id: data.id, isActive: data.is_active };
  },

  async adjustStock({ itemId, delta, type, sourceType, sourceId, notes, createdBy }) {
    const { data, error } = await supabase.rpc('apply_stock_adjustment', {
      p_item_id: itemId,
      p_delta: delta,
      p_type: type,
      p_source_type: sourceType || null,
      p_source_id: sourceId || null,
      p_notes: notes || null,
      p_created_by: createdBy || null
    });
    if (error) {
      console.error('Error applying stock adjustment:', error);
      throw error;
    }
    return data;
  },

  async getMovements({ itemId, type, from, to, limit = 50, offset = 0 } = {}) {
    let query = supabase
      .from('stock_movements')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (itemId) query = query.eq('item_id', itemId);
    if (type) query = query.eq('type', type);
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching stock movements:', error);
      throw error;
    }
    return data.map((m) => ({
      id: m.id,
      itemId: m.item_id,
      type: m.type,
      quantityChange: m.quantity_change,
      beforeQty: m.before_qty,
      afterQty: m.after_qty,
      sourceType: m.source_type || undefined,
      sourceId: m.source_id || undefined,
      notes: m.notes || undefined,
      createdBy: m.created_by || undefined,
      createdAt: new Date(m.created_at)
    }));
  },

  async getAlerts({ onlyOpen = true } = {}) {
    let query = supabase
      .from('inventory_alerts')
      .select('*')
      .order('created_at', { ascending: false });
    if (onlyOpen) query = query.eq('acknowledged', false);
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching inventory alerts:', error);
      throw error;
    }
    return data.map((a) => ({
      id: a.id,
      itemId: a.item_id,
      alertType: a.alert_type,
      currentQty: a.current_qty,
      threshold: a.threshold,
      acknowledged: a.acknowledged,
      createdAt: new Date(a.created_at)
    }));
  },

  async acknowledgeAlert(alertId) {
    const { data, error } = await supabase
      .from('inventory_alerts')
      .update({ acknowledged: true })
      .eq('id', alertId)
      .select()
      .single();
    if (error) {
      console.error('Error acknowledging alert:', error);
      throw error;
    }
    return { id: data.id, acknowledged: data.acknowledged };
  },

  async getStockSummary() {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('category, quantity_on_hand, reorder_threshold');
    if (error) {
      console.error('Error fetching stock summary:', error);
      throw error;
    }
    const summary = {};
    for (const row of data) {
      const cat = row.category || 'Uncategorized';
      if (!summary[cat]) summary[cat] = { totalQty: 0, lowItems: 0 };
      summary[cat].totalQty += row.quantity_on_hand || 0;
      if (row.reorder_threshold && row.quantity_on_hand <= row.reorder_threshold) {
        summary[cat].lowItems += 1;
      }
    }
    return summary;
  },

  async getUsageReport({ from, to } = {}) {
    let query = supabase
      .from('stock_movements')
      .select('item_id, type, quantity_change, created_at');
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching usage report:', error);
      throw error;
    }
    const usage = new Map();
    for (const m of data) {
      // Consider sales and negative adjustments as usage
      const isUsage = m.type === 'sale' || (m.type === 'adjustment' && m.quantity_change < 0);
      if (!isUsage) continue;
      const curr = usage.get(m.item_id) || 0;
      usage.set(m.item_id, curr + Math.abs(m.quantity_change));
    }
    return Array.from(usage.entries()).map(([itemId, totalUsed]) => ({ itemId, totalUsed }));
  },

  async getLowStockReport() {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*');
    if (error) {
      console.error('Error fetching low stock report:', error);
      throw error;
    }
    return data
      .filter((i) => i.reorder_threshold > 0 && i.quantity_on_hand <= i.reorder_threshold)
      .map((i) => ({
        id: i.id,
        sku: i.sku,
        name: i.name,
        category: i.category || undefined,
        quantityOnHand: i.quantity_on_hand,
        reorderThreshold: i.reorder_threshold,
        reorderQuantity: i.reorder_quantity
      }));
  },

  // Menu to Inventory Mappings
  async getMenuMappings({ menuItemId, inventoryItemId } = {}) {
    let query = supabase
      .from('menu_inventory_map')
      .select('*');
    if (menuItemId) query = query.eq('menu_item_id', menuItemId);
    if (inventoryItemId) query = query.eq('inventory_item_id', inventoryItemId);
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching menu inventory mappings:', error);
      throw error;
    }
    return (data || []).map((m) => ({
      id: m.id,
      menuItemId: m.menu_item_id,
      inventoryItemId: m.inventory_item_id,
      unitsPerItem: m.units_per_item || 1,
      createdAt: new Date(m.created_at)
    }));
  },

  async getMenuMappingById(id) {
    const { data, error } = await supabase
      .from('menu_inventory_map')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.error('Error fetching menu inventory mapping:', error);
      return null;
    }
    return {
      id: data.id,
      menuItemId: data.menu_item_id,
      inventoryItemId: data.inventory_item_id,
      unitsPerItem: data.units_per_item || 1,
      createdAt: new Date(data.created_at)
    };
  },

  async createMenuMapping({ menuItemId, inventoryItemId, unitsPerItem }) {
    const { data, error } = await supabase
      .from('menu_inventory_map')
      .insert({
        menu_item_id: menuItemId,
        inventory_item_id: inventoryItemId,
        units_per_item: unitsPerItem || 1
      })
      .select()
      .single();
    if (error) {
      console.error('Error creating menu inventory mapping:', error);
      throw error;
    }
    return {
      id: data.id,
      menuItemId: data.menu_item_id,
      inventoryItemId: data.inventory_item_id,
      unitsPerItem: data.units_per_item || 1,
      createdAt: new Date(data.created_at)
    };
  },

  async updateMenuMapping(id, updates) {
    const { data, error } = await supabase
      .from('menu_inventory_map')
      .update({
        ...(updates.menuItemId !== undefined && { menu_item_id: updates.menuItemId }),
        ...(updates.inventoryItemId !== undefined && { inventory_item_id: updates.inventoryItemId }),
        ...(updates.unitsPerItem !== undefined && { units_per_item: updates.unitsPerItem })
      })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating menu inventory mapping:', error);
      throw error;
    }
    return {
      id: data.id,
      menuItemId: data.menu_item_id,
      inventoryItemId: data.inventory_item_id,
      unitsPerItem: data.units_per_item || 1,
      createdAt: new Date(data.created_at)
    };
  },

  async deleteMenuMapping(id) {
    const { error } = await supabase
      .from('menu_inventory_map')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Error deleting menu inventory mapping:', error);
      throw error;
    }
    return { success: true };
  },

  async applyOrderConsumption(orderId) {
    const { data: orderItems, error: oiError } = await supabase
      .from('order_items')
      .select('menu_item_id, quantity')
      .eq('order_id', orderId);
    if (oiError) {
      console.error('Error fetching order items for inventory consumption:', oiError);
      throw oiError;
    }

    for (const oi of orderItems) {
      const { data: mappings, error: mapError } = await supabase
        .from('menu_inventory_map')
        .select('inventory_item_id, units_per_item')
        .eq('menu_item_id', oi.menu_item_id);
      if (mapError) {
        console.error('Error fetching menu->inventory mappings:', mapError);
        throw mapError;
      }
      // If no mapping, skip; you can add logging
      for (const m of mappings || []) {
        const delta = -1 * (oi.quantity * (m.units_per_item || 1));
        try {
          await this.adjustStock({
            itemId: m.inventory_item_id,
            delta,
            type: 'sale',
            sourceType: 'order',
            sourceId: String(orderId)
          });
        } catch (err) {
          console.error('Error applying stock adjustment for order consumption:', err);
          // Continue processing other items
        }
      }
    }
    return { success: true };
  }
};

export const subscribeToInventory = (callback) => {
  const channel = supabase.channel('inventory_items').on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'inventory_items'
  }, callback).subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
};

export const subscribeToInventoryAlerts = (callback) => {
  const channel = supabase.channel('inventory_alerts').on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'inventory_alerts'
  }, callback).subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
};

export const subscribeToStockMovements = (callback) => {
  const channel = supabase.channel('stock_movements').on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'stock_movements'
  }, callback).subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
};
