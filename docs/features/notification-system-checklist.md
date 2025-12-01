# Notification System Implementation Checklist

## Quick Reference Checklist

### Phase 1: Database Schema ✅
- [ ] Create migration file `004_notifications_schema.sql`
- [ ] Create `notifications` table
- [ ] Create `notification_preferences` table
- [ ] Create `push_subscriptions` table
- [ ] Add indexes for performance
- [ ] Set up RLS policies
- [ ] Test migration locally

### Phase 2: Core Service Layer ✅
- [ ] Create `lib/notification-service.js`
- [ ] Implement `getPreferences()`
- [ ] Implement `updatePreferences()`
- [ ] Implement `createNotification()`
- [ ] Implement `sendNotification()`
- [ ] Implement `sendOrderNotification()`
- [ ] Implement `getNotifications()`
- [ ] Implement `markAsRead()`

### Phase 3: Channel Services ✅

#### Email Service
- [ ] Install email library (nodemailer/sendgrid/resend)
- [ ] Create `lib/services/email-service.js`
- [ ] Implement email sending functions
- [ ] Create email templates in `lib/templates/email/`
- [ ] Add environment variables
- [ ] Test email sending

#### SMS Service
- [ ] Install SMS library (twilio/aws-sns)
- [ ] Create `lib/services/sms-service.js`
- [ ] Implement SMS sending functions
- [ ] Add environment variables
- [ ] Test SMS sending

#### Push Service
- [ ] Install `web-push` library
- [ ] Generate VAPID keys
- [ ] Create `lib/services/push-service.js`
- [ ] Implement push subscription functions
- [ ] Implement push sending functions
- [ ] Add environment variables
- [ ] Test push notifications

### Phase 4: API Endpoints ✅
- [ ] Create `app/api/notifications/preferences/route.js`
- [ ] Create `app/api/notifications/push/subscribe/route.js`
- [ ] Create `app/api/notifications/route.js`
- [ ] Test all API endpoints

### Phase 5: Order Integration ✅
- [ ] Modify `app/api/orders/route.js` - add notification on order create
- [ ] Modify `lib/database.js` - add notification on status update
- [ ] Test order created notification
- [ ] Test order status change notification

### Phase 6: Frontend Components ✅
- [ ] Create notification preferences UI component
- [ ] Create push notification setup component
- [ ] Create notification center/inbox
- [ ] Update existing order notification component
- [ ] Add notification preferences page to admin dashboard

### Phase 7: Background Processing (Optional) ✅
- [ ] Create notification queue system
- [ ] Set up cron job for processing
- [ ] Implement retry logic for failed notifications

### Testing & Validation ✅
- [ ] Test order created → all channels
- [ ] Test order status changed → all channels
- [ ] Test user preferences (enable/disable channels)
- [ ] Test customer notifications (by phone/email)
- [ ] Test admin/staff notifications (by user_id)
- [ ] Verify error handling and logging
- [ ] Performance testing

### Documentation ✅
- [ ] Update README with notification setup
- [ ] Document environment variables
- [ ] Document service provider setup
- [ ] Create user guide for preferences

---

## File Structure

```
kulhad-chai-booking3/
├── supabase/
│   └── migrations/
│       └── 004_notifications_schema.sql
├── lib/
│   ├── notification-service.js
│   ├── services/
│   │   ├── email-service.js
│   │   ├── sms-service.js
│   │   └── push-service.js
│   └── templates/
│       └── email/
│           ├── order-created.html
│           ├── order-status.html
│           └── ...
├── app/
│   └── api/
│       └── notifications/
│           ├── preferences/
│           │   └── route.js
│           ├── push/
│           │   └── subscribe/
│           │       └── route.js
│           └── route.js
├── components/
│   ├── notification-preferences.jsx
│   ├── push-notification-setup.jsx
│   ├── notification-center.jsx
│   └── order-notification.jsx (update)
└── app/
    └── admin-dashboard/
        └── settings/
            └── notifications/
                └── page.jsx
```

---

## Service Provider Setup Links

- **Email**: 
  - SendGrid: https://sendgrid.com
  - Resend: https://resend.com
  - Nodemailer: https://nodemailer.com

- **SMS**: 
  - Twilio: https://www.twilio.com
  - AWS SNS: https://aws.amazon.com/sns
  - MessageBird: https://www.messagebird.com

- **Push Notifications**: 
  - Web Push API (built-in, needs VAPID keys)
  - Generate VAPID keys: `npx web-push generate-vapid-keys`

---

## Quick Start Commands

```bash
# Install dependencies
npm install nodemailer twilio web-push

# Generate VAPID keys for push notifications
npx web-push generate-vapid-keys

# Run migration
# (Apply migration through Supabase dashboard or CLI)
```

---

## Environment Variables Template

```env
# Email
EMAIL_SERVICE_PROVIDER=sendgrid
EMAIL_API_KEY=
EMAIL_FROM_ADDRESS=
EMAIL_FROM_NAME=Kulhad Chai

# SMS
SMS_SERVICE_PROVIDER=twilio
SMS_ACCOUNT_SID=
SMS_AUTH_TOKEN=
SMS_FROM_NUMBER=

# Push
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@kulhadchai.shop
```



