import { NextResponse } from 'next/server';
import { ordersService, inventoryService } from '@/lib/database';
import { menuSyncService } from '@/lib/menu-sync';
import { notificationService } from '@/lib/notification-service';
export async function POST(request) {
  try {
    console.log('=== ORDER API CALLED ===');
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    // Handle both camelCase and snake_case field names
    const tableId = body.tableId || body.table_id;
    const totalAmount = body.totalAmount || body.total_amount;
    const customerName = body.customerName || body.customer_name;
    const customerPhone = body.customerPhone || body.customer_phone;
    console.log('Parsed fields:', {
      tableId,
      totalAmount,
      customerName,
      customerPhone
    });

    // Validate required fields
    if (!tableId || !body.items || !Array.isArray(body.items) || body.items.length === 0) {
      console.log('Validation failed: missing required fields');
      return NextResponse.json({
        error: 'Missing required fields: tableId/table_id and items are required'
      }, {
        status: 400
      });
    }

    // Normalize items to handle both field naming conventions
    const normalizedItems = body.items.map(item => ({
      menuItemId: item.menuItemId || item.menu_item_id || item.id,
      quantity: item.quantity,
      price: item.price,
      specialInstructions: item.specialInstructions || item.special_instructions
    }));

    // Calculate total amount if not provided
    let calculatedTotal = totalAmount;
    if (typeof calculatedTotal !== 'number' || calculatedTotal <= 0) {
      calculatedTotal = normalizedItems.reduce((sum, item) => {
        return sum + item.price * item.quantity;
      }, 0);
      console.log('Calculated total amount:', calculatedTotal);
    }

    // Validate calculated total amount
    if (typeof calculatedTotal !== 'number' || calculatedTotal <= 0) {
      console.log('Validation failed: invalid calculated total amount', calculatedTotal);
      return NextResponse.json({
        error: 'Invalid total amount - unable to calculate from items'
      }, {
        status: 400
      });
    }
    console.log('Normalized items:', normalizedItems);

    // Create order data
    const orderData = {
      tableId,
      items: normalizedItems,
      status: 'pending',
      totalAmount: calculatedTotal,
      customerName,
      customerPhone,
      notes: body.notes
    };
    console.log('Order data to create:', JSON.stringify(orderData, null, 2));

    // Ensure menu mapping is initialized
    await menuSyncService.initializeMapping();
    console.log('Initialized menu mapping with', menuSyncService.getAllMappings().size, 'items');

    // Initialize menu mapping for the orders service
    await menuSyncService.initializeMapping();

    // Create order in database (orders service handles menu item mapping)
    const newOrder = await ordersService.create(orderData);
    if (!newOrder) {
      return NextResponse.json({
        error: 'Failed to create order'
      }, {
        status: 500
      });
    }
    // Apply inventory consumption linked to this order
    let inventory;
    try {
      inventory = await inventoryService.applyOrderConsumption(newOrder.id);
    } catch (invErr) {
      console.error('Inventory consumption failed:', invErr);
      inventory = { success: false };
    }

    // Send order created notification (async, don't block response)
    try {
      await notificationService.sendOrderNotification(newOrder, 'order_created');
    } catch (notifErr) {
      console.error('Error sending order created notification:', notifErr);
      // Don't fail the order creation if notification fails
    }

    return NextResponse.json({
      success: true,
      order: newOrder,
      inventory
    }, {
      status: 201
    });
  } catch (error) {
    console.error('Error creating order:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Menu item not found')) {
        return NextResponse.json({
          error: error.message
        }, {
          status: 400
        });
      }
    }
    return NextResponse.json({
      error: 'Internal server error'
    }, {
      status: 500
    });
  }
}
export async function GET() {
  try {
    const orders = await ordersService.getAll();
    return NextResponse.json({
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({
      error: 'Failed to fetch orders'
    }, {
      status: 500
    });
  }
}
