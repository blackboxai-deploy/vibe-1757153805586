'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { ProductFilters as ProductFiltersType, ProductCategory } from '@/types';

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onFiltersChange: (filters: ProductFiltersType) => void;
  resultsCount: number;
  className?: string;
}

export function ProductFilters({ 
  filters, 
  onFiltersChange, 
  resultsCount,
  className = ""
}: ProductFiltersProps) {
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice?.toString() || '',
    max: filters.maxPrice?.toString() || ''
  });

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleCategoryChange = (value: string) => {
    const category = value === 'all' ? undefined : value as ProductCategory;
    onFiltersChange({ ...filters, category });
  };

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    setPriceRange(prev => ({ ...prev, [type]: value }));
    
    // Apply price filter
    const numValue = parseFloat(value);
    const newFilters = { ...filters };
    
    if (type === 'min') {
      newFilters.minPrice = isNaN(numValue) ? undefined : numValue;
    } else {
      newFilters.maxPrice = isNaN(numValue) ? undefined : numValue;
    }
    
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setPriceRange({ min: '', max: '' });
    onFiltersChange({});
  };

  const hasActiveFilters = !!(
    filters.search || 
    filters.category || 
    filters.minPrice !== undefined || 
    filters.maxPrice !== undefined
  );

  const activeFilterCount = [
    filters.search,
    filters.category,
    filters.minPrice !== undefined,
    filters.maxPrice !== undefined
  ].filter(Boolean).length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount} active
              </Badge>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear all
              </Button>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {resultsCount} item{resultsCount !== 1 ? 's' : ''} found
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Input
              id="search"
              type="search"
              placeholder="Search products..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pr-10"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-muted-foreground text-sm">🔍</span>
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select 
            value={filters.category || 'all'} 
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(PRODUCT_CATEGORIES).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label>Price Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="minPrice" className="text-xs text-muted-foreground">
                Min ($)
              </Label>
              <Input
                id="minPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={priceRange.min}
                onChange={(e) => handlePriceChange('min', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="maxPrice" className="text-xs text-muted-foreground">
                Max ($)
              </Label>
              <Input
                id="maxPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="1000.00"
                value={priceRange.max}
                onChange={(e) => handlePriceChange('max', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="space-y-3 pt-4 border-t border-border">
            <Label className="text-sm font-medium">Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="outline" className="text-xs">
                  Search: &quot;{filters.search}&quot;
                  <button
                    onClick={() => handleSearchChange('')}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {filters.category && (
                <Badge variant="outline" className="text-xs">
                  {PRODUCT_CATEGORIES[filters.category]}
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {filters.minPrice !== undefined && (
                <Badge variant="outline" className="text-xs">
                  Min: ${filters.minPrice}
                  <button
                    onClick={() => handlePriceChange('min', '')}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {filters.maxPrice !== undefined && (
                <Badge variant="outline" className="text-xs">
                  Max: ${filters.maxPrice}
                  <button
                    onClick={() => handlePriceChange('max', '')}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Quick Filter Buttons */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Filters</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFiltersChange({ ...filters, maxPrice: 50 })}
              className="text-xs"
            >
              Under $50
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFiltersChange({ ...filters, minPrice: 50, maxPrice: 200 })}
              className="text-xs"
            >
              $50 - $200
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFiltersChange({ ...filters, minPrice: 200 })}
              className="text-xs"
            >
              Over $200
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFiltersChange({ ...filters, category: 'electronics' as ProductCategory })}
              className="text-xs"
            >
              Electronics
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}