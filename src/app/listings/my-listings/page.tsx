'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authManager, handleAuthError } from '@/lib/auth';
import { productService } from '@/lib/data';
import { ROUTES, PRODUCT_CATEGORIES, APP_CONFIG } from '@/lib/constants';
import { formatPrice, formatDate } from '@/lib/validations';
import { AuthUser, Product, ProductCategory } from '@/types';

export default function MyListingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'sold'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>('all');

  // Delete states
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      router.push(`${ROUTES.login}?return=${encodeURIComponent(ROUTES.myListings)}`);
      return;
    }

    const user = authManager.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      loadUserProducts(user.id);
    }
  }, [router]);

  // Filter products when filters change
  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => {
        if (statusFilter === 'available') return product.isAvailable;
        if (statusFilter === 'sold') return !product.isAvailable;
        return true;
      });
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, statusFilter, categoryFilter]);

  const loadUserProducts = async (userId: string) => {
    setIsLoading(true);
    setError('');

    try {
      const userProducts = productService.getByUserId(userId);
      setProducts(userProducts);
    } catch (error) {
      setError('Failed to load your listings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!currentUser) return;

    setDeletingId(productId);
    setError('');
    setSuccess('');

    try {
      await productService.delete(productId);
      setSuccess('Product listing deleted successfully');
      
      // Reload products
      loadUserProducts(currentUser.id);
    } catch (error) {
      setError(handleAuthError(error));
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  // Show loading if user is not set yet
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const availableCount = products.filter(p => p.isAvailable).length;
  const soldCount = products.filter(p => !p.isAvailable).length;
  const totalValue = products.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <span>→</span>
              <Link href={ROUTES.dashboard} className="hover:text-primary transition-colors">
                Dashboard
              </Link>
              <span>→</span>
              <span className="text-foreground">My Listings</span>
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                My Listings
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage your product listings and track their performance
              </p>
            </div>
          </div>

          {/* Messages */}
          {success && (
            <Alert>
              <AlertDescription className="text-primary">{success}</AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{products.length}</div>
                <div className="text-sm text-muted-foreground">Total Listings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{availableCount}</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{soldCount}</div>
                <div className="text-sm text-muted-foreground">Sold</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{formatPrice(totalValue)}</div>
                <div className="text-sm text-muted-foreground">Total Value</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                <div>
                  <CardTitle>Your Listings</CardTitle>
                  <CardDescription>
                    {filteredProducts.length} of {products.length} listings shown
                  </CardDescription>
                </div>
                <Link href={ROUTES.createListing}>
                  <Button>
                    📦 Create New Listing
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filter Controls */}
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search your listings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className="w-full md:w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)}>
                  <SelectTrigger className="w-full md:w-[160px]">
                    <SelectValue />
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
                {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>

              {/* Products List */}
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
                          {/* Product Image */}
                          <div className="w-full md:w-32 h-32 relative overflow-hidden rounded-lg bg-muted flex-shrink-0">
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = APP_CONFIG.defaultProductImage;
                              }}
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-col md:flex-row md:items-start justify-between space-y-2 md:space-y-0">
                              <div>
                                <h3 className="text-lg font-semibold line-clamp-2">
                                  {product.title}
                                </h3>
                                <p className="text-muted-foreground line-clamp-2 text-sm">
                                  {product.description}
                                </p>
                              </div>
                              <div className="flex flex-col items-start md:items-end space-y-1">
                                <div className="text-xl font-bold text-primary">
                                  {formatPrice(product.price)}
                                </div>
                                <Badge variant={product.isAvailable ? 'default' : 'secondary'}>
                                  {product.isAvailable ? 'Available' : 'Sold'}
                                </Badge>
                              </div>
                            </div>

                            {/* Product Meta */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span>Category: {PRODUCT_CATEGORIES[product.category]}</span>
                              <span>•</span>
                              <span>Listed: {formatDate(product.createdAt)}</span>
                              <span>•</span>
                              <span>Updated: {formatDate(product.updatedAt)}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2 pt-2">
                              <Link href={`/listings/${product.id}`}>
                                <Button variant="outline" size="sm">
                                  👁️ View
                                </Button>
                              </Link>
                              <Link href={`/listings/${product.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  ✏️ Edit
                                </Button>
                              </Link>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    disabled={deletingId === product.id}
                                  >
                                    {deletingId === product.id ? '🔄' : '🗑️'} Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete &quot;{product.title}&quot;? 
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteProduct(product.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">
                    {products.length === 0 ? '📦' : '🔍'}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {products.length === 0 ? 'No listings yet' : 'No listings match your filters'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {products.length === 0
                      ? 'Create your first listing to start selling on the marketplace'
                      : 'Try adjusting your search criteria or clearing the filters'
                    }
                  </p>
                  {products.length === 0 ? (
                    <Link href={ROUTES.createListing}>
                      <Button>Create Your First Listing</Button>
                    </Link>
                  ) : (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}