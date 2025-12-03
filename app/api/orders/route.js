import { NextResponse } from 'next/server';
import { ordersService, inventoryService, tablesService, menuSyncService } from '@/lib/database';
import { notificationService } from '@/lib/notification-service';

export async function POST(request) {
  try {
    const body = await request.json();
    const { tableNumber, items, customerName, customerPhone, totalAmount } = body;

    // Validate table
    const tables = await tablesService.getAll();
    const table = tables.find(t => t.number === parseInt(tableNumber));

    if (!table) {
      return NextResponse.json(
        { error: `Table ${tableNumber} not found` },
        { status: 404 }
      );
    }

    const tableId = table.id;

    // Normalize items to handle both field naming conventions
    const normalizedItems = items.map(item => ({
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
    }

    // Validate calculated total amount
    if (typeof calculatedTotal !== 'number' || calculatedTotal <= 0) {
      return NextResponse.json({
        error: 'Invalid total amount - unable to calculate from items'
      }, {
        status: 400
      });
    }

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

    // Ensure menu mapping is initialized
    await menuSyncService.initializeMapping();

    // Create order in database
    const newOrder = await ordersService.create(orderData);
    if (!newOrder) {
      return NextResponse.json({
        error: 'Failed to create order'
      }, {
        status: 500
      });
    }

    // Apply inventory consumption
    let inventory;
    try {
      inventory = await inventoryService.applyOrderConsumption(newOrder.id);
    } catch (invErr) {
      console.error('Inventory consumption failed:', invErr);
      inventory = { success: false };
    }

    // Send order created notification
    try {
      await notificationService.sendOrderNotification(newOrder, 'order_created');
    } catch (notifErr) {
      console.error('Error sending order created notification:', notifErr);
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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')) : undefined;
    const status = searchParams.get('status') || undefined;

    const orders = await ordersService.getAll({ limit, offset, status });

    return NextResponse.json({
      orders,
      pagination: limit ? {
        limit,
        offset: offset || 0,
        hasMore: orders.length === limit
      } : undefined
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'CDN-Cache-Control': 'public, max-age=300'
      }
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
