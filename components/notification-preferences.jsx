"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Mail, MessageSquare, Bell, Smartphone } from 'lucide-react';

export function NotificationPreferences({ userId, customerPhone, customerEmail }) {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [userId, customerPhone, customerEmail]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (customerPhone) params.set('customerPhone', customerPhone);
      if (customerEmail) params.set('customerEmail', customerEmail);

      const response = await fetch(`/api/notifications/preferences?${params}`);
      if (!response.ok) throw new Error('Failed to load preferences');

      const data = await response.json();
      setPreferences(data.preferences);
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification preferences',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key, value) => {
    if (!preferences) return;

    const updated = { ...preferences, [key]: value };
    setPreferences(updated);

    try {
      setSaving(true);
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          customerPhone,
          customerEmail,
          [key]: value,
        }),
      });

      if (!response.ok) throw new Error('Failed to update preference');

      toast({
        title: 'Success',
        description: 'Notification preference updated',
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      // Revert on error
      setPreferences(preferences);
      toast({
        title: 'Error',
        description: 'Failed to update preference',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Failed to load preferences
        </CardContent>
      </Card>
    );
  }

  const PreferenceSection = ({ title, icon: Icon, events }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="space-y-3 pl-7">
        {events.map(({ label, key, available = true }) => {
          if (!available) return null;
          return (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key} className="flex-1 cursor-pointer">
                {label}
              </Label>
              <Switch
                id={key}
                checked={preferences[key] ?? false}
                onCheckedChange={(checked) => handleToggle(key, checked)}
                disabled={saving}
              />
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how you want to be notified about your orders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <PreferenceSection
          title="Order Created"
          icon={Bell}
          events={[
            { label: 'Email', key: 'orderCreatedEmail', available: !!customerEmail },
            { label: 'SMS', key: 'orderCreatedSms', available: !!customerPhone },
            { label: 'Push Notification', key: 'orderCreatedPush', available: !!userId },
            { label: 'In-App', key: 'orderCreatedInApp' },
          ]}
        />

        <Separator />

        <PreferenceSection
          title="Order Status Changed"
          icon={Bell}
          events={[
            { label: 'Email', key: 'orderStatusChangedEmail', available: !!customerEmail },
            { label: 'SMS', key: 'orderStatusChangedSms', available: !!customerPhone },
            { label: 'Push Notification', key: 'orderStatusChangedPush', available: !!userId },
            { label: 'In-App', key: 'orderStatusChangedInApp' },
          ]}
        />

        <Separator />

        <PreferenceSection
          title="Order Ready"
          icon={Bell}
          events={[
            { label: 'Email', key: 'orderReadyEmail', available: !!customerEmail },
            { label: 'SMS', key: 'orderReadySms', available: !!customerPhone },
            { label: 'Push Notification', key: 'orderReadyPush', available: !!userId },
            { label: 'In-App', key: 'orderReadyInApp' },
          ]}
        />

        <Separator />

        <PreferenceSection
          title="Order Completed"
          icon={Bell}
          events={[
            { label: 'Email', key: 'orderCompletedEmail', available: !!customerEmail },
            { label: 'SMS', key: 'orderCompletedSms', available: !!customerPhone },
            { label: 'Push Notification', key: 'orderCompletedPush', available: !!userId },
            { label: 'In-App', key: 'orderCompletedInApp' },
          ]}
        />

        <Separator />

        <PreferenceSection
          title="Order Cancelled"
          icon={Bell}
          events={[
            { label: 'Email', key: 'orderCancelledEmail', available: !!customerEmail },
            { label: 'SMS', key: 'orderCancelledSms', available: !!customerPhone },
            { label: 'Push Notification', key: 'orderCancelledPush', available: !!userId },
            { label: 'In-App', key: 'orderCancelledInApp' },
          ]}
        />
      </CardContent>
    </Card>
  );
}

