# Supabase Setup Guide for Restaurant System

This guide will help you set up Supabase for the restaurant management system with real-time order updates.

## Prerequisites

1. Node.js installed
2. Supabase CLI installed (`npm install -g supabase`)
3. A Supabase account (https://supabase.com)

## Setup Steps

### 1. Create a New Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `restaurant-system`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your location)
5. Click "Create new project"
6. Wait for the project to be created (this may take a few minutes)

### 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - Project URL
   - Project API Key (anon/public)
   - Service Role Key (keep this secret!)

### 3. Configure Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database Configuration
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-id.supabase.co:5432/postgres

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Database Migrations

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste it into the SQL Editor and click "Run"
4. This will create all the necessary tables, indexes, and sample data

### 5. Verify Database Setup

1. Go to the Table Editor in your Supabase dashboard
2. You should see the following tables:
   - `menu_items` (with sample menu data)
   - `tables` (with sample table data)
   - `orders` (empty initially)
   - `order_items` (empty initially)

### 6. Configure Row Level Security (Optional)

The migration script includes basic RLS policies that allow public access. For production, you may want to:

1. Create user authentication
2. Implement more restrictive policies
3. Add role-based access control

### 7. Test the Connection

1. Start your development server: `npm run dev`
2. The app should now connect to Supabase instead of using local storage
3. Orders placed will be stored in the database
4. Real-time updates should work between customer orders and admin dashboard

## Real-time Features

The system includes real-time subscriptions for:

- **Orders**: New orders appear instantly in the admin dashboard
- **Order Status Updates**: Status changes are reflected in real-time
- **Table Status**: Table availability updates in real-time

## Database Schema Overview

### Tables

1. **menu_items**
   - Stores all menu items with categories, prices, and availability
   - Includes preparation time and combo item support

2. **tables**
   - Restaurant table information with capacity and QR codes
   - Status tracking (available, occupied, reserved, cleaning)

3. **orders**
   - Customer orders with status tracking
   - Links to tables and includes customer information

4. **order_items**
   - Individual items within each order
   - Quantity, price, and special notes

### Key Features

- **UUID Primary Keys**: All tables use UUID for better scalability
- **Timestamps**: Automatic created_at and updated_at tracking
- **Indexes**: Optimized for common queries
- **Constraints**: Data integrity with proper foreign keys
- **Triggers**: Automatic timestamp updates

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify your environment variables are correct
   - Check that your Supabase project is active
   - Ensure your IP is not blocked (check Supabase dashboard)

2. **Migration Errors**
   - Make sure you're running the SQL in the correct order
   - Check for any syntax errors in the migration file
   - Verify you have the necessary permissions

3. **Real-time Not Working**
   - Check that Realtime is enabled in your Supabase project
   - Verify your RLS policies allow the necessary operations
   - Check browser console for WebSocket connection errors

### Getting Help

- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: Create an issue in this repository

## Production Deployment

For production deployment:

1. Update environment variables with production URLs
2. Review and tighten RLS policies
3. Set up proper backup strategies
4. Configure monitoring and alerts
5. Consider implementing rate limiting
6. Set up proper error logging

## Security Considerations

- Never commit your service role key to version control
- Use environment variables for all sensitive data
- Implement proper RLS policies for production
- Consider implementing user authentication
- Regularly review and update access permissions