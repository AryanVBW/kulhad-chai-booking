import { NextResponse } from 'next/server';
import { menuItemsService } from '@/lib/database';

export async function GET() {
    try {
        const items = await menuItemsService.getAll();
        return NextResponse.json(items);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        return NextResponse.json(
            { error: 'Failed to fetch menu items' },
            { status: 500 }
        );
    }
}
