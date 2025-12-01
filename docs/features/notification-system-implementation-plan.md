# Notification System Implementation Plan

## Overview
This document outlines the complete implementation plan for a multi-channel notification system that sends notifications on order events (create, status updates) via Email, SMS, and Push notifications, with user preference management.

## Project Context
- **Tech Stack**: Next.js 14, Supabase (PostgreSQL), React
- **Current State**: Basic real-time order notification component exists (`components/order-notification.jsx`)
- **Order Events**: Order created, status changes (pending → preparing → ready → served → completed/cancelled)

---

## Implementation Phases

### Phase 1: Database Schema & Data Model

#### 1.1 Create Notification Tables Migration
**File**: `supabase/migrations/004_notifications_schema.sql`

**Tables to Create**:

1. **`notifications`** - Main notification records
   - `id` (UUID, primary key)
   - `user_id` (UUID, references auth.users) - nullable for customer notifications
   - `order_id` (UUID, references orders) - nullable for non-order notifications
   - `type` (VARCHAR) - 'order_created', 'order_status_changed', 'order_ready', etc.
   - `title` (TEXT)
   - `message` (TEXT)
   - `channel` (VARCHAR) - 'email', 'sms', 'push', 'in_app'
   - `status` (VARCHAR) - 'pending', 'sent', 'failed', 'delivered'
   - `metadata` (JSONB) - flexible data storage
   - `sent_at` (TIMESTAMP) - nullable
   - `delivered_at` (TIMESTAMP) - nullable
   - `error_message` (TEXT) - nullable
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

2. **`notification_preferences`** - User notification preferences
   - `id` (UUID, primary key)
   - `user_id` (UUID, references auth.users) - nullable for customer phone/email
   - `customer_phone` (VARCHAR) - for customer preferences by phone
   - `customer_email` (VARCHAR) - for customer preferences by email
   - `order_created_email` (BOOLEAN, default true)
   - `order_created_sms` (BOOLEAN, default true)
   - `order_created_push` (BOOLEAN, default true)
   - `order_status_changed_email` (BOOLEAN, default true)
   - `order_status_changed_sms` (BOOLEAN, default false)
   - `order_status_changed_push` (BOOLEAN, default true)
   - `order_ready_email` (BOOLEAN, default true)
   - `order_ready_sms` (BOOLEAN, default true)
   - `order_ready_push` (BOOLEAN, default true)
   - `order_completed_email` (BOOLEAN, default true)
   - `order_completed_sms` (BOOLEAN, default false)
   - `order_completed_push` (BOOLEAN, default false)
   - `order_cancelled_email` (BOOLEAN, default true)
   - `order_cancelled_sms` (BOOLEAN, default true)
   - `order_cancelled_push` (BOOLEAN, default true)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

3. **`push_subscriptions`** - Web Push notification subscriptions
   - `id` (UUID, primary key)
   - `user_id` (UUID, references auth.users) - nullable
   - `endpoint` (TEXT, unique)
   - `p256dh_key` (TEXT)
   - `auth_key` (TEXT)
   - `device_info` (JSONB) - browser, OS, etc.
   - `is_active` (BOOLEAN, default true)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

**Indexes**:
- `idx_notifications_user_id` on notifications(user_id)
- `idx_notifications_order_id` on notifications(order_id)
- `idx_notifications_status` on notifications(status)
- `idx_notifications_created_at` on notifications(created_at)
- `idx_notification_preferences_user_id` on notification_preferences(user_id)
- `idx_notification_preferences_customer_phone` on notification_preferences(customer_phone)
- `idx_notification_preferences_customer_email` on notification_preferences(customer_email)
- `idx_push_subscriptions_user_id` on push_subscriptions(user_id)
- `idx_push_subscriptions_endpoint` on push_subscriptions(endpoint)

**RLS Policies**: Enable RLS and create appropriate policies for authenticated users and public access where needed.

---

### Phase 2: Notification Service Layer

#### 2.1 Create Notification Service
**File**: `lib/notification-service.js`

**Functions to Implement**:

1. **`getPreferences(userId, customerPhone, customerEmail)`**
   - Fetch user notification preferences
   - Create default preferences if not exists
   - Support both authenticated users and customers (by phone/email)

2. **`updatePreferences(userId, preferences)`**
   - Update notification preferences
   - Support partial updates

3. **`createNotification(notificationData)`**
   - Create notification record in database
   - Returns notification object

4. **`sendNotification(notificationId, channel)`**
   - Route to appropriate channel service
   - Update notification status
   - Handle errors

5. **`sendOrderNotification(order, eventType)`**
   - Main entry point for order-related notifications
   - Fetch preferences
   - Create notifications for enabled channels
   - Queue notifications for sending

6. **`getNotifications(userId, filters)`**
   - Fetch notifications for a user
   - Support filtering by status, type, date range

7. **`markAsRead(notificationId)`**
   - Mark notification as read/delivered

---

### Phase 3: Channel-Specific Services

#### 3.1 Email Notification Service
**File**: `lib/services/email-service.js`

**Dependencies to Add**:
- `nodemailer` or `@sendgrid/mail` or `resend` (choose one)
- Email template engine (optional: `handlebars` or `mjml`)

**Functions**:
- `sendEmail(to, subject, htmlContent, textContent)`
- `sendOrderCreatedEmail(order, customerEmail)`
- `sendOrderStatusEmail(order, customerEmail, newStatus)`
- `sendOrderReadyEmail(order, customerEmail)`
- `sendOrderCompletedEmail(order, customerEmail)`
- `sendOrderCancelledEmail(order, customerEmail)`

**Email Templates**:
- Create email templates in `lib/templates/email/`
- Templates: `order-created.html`, `order-status.html`, `order-ready.html`, etc.

**Environment Variables**:
- `EMAIL_SERVICE_PROVIDER` (sendgrid/resend/nodemailer)
- `EMAIL_API_KEY`
- `EMAIL_FROM_ADDRESS`
- `EMAIL_FROM_NAME`

#### 3.2 SMS Notification Service
**File**: `lib/services/sms-service.js`

**Dependencies to Add**:
- `twilio` (recommended) or `aws-sns` or `messagebird`

**Functions**:
- `sendSMS(to, message)`
- `sendOrderCreatedSMS(order, customerPhone)`
- `sendOrderStatusSMS(order, customerPhone, newStatus)`
- `sendOrderReadySMS(order, customerPhone)`
- `sendOrderCompletedSMS(order, customerPhone)`
- `sendOrderCancelledSMS(order, customerPhone)`

**Environment Variables**:
- `SMS_SERVICE_PROVIDER` (twilio/aws-sns/messagebird)
- `SMS_ACCOUNT_SID` (for Twilio)
- `SMS_AUTH_TOKEN` (for Twilio)
- `SMS_FROM_NUMBER` (for Twilio)

#### 3.3 Push Notification Service
**File**: `lib/services/push-service.js`

**Dependencies to Add**:
- `web-push` (for Web Push API)

**Functions**:
- `generateVAPIDKeys()` - Generate VAPID keys (one-time setup)
- `subscribeUser(userId, subscription)` - Save push subscription
- `unsubscribeUser(endpoint)` - Remove subscription
- `sendPushNotification(subscription, payload)`
- `sendPushToUser(userId, title, body, data)`
- `sendOrderCreatedPush(order, userId)`
- `sendOrderStatusPush(order, userId, newStatus)`
- `sendOrderReadyPush(order, userId)`
- `sendOrderCompletedPush(order, userId)`
- `sendOrderCancelledPush(order, userId)`

**Environment Variables**:
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` (mailto: or https: URL)

**Client-Side Setup**:
- Service worker registration
- Push subscription UI component
- Request notification permission

---

### Phase 4: API Endpoints

#### 4.1 Notification Preferences API
**File**: `app/api/notifications/preferences/route.js`

**Endpoints**:
- `GET /api/notifications/preferences` - Get current user preferences
- `PUT /api/notifications/preferences` - Update preferences
- `POST /api/notifications/preferences` - Create preferences (if needed)

#### 4.2 Push Subscription API
**File**: `app/api/notifications/push/subscribe/route.js`

**Endpoints**:
- `POST /api/notifications/push/subscribe` - Subscribe to push notifications
- `DELETE /api/notifications/push/subscribe` - Unsubscribe

#### 4.3 Notifications API
**File**: `app/api/notifications/route.js`

**Endpoints**:
- `GET /api/notifications` - Get user notifications (with pagination)
- `PUT /api/notifications/[id]/read` - Mark as read
- `POST /api/notifications/test` - Test notification (admin only)

#### 4.4 Notification Webhook/Trigger
**File**: `app/api/notifications/send/route.js` (optional, for manual triggering)

**Endpoints**:
- `POST /api/notifications/send` - Manually trigger notification

---

### Phase 5: Integration with Order Events

#### 5.1 Order Creation Hook
**File**: Modify `app/api/orders/route.js`

**Changes**:
- After order creation, call `notificationService.sendOrderNotification(newOrder, 'order_created')`

#### 5.2 Order Status Update Hook
**File**: Modify `lib/database.js` - `ordersService.updateStatus()`

**Changes**:
- After status update, call `notificationService.sendOrderNotification(updatedOrder, 'order_status_changed')`
- Include previous status in metadata for comparison

#### 5.3 Database Triggers (Alternative Approach)
**File**: `supabase/migrations/005_notification_triggers.sql`

**Triggers**:
- Create PostgreSQL function to trigger notifications on order INSERT/UPDATE
- Use Supabase Edge Functions or database triggers

**Note**: Prefer application-level hooks for better control and error handling.

---

### Phase 6: Frontend Components

#### 6.1 Notification Preferences UI
**File**: `app/admin-dashboard/settings/notifications/page.jsx` (for admin)
**File**: `components/notification-preferences.jsx` (reusable component)

**Features**:
- Toggle switches for each notification type and channel
- Save preferences
- Show current preferences

#### 6.2 Push Notification Setup Component
**File**: `components/push-notification-setup.jsx`

**Features**:
- Request notification permission
- Subscribe to push notifications
- Show subscription status
- Unsubscribe option

#### 6.3 Notification Center/Inbox
**File**: `components/notification-center.jsx`

**Features**:
- List of notifications
- Mark as read
- Filter by type/status
- Real-time updates (Supabase real-time)

#### 6.4 Enhanced Order Notification Component
**File**: Update `components/order-notification.jsx`

**Changes**:
- Integrate with new notification system
- Show notification delivery status
- Support multiple channels

---

### Phase 7: Background Job Processing (Optional but Recommended)

#### 7.1 Notification Queue System
**File**: `lib/notification-queue.js`

**Purpose**: Process notifications asynchronously to avoid blocking order operations

**Implementation Options**:
1. **Simple Queue**: Use Supabase database as queue, process with cron job
2. **Supabase Edge Functions**: Serverless functions for processing
3. **External Queue**: Redis/BullMQ (if needed for high volume)

**Functions**:
- `queueNotification(notification)`
- `processNotificationQueue()` - Process pending notifications
- `retryFailedNotifications()` - Retry failed notifications

#### 7.2 Cron Job Setup
**File**: `app/api/cron/process-notifications/route.js`

**Purpose**: Periodically process notification queue

**Note**: Use Vercel Cron or external cron service to call this endpoint.

---

## Implementation Order (Recommended Sequence)

1. ✅ **Phase 1**: Database schema and migrations
2. ✅ **Phase 2**: Notification service layer (basic structure)
3. ✅ **Phase 3.1**: Email service (start with one channel)
4. ✅ **Phase 4.1**: Preferences API
5. ✅ **Phase 5**: Integration with order events (test with email)
6. ✅ **Phase 6.1**: Notification preferences UI
7. ✅ **Phase 3.2**: SMS service
8. ✅ **Phase 3.3**: Push notification service
9. ✅ **Phase 4.2-4.3**: Remaining APIs
10. ✅ **Phase 6.2-6.4**: Frontend components
11. ✅ **Phase 7**: Background processing (if needed)

---

## Environment Variables Required

```env
# Email Service
EMAIL_SERVICE_PROVIDER=sendgrid
EMAIL_API_KEY=your_sendgrid_api_key
EMAIL_FROM_ADDRESS=noreply@kulhadchai.shop
EMAIL_FROM_NAME=Kulhad Chai

# SMS Service
SMS_SERVICE_PROVIDER=twilio
SMS_ACCOUNT_SID=your_twilio_account_sid
SMS_AUTH_TOKEN=your_twilio_auth_token
SMS_FROM_NUMBER=+1234567890

# Push Notifications
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:admin@kulhadchai.shop
```

---

## Testing Checklist

- [ ] Order created notification sent via all enabled channels
- [ ] Order status change notification sent
- [ ] User preferences respected (disabled channels not used)
- [ ] Email notifications delivered
- [ ] SMS notifications delivered
- [ ] Push notifications received on browser
- [ ] Notification preferences can be updated
- [ ] Failed notifications logged and retried
- [ ] Customer notifications work (by phone/email, not user_id)
- [ ] Admin/staff notifications work (by user_id)

---

## Acceptance Criteria Verification

✅ **Notifications sent on order events**
- Order created → notification sent
- Order status changed → notification sent
- Order ready → notification sent
- Order completed → notification sent
- Order cancelled → notification sent

✅ **Multiple notification channels**
- Email notifications working
- SMS notifications working
- Push notifications working
- In-app notifications working

✅ **User preferences respected**
- Preferences stored in database
- Preferences UI allows configuration
- Notifications only sent via enabled channels
- Default preferences set appropriately

---

## Notes

1. **Customer vs User**: The system needs to support both authenticated users (staff/admin) and customers (identified by phone/email). Notification preferences should work for both.

2. **Error Handling**: All notification services should have robust error handling and logging. Failed notifications should be retried.

3. **Rate Limiting**: Consider rate limiting for SMS and email to avoid costs and spam.

4. **Template Management**: Email and SMS templates should be easily customizable.

5. **Testing**: Set up test mode for development (don't send real emails/SMS in dev).

6. **Cost Management**: Monitor costs for SMS and email services. Consider batching or limiting frequency.

---

## Next Steps

1. Review and approve this plan
2. Set up service provider accounts (SendGrid/Twilio/etc.)
3. Generate VAPID keys for push notifications
4. Start with Phase 1 (Database Schema)
5. Implement incrementally, testing each phase

