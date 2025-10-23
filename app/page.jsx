"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Plus, Minus, ShoppingCart, Clock } from "lucide-react";
import Image from "next/image";
import { completeMenuItems, menuCategories } from "@/lib/menu-data";
import { menuSyncService } from "@/lib/menu-sync";
import { Navbar } from "@/components/navbar";
import { MenuItemSkeleton, CategoryTabSkeleton } from "@/components/loading-skeleton";
import { useToast } from "@/components/toast";

// Memoized MenuItem component to prevent unnecessary re-renders
const MenuItem = memo(({
  item,
  quantity,
  onAdd,
  onRemove,
  categoryInfo
}) => {
  return <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-orange-100/50 p-4 sm:p-6 card-hover group touch-target" role="article" aria-label={`Menu item: ${item.name}`}>
      <div className="flex flex-col h-full">
        {/* Product Image */}
        {item.image && <div className="relative w-full h-40 sm:h-48 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50">
            <Image src={item.image} alt={`${item.name} - ${item.description}`} fill className="object-cover transition-transform duration-300 group-hover:scale-110" sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" loading="lazy" placeholder="blur" blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==" priority={false} />
          </div>}
        
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${categoryInfo?.color || 'from-gray-400 to-gray-500'} text-white shadow-sm`}>
            <span className="mr-1">{categoryInfo?.icon || '🍽️'}</span>
            {categoryInfo?.name || 'Item'}
          </span>
          {item.isCombo && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm animate-pulse">
              🎉 COMBO
            </span>}
        </div>

        {/* Item Info */}
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-orange-600 transition-colors">{item.name}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
          
          {/* Combo Items */}
          {item.isCombo && item.comboItems && <div className="mb-3 p-2 bg-orange-50 rounded-lg">
              <p className="text-xs font-semibold text-orange-700 mb-1">Includes:</p>
              <ul className="text-xs text-orange-600 space-y-1">
                {item.comboItems.slice(0, 3).map((comboItem, index) => <li key={index} className="flex items-center">
                    <span className="w-1 h-1 bg-orange-400 rounded-full mr-2"></span>
                    {comboItem}
                  </li>)}
                {item.comboItems.length > 3 && <li className="text-orange-500 font-medium">+{item.comboItems.length - 3} more items</li>}
              </ul>
            </div>}
        </div>

        {/* Price and Time */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">₹{item.price}</span>
            {item.isCombo && <span className="text-xs text-green-600 font-medium">💰 Great Value!</span>}
          </div>
          <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            <Clock className="h-3 w-3 mr-1" />
            <span>{item.preparationTime} min</span>
          </div>
        </div>

        {/* Add to Cart Controls */}
        <div className="flex items-center justify-center">
          {quantity > 0 ? <div className="flex items-center space-x-3 bg-orange-50 rounded-full px-4 py-3">
              <button onClick={() => onRemove(item.id)} className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white flex items-center justify-center hover:shadow-lg button-press focus-ring active:scale-95 transition-transform" aria-label={`Remove one ${item.name} from cart`} type="button">
                <Minus className="h-5 w-5" />
              </button>
              <span className="font-bold text-gray-900 text-lg min-w-[32px] text-center" aria-label={`${quantity} items in cart`} role="status">
                {quantity}
              </span>
              <button onClick={() => onAdd(item)} className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center hover:shadow-lg button-press focus-ring active:scale-95 transition-transform" aria-label={`Add one more ${item.name} to cart`} type="button">
                <Plus className="h-5 w-5" />
              </button>
            </div> : <button onClick={() => onAdd(item)} className="w-full min-h-[48px] bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-3 px-6 rounded-full hover:shadow-lg button-press focus-ring transition-all duration-200 active:scale-98" aria-label={`Add ${item.name} to cart for ₹${item.price}`} type="button">
              Add to Cart
            </button>}
        </div>
      </div>
    </div>;
});
MenuItem.displayName = 'MenuItem';
export default function MenuPage() {
  const [menuItems, setMenuItems] = useState(completeMenuItems);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("chai");
  const [tableNumber, setTableNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    addToast
  } = useToast();
  useEffect(() => {
    const loadData = async () => {
      console.log('useEffect loadData started');
      setIsLoading(true);
      try {
        // Initialize menu sync service for database mapping
        await menuSyncService.initializeMapping();
        console.log('Menu sync service initialized');

        // Use local menu data for display
        console.log('Using local menu data:', completeMenuItems.length);
        setMenuItems(completeMenuItems);
        console.log('menuItems set, length:', completeMenuItems.length);

        // Get table number from URL params
        const params = new URLSearchParams(globalThis.location.search);
        setTableNumber(params.get("table") || "1");

        // Load cart from localStorage (keep this for user session)
        const savedCart = localStorage.getItem('current_cart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        addToast({
          type: "error",
          title: "Error",
          description: "Failed to load menu data. Please refresh the page."
        });
      } finally {
        setIsLoading(false);
        console.log('useEffect loadData completed');
      }
    };
    loadData();
  }, [addToast]);

  // Memoize expensive calculations
  const categories = useMemo(() => {
    return menuCategories.filter(category => {
      const hasItems = menuItems.some(item => item.category === category.id);
      return hasItems;
    });
  }, [menuItems]);
  const filteredItems = useMemo(() => {
    return selectedCategory === "all" ? menuItems.filter(item => item.available) : menuItems.filter(item => item.category === selectedCategory && item.available);
  }, [menuItems, selectedCategory]);
  const addToCart = useCallback(menuItem => {
    setCart(prev => {
      const existing = prev.find(item => item.menuItemId === menuItem.id);
      let newCart;
      if (existing) {
        addToast({
          type: "success",
          title: "Item added to cart",
          description: `${menuItem.name} quantity increased`,
          duration: 2000
        });
        newCart = prev.map(item => item.menuItemId === menuItem.id ? {
          ...item,
          quantity: item.quantity + 1
        } : item);
      } else {
        addToast({
          type: "success",
          title: "Item added to cart",
          description: `${menuItem.name} added successfully`,
          duration: 2000
        });
        newCart = [...prev, {
          menuItemId: menuItem.id,
          quantity: 1,
          price: menuItem.price
        }];
      }
      // Save to localStorage
      localStorage.setItem('current_cart', JSON.stringify(newCart));
      return newCart;
    });
  }, [addToast]);
  const removeFromCart = useCallback(menuItemId => {
    setCart(prev => {
      const existing = prev.find(item => item.menuItemId === menuItemId);
      let newCart;
      if (existing && existing.quantity > 1) {
        newCart = prev.map(item => item.menuItemId === menuItemId ? {
          ...item,
          quantity: item.quantity - 1
        } : item);
      } else {
        newCart = prev.filter(item => item.menuItemId !== menuItemId);
      }
      // Save to localStorage
      localStorage.setItem('current_cart', JSON.stringify(newCart));
      return newCart;
    });
  }, []);
  const getCartItemQuantity = useCallback(menuItemId => {
    return cart.find(item => item.menuItemId === menuItemId)?.quantity || 0;
  }, [cart]);
  const getTotalAmount = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);
  const getTotalItems = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);
  const handleCartClick = useCallback(() => {
    // Scroll to cart section or show cart modal
    const cartSection = document.querySelector('.cart-footer');
    if (cartSection) {
      cartSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, []);
  return <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
        {/* Navbar */}
        <Navbar cartItemCount={getTotalItems} showCart={true} onCartClick={handleCartClick} />
      
        {/* Table and Status Info */}
        <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-orange-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            {tableNumber && <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full text-sm font-medium shadow-md">
                Table {tableNumber}
              </span>}
            <div className="flex items-center space-x-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Open 24/7</span>
            </div>
          </div>
        </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 pb-24 sm:px-6 lg:px-8">
        {/* Category Tabs */}
        <div className="mb-6 sm:mb-8">
          {isLoading ? <CategoryTabSkeleton /> : <div className="flex space-x-2 sm:space-x-3 overflow-x-auto pb-3 custom-scrollbar scrollbar-hide snap-x snap-mandatory md:justify-center md:flex-wrap md:overflow-visible" role="tablist" aria-label="Menu categories">
              <button onClick={() => setSelectedCategory("all")} className={`flex items-center space-x-2 px-5 py-3 min-h-[48px] rounded-2xl whitespace-nowrap transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 snap-start ${selectedCategory === "all" ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-200" : "bg-white/90 backdrop-blur-md text-gray-700 hover:bg-white/95 border border-orange-100/50"}`} role="tab" aria-selected={selectedCategory === "all"} aria-controls="menu-items" type="button">
                <span className="text-lg" aria-hidden="true">🍽️</span>
                <span className="font-semibold text-sm sm:text-base">All Items</span>
              </button>
              {categories.map(category => <button key={category.id} onClick={() => setSelectedCategory(category.id)} className={`flex items-center space-x-2 px-5 py-3 min-h-[48px] rounded-2xl whitespace-nowrap transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 snap-start ${selectedCategory === category.id ? `bg-gradient-to-r ${category.color} text-white shadow-lg` : "bg-white/90 backdrop-blur-md text-gray-700 hover:bg-white/95 border border-orange-100/50"}`} role="tab" aria-selected={selectedCategory === category.id} aria-controls="menu-items" type="button">
                  <span className="text-lg" aria-hidden="true">{category.icon}</span>
                  <span className="font-semibold text-sm sm:text-base">{category.name}</span>
                </button>)}
            </div>}
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6" id="menu-items" role="tabpanel" aria-label="Menu items">
          {isLoading ? Array.from({
            length: 6
          }).map((_, i) => <MenuItemSkeleton key={`skeleton-${i}`} />) : (selectedCategory === "all" ? menuItems : filteredItems).map(item => <MenuItem key={item.id} item={item} quantity={getCartItemQuantity(item.id)} categoryInfo={categories.find(cat => cat.id === item.category)} onAdd={addToCart} onRemove={removeFromCart} />)}
        </div>
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && <div className="cart-footer fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-orange-200/50 p-4 sm:p-6 shadow-2xl z-40 safe-area-bottom" role="region" aria-label="Shopping cart summary">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative" aria-hidden="true">
                  <ShoppingCart className="h-6 w-6 text-orange-600" />
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {getTotalItems}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-gray-900 text-base sm:text-lg">
                    {getTotalItems} {getTotalItems === 1 ? 'item' : 'items'}
                  </span>
                  <p className="text-xs sm:text-sm text-gray-600">in your cart</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">₹{getTotalAmount}</div>
                <p className="text-xs text-gray-500">Total Amount</p>
              </div>
            </div>
            <button className="w-full min-h-[52px] btn-primary text-white py-4 rounded-2xl font-bold text-base sm:text-lg focus-ring flex items-center justify-center space-x-2 active:scale-98 transition-transform" onClick={() => {
            // Navigate to checkout
            globalThis.location.href = `/checkout?table=${tableNumber}`;
          }} aria-label={`Proceed to checkout with ${getTotalItems} items totaling ₹${getTotalAmount}`} type="button">
              <span>Proceed to Checkout</span>
              <span className="text-xl" aria-hidden="true">🚀</span>
            </button>
          </div>
        </div>}
      </div>
    </div>;
}
