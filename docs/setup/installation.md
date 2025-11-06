# Installation Guide

## Prerequisites

### Required Software
- **Node.js**: v18.17 or higher
- **pnpm**: v8.0 or higher (recommended) or npm
- **Git**: Latest version
- **Code Editor**: VS Code (recommended)

### Accounts Required
- **Supabase Account**: For database and authentication
- **Vercel Account**: For deployment (optional)

## Step-by-Step Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd kulhad-chai-booking
```

### 2. Install Dependencies
```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 3. Environment Setup
Create `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**Get Supabase credentials:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings > API
4. Copy the URL and anon key

### 4. Database Setup
Run the database migrations:

```bash
# Navigate to Supabase dashboard
# Go to SQL Editor
# Run the migration file: supabase/migrations/001_initial_schema.sql
```

Or use Supabase CLI:
```bash
supabase db push
```

### 5. Create Admin User
Run the admin creation script:

```bash
node scripts/create-admin.js
```

Follow the prompts to create your first admin account.

### 6. Start Development Server
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Verification

### Check Installation
1. **Homepage loads**: Navigate to `http://localhost:3000`
2. **Menu displays**: Verify menu items are visible
3. **Admin login works**: Go to `/admin/login` and login with admin credentials
4. **Dashboard accessible**: Verify admin dashboard loads correctly

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
pnpm dev -- -p 3001
```

#### Supabase Connection Error
- Verify environment variables are correct
- Check Supabase project is active
- Ensure API keys are valid

#### Database Migration Errors
- Check SQL syntax in migration files
- Verify database permissions
- Review Supabase logs for errors

## Next Steps
- [Environment Configuration](./environment.md)
- [Database Setup Details](./database.md)
- [Admin User Management](./admin-creation.md)
