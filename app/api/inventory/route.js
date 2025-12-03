import { NextResponse } from 'next/server';
import { inventoryService } from '@/lib/database';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const lowStockOnly = (searchParams.get('lowStockOnly') || 'false').toLowerCase() === 'true';

    const items = await inventoryService.getAll({ search, category, lowStockOnly });
    return NextResponse.json({ items }, {
      headers: {
        'Cache-Control': 'public, max-age=600, s-maxage=600',
        'CDN-Cache-Control': 'public, max-age=600'
      }
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory items' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    // Accept camelCase and snake_case
    const sku = body.sku || body.SKU || body.s_k_u; // be flexible
    const name = body.name || body.item_name;
    const category = body.category || body.item_category;
    const unit = body.unit || body.item_unit;
    const reorderThreshold = body.reorderThreshold ?? body.reorder_threshold ?? 0;
    const reorderQuantity = body.reorderQuantity ?? body.reorder_quantity ?? 0;
    const quantityOnHand = body.quantityOnHand ?? body.quantity_on_hand ?? 0;
    const isActive = body.isActive ?? body.is_active ?? true;

    if (!sku || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: sku and name' },
        { status: 400 }
      );
    }

    const item = await inventoryService.create({
      sku,
      name,
      category,
      unit,
      reorderThreshold,
      reorderQuantity,
      quantityOnHand,
      isActive
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
  }
}