# Authentication Credentials - Kulhad Chai Restaurant

## Admin Portal Access

### Admin Credentials
- **Email:** `admin@kulhadchai.shop`
- **Password:** `KulhadChai@Admin2025`
- **Role:** Admin (Full Access)
- **User ID:** `31fa8bf5-5ca3-4e3e-83ac-f927edcf8083`

### Login URL
- **Admin Dashboard:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Production:** `https://your-domain.com/admin/login`

---

## Supabase Configuration

### Project Details
- **Project Name:** kulhadchai-booking
- **Project ID:** nibewegfktxovgskthcu
- **Region:** ap-south-1 (Mumbai)
- **Status:** ACTIVE_HEALTHY

### API Credentials
- **Project URL:** `https://nibewegfktxovgskthcu.supabase.co`
- **Anon/Public Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pYmV3ZWdma3R4b3Znc2t0aGN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NzI1NzAsImV4cCI6MjA3MjU0ODU3MH0.lYMsEHhGSQR01jjbVUWcTUiyipoJz_AyP3hVIEl7Y14`

### Environment Variables
Ensure these are set in your `.env` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://nibewegfktxovgskthcu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pYmV3ZWdma3R4b3Znc2t0aGN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NzI1NzAsImV4cCI6MjA3MjU0ODU3MH0.lYMsEHhGSQR01jjbVUWcTUiyipoJz_AyP3hVIEl7Y14
```

---

## User Roles & Permissions

### Admin Role
The admin user has full access to all features:
- ✅ Customer Management (Read, Write, Delete)
- ✅ Product Management (Read, Write, Delete)
- ✅ Invoice Management (Read, Write, Delete)
- ✅ Payment Tracking (Read, Write, Delete)
- ✅ Reports & Analytics (Read, Write, Delete)
- ✅ User Management (Read, Write, Delete)
- ✅ Business Settings (Full Access)
- ✅ Menu Management (Full Access)
- ✅ Order Management (Full Access)
- ✅ Table Management (Full Access)

### Manager Role (Future)
- ✅ Customer Management (Read, Write)
- ✅ Product Management (Read, Write)
- ✅ Invoice Management (Read, Write)
- ✅ Payment Tracking (Read)
- ✅ Reports & Analytics (Read)
- ✅ User Management (Read)

### Staff Role (Future)
- ✅ Customer Management (Read)
- ✅ Product Management (Read)
- ✅ Invoice Management (Read)
- ❌ Payment Tracking
- ❌ Reports & Analytics
- ❌ User Management

---

## Database Schema

### Core Tables Created
1. **customers** - Customer information and contact details
2. **products** - Product catalog with pricing and inventory
3. **invoices** - Invoice records with payment tracking
4. **invoice_items** - Line items for each invoice
5. **payments** - Payment transaction records
6. **users** - Internal user management (separate from auth.users)
7. **user_activities** - Audit log for user actions
8. **business_settings** - Business configuration and settings

### Restaurant Tables (Existing)
1. **menu_items** - Menu items for customer ordering
2. **menu_categories** - Menu categories
3. **orders** - Customer orders from QR code system
4. **order_items** - Order line items
5. **tables** - Restaurant table management
6. **bills** - Generated bills for orders

---

## Authentication Flow

### Login Process
1. User enters email and password on login page
2. Supabase Auth validates credentials
3. User metadata (name, role) is retrieved
4. Permissions are assigned based on role
5. User is redirected to appropriate dashboard
6. Session is maintained with JWT tokens

### Protected Routes
The following routes require authentication:
- `/admin-dashboard/*` - Admin only (role: admin)
- `/shop-portal/*` - Staff and above
- `/analytics-dashboard/*` - Admin and Manager

### Middleware Protection
The `middleware.ts` file handles:
- Session refresh on each request
- Route protection based on authentication status
- Role-based access control for admin routes
- Automatic redirect to login if unauthenticated

---

## Security Features

### Implemented
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ JWT-based authentication with Supabase Auth
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (RBAC)
- ✅ Protected API routes
- ✅ Environment variable protection
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection (React sanitization)

### Best Practices
- Never commit `.env` file to version control
- Rotate API keys regularly
- Use service role key only on server-side
- Implement rate limiting for production
- Enable 2FA for admin accounts (future)
- Regular security audits

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 2. Configure Environment
Copy the environment variables from the section above to your `.env` file.

### 3. Start Development Server
```bash
npm run dev
# or
pnpm dev
```

### 4. Access Admin Dashboard
1. Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
2. Enter admin credentials:
   - Email: `admin@kulhadchai.shop`
   - Password: `KulhadChai@Admin2025`
3. You'll be redirected to the admin dashboard

---

## Troubleshooting

### Cannot Login
- Verify email and password are correct
- Check that Supabase project is active
- Ensure environment variables are properly set
- Clear browser cache and cookies
- Check browser console for errors

### Dashboard Not Loading Data
- Verify Supabase connection is active
- Check RLS policies are properly configured
- Ensure tables have been created (run migrations)
- Check browser console for API errors
- Verify user has proper role and permissions

### Authentication Errors
- Check that user exists in `auth.users` table
- Verify user metadata includes role information
- Ensure middleware is properly configured
- Check that session is being maintained

---

## Support & Documentation

### Resources
- **Supabase Dashboard:** [https://supabase.com/dashboard](https://supabase.com/dashboard)
- **Supabase Docs:** [https://supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs:** [https://nextjs.org/docs](https://nextjs.org/docs)
- **Project README:** See `README.md` for full documentation

### Contact
For issues or questions, please refer to the project repository or contact the development team.

---

**Last Updated:** October 28, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅
