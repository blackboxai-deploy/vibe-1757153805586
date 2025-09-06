'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductFilters } from '@/components/products/ProductFilters';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { authManager } from '@/lib/auth';
import { productService } from '@/lib/data';
import { ROUTES } from '@/lib/constants';
import { ProductWithSeller, AuthUser, ProductFilters as ProductFiltersType } from '@/types';

type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'title';

export default function ListingsPage() {
  const searchParams = useSearchParams();
  
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [products, setProducts] = useState<ProductWithSeller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  // Filter state
  const [filters, setFilters] = useState<ProductFiltersType>({
    search: searchParams.get('search') || undefined,
    category: (searchParams.get('category') as any) || undefined,
    minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
  });

  // Subscribe to auth changes
  useEffect(() => {
    const updateAuthState = (user: AuthUser | null) => {
      setCurrentUser(user);
    };

    // Initial state
    updateAuthState(authManager.getCurrentUser());

    // Subscribe to changes
    const unsubscribe = authManager.subscribe(updateAuthState);
    return unsubscribe;
  }, []);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const allProducts = productService.getAll();
        setProducts(allProducts);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.minPrice !== undefined) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.set('maxPrice', filters.maxPrice.toString());
    
    const newUrl = params.toString() ? `${ROUTES.listings}?${params.toString()}` : ROUTES.listings;
    
    // Update URL without triggering a re-render
    window.history.replaceState(null, '', newUrl);
  }, [filters]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Apply search filter
    if (filters.search?.trim()) {
      const searchLower = filters.search.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.seller.username.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Apply price filters
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(product => product.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(product => product.price <= filters.maxPrice!);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return sorted;
  }, [products, filters, sortBy]);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="space-y-6 mb-8">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
                <span>→</span>
                <span className="text-foreground">Listings</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Browse Marketplace
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover amazing pre-owned items from our community of conscious sellers
              </p>
            </div>

            {/* Search from URL params */}
            {filters.search && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Showing results for: <span className="font-medium text-foreground">&quot;{filters.search}&quot;</span>
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <ProductFilters
                filters={filters}
                onFiltersChange={setFilters}
                resultsCount={filteredAndSortedProducts.length}
                className="sticky top-8"
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/30 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-muted-foreground">
                    {filteredAndSortedProducts.length} of {products.length} products
                  </div>
                  {currentUser && (
                    <Link href={ROUTES.createListing}>
                      <Button variant="outline" size="sm">
                        📦 List Item
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Sort Controls */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="title">Title A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Products Grid */}
              <ProductGrid
                products={filteredAndSortedProducts}
                loading={isLoading}
                emptyMessage={
                  filters.search || filters.category || filters.minPrice !== undefined || filters.maxPrice !== undefined
                    ? "No products match your filters"
                    : "No products available"
                }
                emptyIcon={
                  filters.search || filters.category || filters.minPrice !== undefined || filters.maxPrice !== undefined
                    ? "🔍"
                    : "📦"
                }
                emptyAction={
                  !currentUser ? (
                    <Link href={ROUTES.register}>
                      <Button>Join EcoFinds to Start Selling</Button>
                    </Link>
                  ) : (
                    <Link href={ROUTES.createListing}>
                      <Button>List Your First Item</Button>
                    </Link>
                  )
                }
                showAddToCart={!!currentUser}
              />

              {/* Load More / Pagination placeholder */}
              {filteredAndSortedProducts.length > 0 && (
                <div className="text-center pt-8">
                  <p className="text-sm text-muted-foreground">
                    Showing all {filteredAndSortedProducts.length} results
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Call to Action for Non-Users */}
          {!currentUser && products.length > 0 && (
            <div className="mt-16 bg-primary/5 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Ready to Start Selling?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join our community of conscious sellers and buyers. Turn your unused items into income 
                while contributing to a more sustainable future.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={ROUTES.register}>
                  <Button size="lg">Create Free Account</Button>
                </Link>
                <Link href={ROUTES.login}>
                  <Button variant="outline" size="lg">Sign In</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}