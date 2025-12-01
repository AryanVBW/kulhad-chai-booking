-- Notification System Schema
-- Migration: 004_notifications_schema.sql

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: notifications
-- Stores all notification records
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'order_created',
    'order_status_changed',
    'order_ready',
    'order_completed',
    'order_cancelled',
    'order_preparing',
    'order_served'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered', 'read')),
  metadata JSONB DEFAULT '{}'::jsonb,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Table: notification_preferences
-- User notification preferences
-- ============================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  
  -- Order Created Preferences
  order_created_email BOOLEAN DEFAULT true,
  order_created_sms BOOLEAN DEFAULT true,
  order_created_push BOOLEAN DEFAULT true,
  order_created_in_app BOOLEAN DEFAULT true,
  
  -- Order Status Changed Preferences
  order_status_changed_email BOOLEAN DEFAULT true,
  order_status_changed_sms BOOLEAN DEFAULT false,
  order_status_changed_push BOOLEAN DEFAULT true,
  order_status_changed_in_app BOOLEAN DEFAULT true,
  
  -- Order Ready Preferences
  order_ready_email BOOLEAN DEFAULT true,
  order_ready_sms BOOLEAN DEFAULT true,
  order_ready_push BOOLEAN DEFAULT true,
  order_ready_in_app BOOLEAN DEFAULT true,
  
  -- Order Preparing Preferences
  order_preparing_email BOOLEAN DEFAULT false,
  order_preparing_sms BOOLEAN DEFAULT false,
  order_preparing_push BOOLEAN DEFAULT true,
  order_preparing_in_app BOOLEAN DEFAULT true,
  
  -- Order Served Preferences
  order_served_email BOOLEAN DEFAULT false,
  order_served_sms BOOLEAN DEFAULT false,
  order_served_push BOOLEAN DEFAULT false,
  order_served_in_app BOOLEAN DEFAULT true,
  
  -- Order Completed Preferences
  order_completed_email BOOLEAN DEFAULT true,
  order_completed_sms BOOLEAN DEFAULT false,
  order_completed_push BOOLEAN DEFAULT false,
  order_completed_in_app BOOLEAN DEFAULT true,
  
  -- Order Cancelled Preferences
  order_cancelled_email BOOLEAN DEFAULT true,
  order_cancelled_sms BOOLEAN DEFAULT true,
  order_cancelled_push BOOLEAN DEFAULT true,
  order_cancelled_in_app BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique preferences per user or customer
  CONSTRAINT unique_user_preferences UNIQUE (user_id),
  CONSTRAINT unique_customer_phone_preferences UNIQUE (customer_phone),
  CONSTRAINT unique_customer_email_preferences UNIQUE (customer_email),
  CONSTRAINT check_user_or_customer CHECK (
    (user_id IS NOT NULL) OR (customer_phone IS NOT NULL) OR (customer_email IS NOT NULL)
  )
);

-- ============================================
-- Table: push_subscriptions
-- Web Push notification subscriptions
-- ============================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  device_info JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_order_id ON notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_channel ON notifications(channel);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notifications(user_id, status);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_customer_phone ON notification_preferences(customer_phone);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_customer_email ON notification_preferences(customer_email);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active) WHERE is_active = true;

-- ============================================
-- Triggers for updated_at
-- ============================================
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_push_subscriptions_updated_at BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Notifications Policies
-- Users can read their own notifications
CREATE POLICY "Users can read their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role can insert notifications (for system-generated notifications)
CREATE POLICY "Service can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Service role can read all notifications (for admin/staff)
CREATE POLICY "Service can read all notifications" ON notifications
  FOR SELECT USING (true);

-- Notification Preferences Policies
-- Users can read their own preferences
CREATE POLICY "Users can read their own preferences" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own preferences
CREATE POLICY "Users can update their own preferences" ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert their own preferences" ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Service role can manage all preferences
CREATE POLICY "Service can manage all preferences" ON notification_preferences
  FOR ALL USING (true);

-- Push Subscriptions Policies
-- Users can manage their own subscriptions
CREATE POLICY "Users can manage their own subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Service role can read all subscriptions (for sending notifications)
CREATE POLICY "Service can read all subscriptions" ON push_subscriptions
  FOR SELECT USING (true);

