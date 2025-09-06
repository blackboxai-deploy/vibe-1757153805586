'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { authManager } from '@/lib/auth';
import { cartService } from '@/lib/data';
import { ProductWithSeller, AuthUser } from '@/types';

interface ProductGridProps {
  products: ProductWithSeller[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
  emptyAction?: React.ReactNode;
  showAddToCart?: boolean;
  compact?: boolean;
  className?: string;
}

export function ProductGrid({
  products,
  loading = false,
  emptyMessage = "No products found",
  emptyIcon = "📦",
  emptyAction,
  showAddToCart = true,
  compact = false,
  className = ""
}: ProductGridProps) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [, setAddingToCart] = useState<Set<string>>(new Set());

  // Subscribe to auth changes and load cart
  useEffect(() => {
    const updateAuthState = (user: AuthUser | null) => {
      setCurrentUser(user);
      if (user) {
        const userCartItems = cartService.getCartItems(user.id);
        const productIds = userCartItems.map(item => item.product.id);
        setCartItems(productIds);
      } else {
        setCartItems([]);
      }
    };

    // Initial state
    updateAuthState(authManager.getCurrentUser());

    // Subscribe to changes
    const unsubscribe = authManager.subscribe(updateAuthState);
    return unsubscribe;
  }, []);

  const handleAddToCart = async (productId: string) => {
    if (!currentUser || !showAddToCart) return;

    setAddingToCart(prev => new Set(prev).add(productId));

    try {
      await cartService.addToCart(currentUser.id, productId, 1);
      
      // Update local cart state
      setCartItems(prev => [...prev, productId]);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // You could show a toast notification here
    } finally {
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-muted rounded-lg aspect-square mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">{emptyIcon}</div>
        <h3 className="text-xl font-semibold mb-2">{emptyMessage}</h3>
        <p className="text-muted-foreground mb-6">
          Try adjusting your search criteria or browse different categories
        </p>
        {emptyAction}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={currentUser && showAddToCart ? handleAddToCart : undefined}
          isInCart={cartItems.includes(product.id)}
          compact={compact}
          showSeller={true}
        />
      ))}
    </div>
  );
}