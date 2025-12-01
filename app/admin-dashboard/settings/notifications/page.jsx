"use client";

import React from 'react';
import { NotificationPreferences } from '@/components/notification-preferences';
import { PushNotificationSetup } from '@/components/push-notification-setup';
import { NotificationCenter } from '@/components/notification-center';
import { useAuth } from '@/contexts/auth-context';

export default function NotificationsSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage how you receive notifications about orders and updates
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <NotificationPreferences userId={user?.id} />
          <PushNotificationSetup userId={user?.id} />
        </div>
        <div>
          <NotificationCenter userId={user?.id} />
        </div>
      </div>
    </div>
  );
}

