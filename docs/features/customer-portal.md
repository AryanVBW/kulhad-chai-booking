# Customer Portal - QR Ordering System

## Overview
The customer portal allows restaurant guests to browse the menu and place orders by scanning QR codes at their tables.

## User Flow

### 1. QR Code Scanning
- Each table has a unique QR code
- QR code contains table number parameter
- Scanning redirects to: `/?table=<number>`

### 2. Menu Browsing
- Menu loads from local data (completeMenuItems)
- Categories displayed as filter tabs
- Items shown in responsive grid layout
- Images optimized with Next.js Image component

### 3. Adding to Cart
- Click "Add to Cart" button
- Quantity controls appear (+ / -)
- Cart persists in localStorage
- Real-time cart total calculation

### 4. Checkout
- "Proceed to Checkout" button in cart footer
- Redirects to `/checkout?table=<number>`
- Customer enters contact details
- Order submitted to database

## Technical Implementation

### File Location
`/app/page.tsx` - Main customer portal page

### Key Components

#### MenuPage Component
```typescript
- State: menuItems, cart, selectedCategory, tableNumber
- Effects: Load menu data, sync with database
- Memoized: categories, filteredItems, totals
- Callbacks: addToCart, removeFromCart
```

#### MenuItem Component (Memoized)
```typescript
- Props: item, quantity, onAdd, onRemove, categoryInfo
- Prevents unnecessary re-renders
- Displays product info, image, price
- Handles add/remove actions
```

### Data Flow
```
1. Page loads → useEffect triggered
2. Initialize menu sync service
3. Load menu from completeMenuItems
4. Get table number from URL params
5. Load saved cart from localStorage
6. Render menu items by category
7. User interactions update cart state
8. Cart changes saved to localStorage
```

### State Management

#### Local State
- `menuItems`: Array of MenuItem objects
- `cart`: Array of OrderItem objects
- `selectedCategory`: Current filter
- `tableNumber`: From URL params
- `isLoading`: Loading state

#### Cart Persistence
```typescript
// Save to localStorage on cart change
localStorage.setItem('current_cart', JSON.stringify(newCart))

// Load on page mount
const savedCart = localStorage.getItem('current_cart')
if (savedCart) setCart(JSON.parse(savedCart))
```

### Performance Optimizations

1. **Memoization**
   - MenuItem component wrapped in React.memo
   - Expensive calculations with useMemo
   - Event handlers with useCallback

2. **Image Optimization**
   - Next.js Image component
   - Lazy loading with loading="lazy"
   - Blur placeholder for smooth loading
   - Responsive sizes for different viewports

3. **Code Splitting**
   - Dynamic imports for heavy components
   - Lazy loading for non-critical features

## Styling & UX

### Design System
- **Colors**: Orange/amber gradient theme
- **Typography**: Clean, readable fonts
- **Spacing**: Consistent padding/margins
- **Shadows**: Subtle depth with shadow-lg

### Responsive Design
```css
Grid Layout:
- Mobile: 1 column
- Small: 2 columns
- Medium: 3 columns
- Large: 4 columns
- XL: 5 columns
```

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Touch-friendly button sizes (min 44px)
- Screen reader friendly
- Focus indicators

### Animations
- Hover effects on cards
- Button press animations
- Smooth transitions
- Cart badge pulse effect

## Features

### Category Filtering
- All Items view
- Chai category
- Food category
- Snacks category
- Combos category
- Dynamic filtering based on available items

### Cart Management
- Add items with single click
- Increment/decrement quantity
- Remove items completely
- Real-time total calculation
- Persistent across page refreshes

### Order Information
- Table number display
- Item count badge
- Total amount calculation
- Preparation time estimates

### Mobile Optimization
- Touch-optimized controls
- Swipeable category tabs
- Fixed cart footer
- Safe area padding for notched devices

## Integration Points

### Menu Sync Service
```typescript
// Initialize mapping between local and database
await menuSyncService.initializeMapping()
```

### Database Integration
- Menu items can be synced with database
- Orders submitted via API
- Real-time updates possible

### Toast Notifications
```typescript
addToast({
  type: "success",
  title: "Item added to cart",
  description: `${menuItem.name} added successfully`,
  duration: 2000
})
```

## Testing Checklist

- [ ] QR code scanning works
- [ ] Menu loads correctly
- [ ] Category filtering works
- [ ] Add to cart functions
- [ ] Cart persists on refresh
- [ ] Quantity controls work
- [ ] Total calculates correctly
- [ ] Checkout redirect works
- [ ] Mobile responsive
- [ ] Images load properly
- [ ] Accessibility features work
- [ ] Performance is acceptable

## Known Issues & Fixes

### Issue: Cart not persisting
**Fix**: Ensure localStorage is available (browser context)

### Issue: Images not loading
**Fix**: Verify image paths in public folder

### Issue: Category filter not working
**Fix**: Check category IDs match between items and categories

## Future Enhancements

1. **Search Functionality**
   - Search bar for menu items
   - Filter by name, description, price

2. **Favorites**
   - Save favorite items
   - Quick reorder

3. **Dietary Filters**
   - Vegetarian/vegan options
   - Allergen information
   - Spice level indicators

4. **Order History**
   - View past orders
   - Reorder with one click

5. **Customization**
   - Special instructions
   - Ingredient modifications
   - Portion size options
