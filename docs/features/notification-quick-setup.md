# Notification System - Quick Setup Guide

## ✅ Completed Steps

1. ✅ **Dependencies Installed**
   - `web-push` - For push notifications
   - `nodemailer` - For email (SMTP)
   - `twilio` - For SMS

2. ✅ **VAPID Keys Generated**
   - Public Key: `BBVqFc3aMD9pIALeRpfWwJDg5_i4uMH_mby-GvVYhbK8RVP5oJOacGdWBqGEoJySsuJmt-vqRMvIJ0o-dcancQc`
   - Private Key: `0nrkt8buHZ1sYeR4Z1GPaOmKSa15iXjickMm5mgwo58`

---

## 📋 Remaining Steps

### Step 1: Create/Update `.env.local` File

Create a `.env.local` file in the project root with the following content:

```env
# ============================================
# Supabase Configuration (if not already set)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ============================================
# Email Service Configuration
# ============================================
EMAIL_SERVICE_PROVIDER=nodemailer
EMAIL_API_KEY=your_email_api_key_here
EMAIL_FROM_ADDRESS=noreply@kulhadchai.shop
EMAIL_FROM_NAME=Kulhad Chai

# For Nodemailer (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user@gmail.com
SMTP_PASS=your_smtp_app_password

# ============================================
# SMS Service Configuration
# ============================================
SMS_SERVICE_PROVIDER=twilio
SMS_ACCOUNT_SID=your_twilio_account_sid_here
SMS_AUTH_TOKEN=your_twilio_auth_token_here
SMS_FROM_NUMBER=+1234567890

# ============================================
# Push Notifications (VAPID Keys - Already Generated)
# ============================================
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BBVqFc3aMD9pIALeRpfWwJDg5_i4uMH_mby-GvVYhbK8RVP5oJOacGdWBqGEoJySsuJmt-vqRMvIJ0o-dcancQc
VAPID_PRIVATE_KEY=0nrkt8buHZ1sYeR4Z1GPaOmKSa15iXjickMm5mgwo58
VAPID_SUBJECT=mailto:admin@kulhadchai.shop

# ============================================
# App Configuration
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note**: Replace all placeholder values with your actual credentials.

---

### Step 2: Run Database Migration

You have two options:

#### Option A: Via Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **"New Query"**
5. Open the file: `supabase/migrations/004_notifications_schema.sql`
6. Copy the entire SQL content
7. Paste it into the SQL Editor
8. Click **"Run"** to execute the migration

#### Option B: Via Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (get project-ref from Supabase dashboard)
supabase link --project-ref your-project-ref

# Run the migration
supabase migration up
```

---

### Step 3: Set Up Email Service

Choose one of the following:

#### Option A: Gmail SMTP (Easiest for testing)

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Generate an App Password: https://myaccount.google.com/apppasswords
4. Use the app password in `SMTP_PASS`
5. Set `SMTP_USER` to your Gmail address
6. Set `EMAIL_SERVICE_PROVIDER=nodemailer`

#### Option B: SendGrid

1. Sign up at https://sendgrid.com
2. Create an API key
3. Verify your sender email
4. Set `EMAIL_SERVICE_PROVIDER=sendgrid`
5. Add API key to `EMAIL_API_KEY`
6. Install: `npm install @sendgrid/mail`

#### Option C: Resend

1. Sign up at https://resend.com
2. Create an API key
3. Verify your domain
4. Set `EMAIL_SERVICE_PROVIDER=resend`
5. Add API key to `EMAIL_API_KEY`
6. Install: `npm install resend`

---

### Step 4: Set Up SMS Service

#### Option A: Twilio (Recommended)

1. Sign up at https://www.twilio.com (free trial available)
2. Get your Account SID and Auth Token from the dashboard
3. Get a phone number (free trial number available)
4. Set `SMS_SERVICE_PROVIDER=twilio`
5. Add credentials to `.env.local`:
   - `SMS_ACCOUNT_SID` - Your Account SID
   - `SMS_AUTH_TOKEN` - Your Auth Token
   - `SMS_FROM_NUMBER` - Your Twilio phone number (format: +1234567890)

#### Option B: AWS SNS

1. Set up AWS account
2. Create IAM user with SNS permissions
3. Get access keys
4. Set `SMS_SERVICE_PROVIDER=aws-sns`
5. Add credentials to `.env.local`:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
6. Install: `npm install aws-sdk`

---

## 🧪 Testing the Setup

### Test Email Notifications

1. Start your development server: `npm run dev`
2. Create a test order with a customer email
3. Check if email is sent (check spam folder)
4. In development mode, check console for: `📧 [DEV MODE] Email would be sent:`

### Test SMS Notifications

1. Create a test order with a customer phone number
2. Check if SMS is received
3. In development mode, check console for: `📱 [DEV MODE] SMS would be sent:`

### Test Push Notifications

1. Go to `/admin-dashboard/settings/notifications`
2. Click "Enable Push Notifications"
3. Allow browser notifications when prompted
4. Create a test order
5. Check if push notification appears

---

## 📝 Important Notes

### Development Mode

In development (`NODE_ENV=development`), notification services will:
- Log to console instead of actually sending
- Show messages like: `📧 [DEV MODE] Email would be sent:`
- This allows testing without configuring service providers

### Production Mode

For production:
1. Set `NODE_ENV=production`
2. Configure all service providers
3. Add real credentials to `.env.local` (or environment variables)
4. Test thoroughly before going live

### Security

- Never commit `.env.local` to git (it's in `.gitignore`)
- Keep VAPID private key secret
- Use environment variables in production (Vercel, etc.)
- Rotate API keys regularly

---

## ✅ Verification Checklist

- [ ] `.env.local` file created with all variables
- [ ] Database migration applied successfully
- [ ] Email service configured (Gmail/SendGrid/Resend)
- [ ] SMS service configured (Twilio/AWS SNS)
- [ ] VAPID keys added to `.env.local`
- [ ] Test email notification works
- [ ] Test SMS notification works
- [ ] Test push notification works
- [ ] Notification preferences page accessible
- [ ] Notification center displays notifications

---

## 🆘 Troubleshooting

### Migration Fails

- Check if tables already exist (may need to drop first)
- Verify you have proper database permissions
- Check Supabase logs for errors

### Email Not Sending

- Verify SMTP credentials are correct
- Check spam folder
- For Gmail: Make sure App Password is used (not regular password)
- Check service provider logs/dashboard

### SMS Not Sending

- Verify phone number format (E.164: +1234567890)
- Check Twilio account balance
- Verify API credentials
- Check Twilio logs in dashboard

### Push Notifications Not Working

- Verify VAPID keys are set correctly
- Check browser console for errors
- Ensure HTTPS (required for push)
- Check browser notification permissions
- Verify service worker is registered

---

## 📚 Additional Resources

- Full Setup Guide: `docs/features/notification-system-setup.md`
- Implementation Plan: `docs/features/notification-system-implementation-plan.md`
- Checklist: `docs/features/notification-system-checklist.md`

---

## 🎉 You're All Set!

Once you've completed these steps, your notification system is ready to use. Notifications will be sent automatically when:
- Orders are created
- Order status changes
- Orders are ready
- Orders are completed
- Orders are cancelled

Users can manage their preferences at `/admin-dashboard/settings/notifications`

