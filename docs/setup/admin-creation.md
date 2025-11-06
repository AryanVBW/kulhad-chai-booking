# Create Admin User Instructions

## Issue Fixed
✅ **Database Error Fixed**: The error `column tables.number does not exist` has been resolved. The code now correctly uses `table_number` to match the database schema.

## Create Admin Credentials

To create admin credentials for testing, follow these steps:

### Step 1: Get Your Supabase Service Role Key

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **kulhadchai-booking**
3. Go to **Settings** → **API**
4. Copy the **service_role** key (keep this secret!)

### Step 2: Update Environment Variables

Add the service role key to your `.env` file:

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 3: Run the Admin Creation Script

Run the following command to create the admin user:

```bash
node scripts/create-admin.js
```

This will create an admin user with these credentials:
- **Email**: `admin@kulhadchai.shop`
- **Password**: `KulhadChai@Admin2025`

### Step 4: Login

1. Start your development server: `npm run dev`
2. Navigate to: http://localhost:3000/admin/login
3. Login with the credentials above

## Alternative: Manual User Creation via Supabase Dashboard

If you prefer to create the user manually:

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **Add User**
3. Enter:
   - Email: `admin@kulhadchai.shop`
   - Password: `KulhadChai@Admin2025`
   - Auto Confirm User: ✅ (checked)
4. After creating, click on the user and add metadata:
   ```json
   {
     "role": "admin",
     "name": "Admin User"
   }
   ```

## Testing the Fix

After creating the admin user, test the order placement:

1. Go to the main menu page
2. Add items to cart
3. Click "Proceed to Checkout"
4. Fill in customer details (optional)
5. Click "Place Order"

The order should now be placed successfully without the database error!

## Summary of Changes Made

1. **Fixed database.ts**: Updated all references from `number` to `table_number` to match the actual database schema
2. **Fixed supabase.ts**: Updated TypeScript type definitions to use `table_number`
3. **Created admin user script**: Updated script with correct credentials matching the login page

The "Place Order" button should now work correctly! 🎉
