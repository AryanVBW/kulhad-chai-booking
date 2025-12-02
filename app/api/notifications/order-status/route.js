import { NextResponse } from 'next/server';
import { notificationService } from '@/lib/notification-service';

export async function POST(request) {
    try {
        const body = await request.json();
        const { order, previousStatus } = body;

        if (!order) {
            return NextResponse.json(
                { error: 'Order data is required' },
                { status: 400 }
            );
        }

        await notificationService.sendOrderNotification(
            order,
            'order_status_changed',
            { previousStatus }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json(
            { error: 'Failed to send notification' },
            { status: 500 }
        );
    }
}
