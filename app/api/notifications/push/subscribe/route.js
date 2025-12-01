import { NextResponse } from 'next/server';
import { pushService } from '@/lib/services/push-service';
import { createClient } from '@/utils/supabase/server';

/**
 * POST /api/notifications/push/subscribe
 * Subscribe to push notifications
 */
export async function POST(request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Allow anonymous subscriptions (for customers)
    const userId = user?.id || null;

    const body = await request.json();
    const { subscription, deviceInfo } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    if (!subscription.keys.p256dh || !subscription.keys.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription keys' },
        { status: 400 }
      );
    }

    const savedSubscription = await pushService.subscribeUser(userId, {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      deviceInfo: deviceInfo || {},
    });

    return NextResponse.json(
      { subscription: savedSubscription },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/push/subscribe
 * Unsubscribe from push notifications
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint required' },
        { status: 400 }
      );
    }

    await pushService.unsubscribeUser(endpoint);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}

