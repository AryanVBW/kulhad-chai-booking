# Notification System Setup Guide

## Overview
This guide will help you set up the notification system for Kulhad Chai Booking. The system supports Email, SMS, and Push notifications.

## Prerequisites

1. **Database Migration**: Run the notification schema migration
2. **Service Provider Accounts**: Set up accounts for email and SMS services
3. **VAPID Keys**: Generate keys for push notifications

---

## Step 1: Database Migration

Run the migration file to create the notification tables:

```bash
# Apply migration through Supabase dashboard or CLI
# File: supabase/migrations/004_notifications_schema.sql
```

Or via Supabase CLI:
```bash
supabase migration up
```

---

## Step 2: Install Dependencies

Install required packages for notification services:

```bash
npm install web-push
```

For Email (choose one):
```bash
# Option 1: SendGrid
npm install @sendgrid/mail

# Option 2: Resend
npm install resend

# Option 3: Nodemailer (for SMTP)
npm install nodemailer
```

For SMS (choose one):
```bash
# Option 1: Twilio (Recommended)
npm install twilio

# Option 2: AWS SNS
npm install aws-sdk
```

---

## Step 3: Generate VAPID Keys for Push Notifications

Generate VAPID keys for Web Push API:

```bash
npx web-push generate-vapid-keys
```

This will output:
- Public Key (add to `.env.local` as `NEXT_PUBLIC_VAPID_PUBLIC_KEY`)
- Private Key (add to `.env.local` as `VAPID_PRIVATE_KEY`)

---

## Step 4: Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Email Service Configuration
EMAIL_SERVICE_PROVIDER=sendgrid  # or 'resend' or 'nodemailer'
EMAIL_API_KEY=your_email_api_key
EMAIL_FROM_ADDRESS=noreply@kulhadchai.shop
EMAIL_FROM_NAME=Kulhad Chai

# For Nodemailer (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# SMS Service Configuration
SMS_SERVICE_PROVIDER=twilio  # or 'aws-sns'
SMS_ACCOUNT_SID=your_twilio_account_sid
SMS_AUTH_TOKEN=your_twilio_auth_token
SMS_FROM_NUMBER=+1234567890

# For AWS SNS
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:admin@kulhadchai.shop
```

---

## Step 5: Service Provider Setup

### Email Service

#### Option 1: SendGrid
1. Sign up at https://sendgrid.com
2. Create an API key
3. Verify your sender email
4. Set `EMAIL_SERVICE_PROVIDER=sendgrid`
5. Add API key to `EMAIL_API_KEY`

#### Option 2: Resend
1. Sign up at https://resend.com
2. Create an API key
3. Verify your domain
4. Set `EMAIL_SERVICE_PROVIDER=resend`
5. Add API key to `EMAIL_API_KEY`

#### Option 3: Nodemailer (SMTP)
1. Use any SMTP provider (Gmail, Outlook, etc.)
2. Set `EMAIL_SERVICE_PROVIDER=nodemailer`
3. Configure SMTP settings in environment variables

### SMS Service

#### Option 1: Twilio (Recommended)
1. Sign up at https://www.twilio.com
2. Get Account SID and Auth Token
3. Get a phone number
4. Set `SMS_SERVICE_PROVIDER=twilio`
5. Add credentials to environment variables

#### Option 2: AWS SNS
1. Set up AWS account
2. Create IAM user with SNS permissions
3. Get access keys
4. Set `SMS_SERVICE_PROVIDER=aws-sns`
5. Add credentials to environment variables

---

## Step 6: Test the Setup

### Test Email Notifications
1. Create a test order
2. Check if email is sent (check spam folder)
3. Verify email content

### Test SMS Notifications
1. Create a test order with a phone number
2. Check if SMS is received
3. Verify SMS content

### Test Push Notifications
1. Go to `/admin-dashboard/settings/notifications`
2. Click "Enable Push Notifications"
3. Allow browser notifications
4. Create a test order
5. Check if push notification appears

---

## Step 7: Access Notification Settings

### For Admin/Staff
Navigate to: `/admin-dashboard/settings/notifications`

This page includes:
- Notification preferences (enable/disable channels per event)
- Push notification setup
- Notification center (view all notifications)

### For Customers
Notification preferences can be managed via:
- Customer profile (if implemented)
- Order confirmation page
- Settings page in customer portal

---

## Troubleshooting

### Email Not Sending
- Check email service provider configuration
- Verify API keys are correct
- Check spam folder
- Review service provider logs
- In development, check console for "DEV MODE" messages

### SMS Not Sending
- Verify phone number format (E.164: +1234567890)
- Check SMS service provider balance
- Verify API credentials
- Check service provider logs

### Push Notifications Not Working
- Verify VAPID keys are set correctly
- Check browser console for errors
- Ensure service worker is registered
- Verify HTTPS (required for push notifications)
- Check browser notification permissions

### Notifications Not Created
- Check database migration was applied
- Verify order creation/update triggers notifications
- Check server logs for errors
- Verify notification preferences exist

---

## Development Mode

In development, the notification services will log to console instead of actually sending:
- Email: `📧 [DEV MODE] Email would be sent:`
- SMS: `📱 [DEV MODE] SMS would be sent:`
- Push: `📱 [DEV MODE] Push notification would be sent:`

To test actual sending, configure the service providers and set `NODE_ENV=production`.

---

## Notification Events

The system sends notifications for:
- **Order Created**: When a new order is placed
- **Order Preparing**: When order status changes to "preparing"
- **Order Ready**: When order status changes to "ready"
- **Order Served**: When order status changes to "served"
- **Order Completed**: When order status changes to "completed"
- **Order Cancelled**: When order is cancelled

---

## Default Preferences

Default notification preferences:
- Order Created: Email ✅, SMS ✅, Push ✅, In-App ✅
- Order Status Changed: Email ✅, SMS ❌, Push ✅, In-App ✅
- Order Ready: Email ✅, SMS ✅, Push ✅, In-App ✅
- Order Completed: Email ✅, SMS ❌, Push ❌, In-App ✅
- Order Cancelled: Email ✅, SMS ✅, Push ✅, In-App ✅

Users can customize these preferences in the settings page.

---

## Next Steps

1. ✅ Run database migration
2. ✅ Install dependencies
3. ✅ Generate VAPID keys
4. ✅ Configure environment variables
5. ✅ Set up service provider accounts
6. ✅ Test notifications
7. ✅ Customize email templates (optional)
8. ✅ Set up monitoring/analytics (optional)

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs
3. Check service provider dashboards
4. Review notification records in database

