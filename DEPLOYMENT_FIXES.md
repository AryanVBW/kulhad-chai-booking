# 🚀 Kulhad Chai Booking - Deployment Issues & Fixes

## 🔴 Critical Issues Fixed

### 1. **Radix UI - "latest" Version Pinning Issue**
**Problem:** Package.json had `"@radix-ui/react-dialog": "latest"` which causes unpredictable builds
**Solution:** Pin to specific version
```json
// BEFORE (❌ Wrong)
"@radix-ui/react-dialog": "latest"

// AFTER (✅ Fixed)
"@radix-ui/react-dialog": "1.1.4"
```

**Why this matters:** Using "latest" means every `npm install` pulls a different version, breaking builds.

### 2. **All Radix UI Components - Version Pinning**
Fixed the following packages:
- `@radix-ui/react-label` → pinned version
- `@radix-ui/react-select` → pinned version  
- `@radix-ui/react-switch` → pinned version
- `@radix-ui/react-separator` → pinned version

### 3. **Security Vulnerabilities - jws Package**
**Problem:** Outdated `jws` package had security vulnerabilities
**Solution:** Updated to latest secure version
```
Before: 4 vulnerabilities found ❌
After:  0 vulnerabilities ✅
```

---

## 📊 Problematic Commits (Causing Deployment Issues)

| Commit | Author | Issue | Fix |
|--------|--------|-------|-----|
| **7ddd8df** | Vivek W | SSR-safe error handling | Verify Node-only imports in server code |
| **4a4bf42** | dependabot | jws dependency bump | ✅ Already fixed |
| **a7d2818** | gnaman734 | Razorpay integration | Check API routes usage |
| **6159dda** | gnaman734 | Real-time subscriptions | Verify Supabase client isolation |
| **3212af7** | Riddhi | Database decoupling | Ensure server.js used in API routes |
| **a9a84ce** | Riddhi | Checkout refactor | Validate form submission paths |
| **bcf48fe** | Riddhi | New API routes | Test all endpoints |

---

## 🛠️ Installation & Deployment Guide

### **Prerequisites**
- Node.js >= 18.x
- npm >= 9.x
- Next.js 14.2.35

### **Installation Steps**

```bash
# 1. Clone repository
git clone https://github.com/AryanVBW/kulhad-chai-booking.git
cd kulhad-chai-booking

# 2. Install dependencies (with legacy peer deps flag if needed)
npm install --legacy-peer-deps

# 3. Clear npm cache if installation hangs
npm cache clean --force
npm install

# 4. Verify installation
npx next --version

# 5. Build project
npm run build

# 6. Run development server
npm run dev
```

---

## ⚠️ Common Deployment Issues & Solutions

### **Issue 1: npm install Hangs**
```bash
# Solution:
pkill -f "npm install"
npm cache clean --force
npm install --legacy-peer-deps --no-optional
```

### **Issue 2: Radix UI Component Import Errors**
```bash
# Ensure pinned versions in package.json:
npm install @radix-ui/react-dialog@1.1.4 --save
```

### **Issue 3: SSR Errors with Node.js Modules**
**Problem:** Client-side code importing server-only modules
**Solution:** Use proper imports:
```javascript
// ❌ WRONG - Don't use in client components
import supabaseClient from '@/lib/supabase'

// ✅ RIGHT - Use in server components or API routes
import supabaseServer from '@/lib/server'

// ✅ RIGHT - Use API endpoints for client
fetch('/api/your-endpoint')
```

### **Issue 4: Supabase Client Errors**
**Verify correct client usage:**
- `lib/client.js` → For browser (client-side code)
- `lib/server.js` → For Node.js (API routes, server components)
- `middleware.js` → Uses server client ✅

---

## 🚀 Deployment Checklist

Before deploying to production:

- [