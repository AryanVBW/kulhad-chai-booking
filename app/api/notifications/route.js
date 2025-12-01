import { NextResponse } from 'next/server';
import { notificationService } from '@/lib/notification-service';
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/notifications
 * Get notifications for current user
 */
export async function GET(request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const channel = searchParams.get('channel');
    const limit = parseInt(searchParams.get('limit') || '50');

    const filters = {
      ...(status && { status }),
      ...(type && { type }),
      ...(channel && { channel }),
      limit,
    };

    const notifications = await notificationService.getNotifications(
      user.id,
      filters
    );

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/[id]/read
 * Mark notification as read
 */
export async function PUT(request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID required' },
        { status: 400 }
      );
    }

    const updated = await notificationService.markAsRead(notificationId);

    return NextResponse.json({ notification: updated });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}

