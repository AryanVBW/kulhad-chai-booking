# Common Issues & Solutions

## React Runtime Errors

### Maximum Update Depth Exceeded

**Error Message**:
```
Unhandled Runtime Error: Maximum update depth exceeded
This can happen when a component repeatedly calls setState inside 
componentWillUpdate or componentDidUpdate.
```

**Cause**: Infinite re-render loop caused by:
- Missing dependencies in useEffect
- State updates triggering the same effect
- Props changing on every render

**Solution**:
✅ **Fixed in**: `components/protected-route.tsx`
- Added missing `allowedRoles` dependency to useEffect
- Prevents infinite loop in authentication check

**Prevention**:
```typescript
// ❌ Bad - missing dependency
useEffect(() => {
  if (someValue) doSomething()
}, []) // someValue not in deps

// ✅ Good - all dependencies included
useEffect(() => {
  if (someValue) doSomething()
}, [someValue])
```

## Authentication Issues

### User Not Redirecting After Login

**Symptoms**:
- Login successful but stays on login page
- Dashboard not loading after authentication

**Causes**:
1. Session not being set properly
2. Middleware not refreshing session
3. Protected route not detecting user

**Solutions**:

1. **Check Supabase Session**:
```typescript
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)
```

2. **Verify Middleware**:
```typescript
// middleware.ts should refresh session
export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)
  await supabase.auth.getSession() // This refreshes
  return response
}
```

3. **Clear Browser Cache**:
- Clear cookies and localStorage
- Hard refresh (Cmd+Shift+R)

### Admin Access Denied

**Symptoms**:
- Logged in but can't access admin dashboard
- Redirected to login page

**Causes**:
- User role not set correctly
- Email not matching admin check

**Solutions**:

1. **Verify User Role**:
```sql
-- Check user metadata in Supabase
SELECT raw_user_meta_data FROM auth.users WHERE email = 'your@email.com';
```

2. **Update User Role**:
```sql
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your@email.com';
```

3. **Check Protected Route Logic**:
```typescript
const isAdmin = (user as any).user_metadata?.role === 'admin' || 
                user.email === 'admin@kulhadchai.shop'
```

## Database Issues

### Connection Errors

**Error**: `Failed to connect to Supabase`

**Solutions**:

1. **Check Environment Variables**:
```bash
# Verify .env.local has correct values
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

2. **Verify Supabase Project Status**:
- Go to Supabase dashboard
- Check if project is paused
- Restore if needed

3. **Test Connection**:
```typescript
const { data, error } = await supabase.from('menu_items').select('count')
console.log('Connection test:', { data, error })
```

### Migration Errors

**Error**: `Migration failed to apply`

**Solutions**:

1. **Check SQL Syntax**:
- Review migration file for errors
- Test SQL in Supabase SQL Editor

2. **Check Dependencies**:
- Ensure tables exist before adding foreign keys
- Create types before using them

3. **Manual Rollback**:
```sql
-- Drop problematic table/column
DROP TABLE IF EXISTS problematic_table CASCADE;
-- Re-run migration
```

## Build & Deployment Issues

### Build Fails with Type Errors

**Error**: `Type error: Property 'x' does not exist`

**Solutions**:

1. **Update TypeScript Types**:
```bash
pnpm run build
# Fix any type errors shown
```

2. **Check Import Paths**:
```typescript
// Use @ alias for imports
import { Component } from '@/components/Component'
```

3. **Verify tsconfig.json**:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Environment Variables Not Working

**Symptoms**:
- Variables undefined in production
- Features not working after deployment

**Solutions**:

1. **Vercel Environment Variables**:
- Go to Vercel dashboard
- Settings > Environment Variables
- Add all NEXT_PUBLIC_* variables

2. **Rebuild After Adding Variables**:
- Trigger new deployment
- Variables only available after rebuild

3. **Check Variable Names**:
- Must start with NEXT_PUBLIC_ for client-side
- Server-only variables don't need prefix

## Performance Issues

### Slow Page Load

**Symptoms**:
- Pages take long to load
- Laggy interactions

**Solutions**:

1. **Check Network Tab**:
- Identify slow requests
- Optimize database queries
- Add indexes to frequently queried columns

2. **Optimize Images**:
```typescript
// Use Next.js Image with proper sizing
<Image 
  src="/image.jpg"
  width={500}
  height={300}
  loading="lazy"
  placeholder="blur"
/>
```

3. **Code Splitting**:
```typescript
// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'))
```

### Memory Leaks

**Symptoms**:
- Browser becomes slow over time
- Tab crashes after extended use

**Solutions**:

1. **Clean Up Effects**:
```typescript
useEffect(() => {
  const subscription = subscribeToData()
  
  return () => {
    subscription.unsubscribe() // Cleanup
  }
}, [])
```

2. **Remove Event Listeners**:
```typescript
useEffect(() => {
  const handler = () => {}
  window.addEventListener('resize', handler)
  
  return () => {
    window.removeEventListener('resize', handler)
  }
}, [])
```

## UI/UX Issues

### Responsive Design Broken

**Symptoms**:
- Layout breaks on mobile
- Elements overlapping

**Solutions**:

1. **Check Tailwind Classes**:
```typescript
// Use responsive prefixes
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

2. **Test on Multiple Devices**:
- Chrome DevTools device emulation
- Real device testing
- Different screen sizes

### Styling Not Applied

**Symptoms**:
- Tailwind classes not working
- Custom CSS not loading

**Solutions**:

1. **Rebuild Tailwind**:
```bash
pnpm dev
# Restart dev server
```

2. **Check tailwind.config.ts**:
```typescript
content: [
  './app/**/*.{js,ts,jsx,tsx}',
  './components/**/*.{js,ts,jsx,tsx}',
]
```

3. **Import Global CSS**:
```typescript
// app/layout.tsx
import '@/styles/globals.css'
```

## Getting Help

### Debug Checklist
1. Check browser console for errors
2. Review Network tab for failed requests
3. Check Supabase logs
4. Verify environment variables
5. Test in incognito mode
6. Clear cache and cookies

### Reporting Issues
When reporting issues, include:
- Error message (full stack trace)
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS version
- Screenshots if applicable

### Useful Commands
```bash
# Check logs
pnpm dev # Development logs

# Clear cache
rm -rf .next
pnpm dev

# Reset database (careful!)
# Run in Supabase SQL Editor
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
# Then re-run migrations

# Check Node version
node --version

# Check pnpm version
pnpm --version
```
