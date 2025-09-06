'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { APP_CONFIG, PRODUCT_CATEGORIES } from '@/lib/constants';
import { formatPrice, formatDate } from '@/lib/validations';
import { ProductWithSeller } from '@/types';

interface ProductCardProps {
  product: ProductWithSeller;
  onAddToCart?: (productId: string) => void;
  isInCart?: boolean;
  showSeller?: boolean;
  compact?: boolean;
}

export function ProductCard({ 
  product, 
  onAddToCart, 
  isInCart = false, 
  showSeller = true,
  compact = false 
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the button
    e.stopPropagation();
    
    if (!onAddToCart || addingToCart) return;
    
    setAddingToCart(true);
    try {
      await onAddToCart(product.id);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const imageUrl = imageError ? APP_CONFIG.defaultProductImage : product.imageUrl;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <Link href={`/listings/${product.id}`} className="block">
        <CardHeader className="p-0">
          <div className={`aspect-square relative overflow-hidden rounded-t-lg ${compact ? 'h-32' : ''}`}>
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={handleImageError}
              loading="lazy"
            />
            
            {/* Price Badge */}
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-background/90 text-foreground font-semibold">
                {formatPrice(product.price)}
              </Badge>
            </div>

            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <Badge variant="outline" className="bg-background/90 text-xs">
                {PRODUCT_CATEGORIES[product.category]}
              </Badge>
            </div>

            {/* Availability Status */}
            {!product.isAvailable && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  SOLD
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className={`${compact ? 'p-3' : 'p-4'}`}>
          <div className="space-y-2">
            <CardTitle className={`${compact ? 'text-base' : 'text-lg'} font-semibold line-clamp-2 group-hover:text-primary transition-colors`}>
              {product.title}
            </CardTitle>
            
            <CardDescription className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground line-clamp-2`}>
              {product.description}
            </CardDescription>

            {/* Product Meta */}
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-1">
                {showSeller && (
                  <div className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                    by <span className="font-medium text-foreground">{product.seller.username}</span>
                  </div>
                )}
                <div className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                  {formatDate(product.createdAt)}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-2">
                {onAddToCart && product.isAvailable && (
                  <Button
                    variant={isInCart ? "secondary" : "outline"}
                    size={compact ? "sm" : "default"}
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className={`${compact ? 'text-xs px-2 py-1' : ''} transition-all`}
                  >
                    {addingToCart ? (
                      <span className="animate-spin">⏳</span>
                    ) : isInCart ? (
                      '✓ In Cart'
                    ) : (
                      '🛒 Add'
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Condition/Quality Indicators */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex items-center space-x-1">
                <span className="text-green-600 text-xs">●</span>
                <span className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                  Available
                </span>
              </div>
              
              {!compact && (
                <div className="text-xs text-muted-foreground">
                  View Details →
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}