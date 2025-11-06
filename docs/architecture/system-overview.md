# System Architecture Overview

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Customer Portal  │  Admin Dashboard  │  Shop Portal        │
│  (QR Ordering)    │  (Management)     │  (Staff Interface)  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                       │
├─────────────────────────────────────────────────────────────┤
│  • App Router (React Server Components)                     │
│  • API Routes (Backend Logic)                               │
│  • Middleware (Auth & Session Management)                   │
│  • Context Providers (State Management)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
├─────────────────────────────────────────────────────────────┤
│  • PostgreSQL Database                                       │
│  • Authentication Service                                    │
│  • Real-time Subscriptions                                  │
│  • Storage (Images)                                          │
│  • Row Level Security (RLS)                                 │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Customer Portal
**Purpose**: Allow customers to browse menu and place orders via QR codes

**Key Features**:
- QR code scanning for table identification
- Real-time menu browsing with categories
- Shopping cart management
- Order placement and tracking
- Mobile-first responsive design

**Tech Stack**:
- Next.js pages with client-side rendering
- React hooks for state management
- Local storage for cart persistence
- Optimized images with Next.js Image

### 2. Admin Dashboard
**Purpose**: Complete business management interface

**Key Features**:
- Order management and tracking
- Menu/product management
- Customer database
- Invoice generation
- Payment tracking
- Analytics and reporting
- User management with RBAC

**Tech Stack**:
- Protected routes with authentication
- Server-side rendering for data security
- Real-time updates via Supabase subscriptions
- Recharts for data visualization

### 3. Shop Portal
**Purpose**: Staff interface for order processing

**Key Features**:
- Order queue management
- Order status updates
- Quick access to common tasks
- Simplified interface for speed

### 4. Authentication System
**Architecture**:
```
User Login
    ↓
Supabase Auth (JWT)
    ↓
Session Cookie Storage
    ↓
Middleware Validation
    ↓
Protected Route Access
```

**Security Layers**:
1. **Supabase Auth**: JWT-based authentication
2. **Middleware**: Session refresh and validation
3. **Protected Routes**: Component-level access control
4. **RLS Policies**: Database-level security

### 5. Database Layer
**PostgreSQL via Supabase**

**Key Tables**:
- `users` - User accounts and roles
- `menu_items` - Product catalog
- `orders` - Customer orders
- `order_items` - Order line items
- `tables` - Restaurant tables
- `customers` - Customer information
- `invoices` - Billing records
- `payments` - Payment transactions

**Relationships**:
- Orders → Order Items (1:many)
- Orders → Tables (many:1)
- Orders → Customers (many:1)
- Invoices → Payments (1:many)

## Data Flow

### Customer Order Flow
```
1. Customer scans QR code
2. Menu loads from database
3. Customer adds items to cart (local storage)
4. Order submitted to API
5. Order saved to database
6. Real-time notification to admin
7. Admin updates order status
8. Customer sees status update
```

### Admin Management Flow
```
1. Admin logs in (Supabase Auth)
2. Session validated by middleware
3. Dashboard loads with data from database
4. Admin makes changes (CRUD operations)
5. Changes saved via API routes
6. Database updated with RLS validation
7. Real-time updates to other users
```

## State Management

### Global State (Context API)
- **AuthContext**: User authentication state
- **ToastContext**: Notification system

### Local State (React Hooks)
- Component-specific state with useState
- Side effects with useEffect
- Memoization with useMemo/useCallback
- Form state with controlled components

### Server State
- Database queries via Supabase client
- Real-time subscriptions for live updates
- Optimistic UI updates for better UX

## Performance Optimizations

### Frontend
- Code splitting with dynamic imports
- Image optimization with Next.js Image
- Lazy loading for charts and heavy components
- Memoization to prevent unnecessary re-renders
- Virtual scrolling for large lists

### Backend
- Database indexing on frequently queried columns
- Query optimization with proper joins
- Connection pooling via Supabase
- Caching strategies for static data

### Network
- API route optimization
- Compression enabled
- CDN for static assets
- Efficient data fetching patterns

## Security Architecture

### Authentication
- JWT tokens with secure httpOnly cookies
- Session refresh mechanism
- Role-based access control (RBAC)
- Password hashing via Supabase

### Authorization
- Middleware-level route protection
- Component-level access control
- Database RLS policies
- API route validation

### Data Protection
- Input validation and sanitization
- SQL injection prevention via parameterized queries
- XSS protection with React's built-in escaping
- CSRF protection with SameSite cookies

## Scalability Considerations

### Current Architecture
- Supports small to medium restaurants
- Handles concurrent users efficiently
- Real-time updates for immediate feedback

### Future Scaling
- Multi-tenant architecture for multiple restaurants
- Microservices for specific features
- Caching layer (Redis) for high traffic
- Load balancing for horizontal scaling
