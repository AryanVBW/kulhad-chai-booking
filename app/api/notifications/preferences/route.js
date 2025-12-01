import { NextResponse } from 'next/server';
import { notificationService } from '@/lib/notification-service';
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/notifications/preferences
 * Get notification preferences for current user
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

    // Check for customer phone/email in query params
    const { searchParams } = new URL(request.url);
    const customerPhone = searchParams.get('customerPhone');
    const customerEmail = searchParams.get('customerEmail');

    const preferences = await notificationService.getPreferences({
      userId: user.id,
      customerPhone: customerPhone || undefined,
      customerEmail: customerEmail || undefined,
    });

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/preferences
 * Update notification preferences
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

    const body = await request.json();
    const {
      customerPhone,
      customerEmail,
      ...preferences
    } = body;

    // Validate preferences object
    const defaultPrefs = notificationService.getDefaultPreferences();
    const validKeys = Object.keys(defaultPrefs);
    const providedKeys = Object.keys(preferences);

    // Check if all provided keys are valid
    const invalidKeys = providedKeys.filter(key => !validKeys.includes(key));
    if (invalidKeys.length > 0) {
      return NextResponse.json(
        { error: `Invalid preference keys: ${invalidKeys.join(', ')}` },
        { status: 400 }
      );
    }

    const updatedPreferences = await notificationService.updatePreferences({
      userId: user.id,
      customerPhone: customerPhone || undefined,
      customerEmail: customerEmail || undefined,
      ...defaultPrefs, // Start with defaults
      ...preferences, // Override with provided values
    });

    return NextResponse.json({ preferences: updatedPreferences });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications/preferences
 * Create notification preferences (if they don't exist)
 */
export async function POST(request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      customerPhone,
      customerEmail,
      ...preferences
    } = body;

    // Get default preferences and merge with provided
    const defaultPrefs = notificationService.getDefaultPreferences();
    const finalPreferences = {
      ...defaultPrefs,
      ...preferences,
    };

    const createdPreferences = await notificationService.updatePreferences({
      userId: user.id,
      customerPhone: customerPhone || undefined,
      customerEmail: customerEmail || undefined,
      ...finalPreferences,
    });

    return NextResponse.json(
      { preferences: createdPreferences },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to create preferences' },
      { status: 500 }
    );
  }
}

