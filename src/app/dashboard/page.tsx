'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { authManager, handleAuthError } from '@/lib/auth';
import { productService, cartService, purchaseService } from '@/lib/data';
import { APP_CONFIG, ROUTES } from '@/lib/constants';
import { AuthUser, Product, PurchaseWithDetails } from '@/types';
import { UserUpdateFormData, userUpdateSchema, formatPrice, formatDate } from '@/lib/validations';

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // User stats
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [recentPurchases, setRecentPurchases] = useState<PurchaseWithDetails[]>([]);

  // Form data for profile editing
  const [formData, setFormData] = useState<UserUpdateFormData>({
    username: '',
    bio: '',
    avatarUrl: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<UserUpdateFormData>>({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      router.push(ROUTES.login);
      return;
    }

    const user = authManager.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setFormData({
        username: user.username,
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || ''
      });

      // Load user data
      loadUserData(user.id);
    }
  }, [router]);

  const loadUserData = (userId: string) => {
    // Get user's products
    const products = productService.getByUserId(userId);
    setUserProducts(products);

    // Get cart count
    const cartItemCount = cartService.getCartCount(userId);
    setCartCount(cartItemCount);

    // Get recent purchases (last 5)
    const purchases = purchaseService.getPurchaseHistory(userId);
    setRecentPurchases(purchases.slice(0, 5));
  };

  const handleInputChange = (field: keyof UserUpdateFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear messages
    setError('');
    setSuccess('');
  };

  const validateForm = (): boolean => {
    try {
      userUpdateSchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<UserUpdateFormData> = {};
      error.errors.forEach((err: any) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof UserUpdateFormData] = err.message;
        }
      });
      setFormErrors(fieldErrors);
      return false;
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedUser = await authManager.updateProfile(formData);
      setCurrentUser(updatedUser);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      
      // Reload user data in case username changed
      loadUserData(updatedUser.id);
    } catch (error) {
      setError(handleAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (currentUser) {
      setFormData({
        username: currentUser.username,
        bio: currentUser.bio || '',
        avatarUrl: currentUser.avatarUrl || ''
      });
    }
    setFormErrors({});
    setError('');
    setSuccess('');
    setIsEditing(false);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalSales = userProducts.reduce((sum, product) => sum + product.price, 0);
  const availableListings = userProducts.filter(p => p.isAvailable).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {currentUser.username}! Manage your profile and track your marketplace activity.
            </p>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Section */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Profile</CardTitle>
                    {!isEditing && (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!isEditing ? (
                    // Display Mode
                    <div className="space-y-4">
                      {/* Avatar */}
                      <div className="flex justify-center">
                        <div className="relative">
                          <img
                            src={currentUser.avatarUrl || APP_CONFIG.defaultAvatarImage}
                            alt={currentUser.username}
                            className="w-24 h-24 rounded-full object-cover border-4 border-muted"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = APP_CONFIG.defaultAvatarImage;
                            }}
                          />
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-semibold">{currentUser.username}</h3>
                        <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                        {currentUser.bio && (
                          <p className="text-sm text-foreground bg-muted rounded-md p-3">
                            {currentUser.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Edit Mode
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      {/* Username */}
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          type="text"
                          value={formData.username}
                          onChange={handleInputChange('username')}
                          className={formErrors.username ? 'border-destructive' : ''}
                          disabled={isLoading}
                        />
                        {formErrors.username && (
                          <p className="text-sm text-destructive">{formErrors.username}</p>
                        )}
                      </div>

                      {/* Bio */}
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself..."
                          value={formData.bio}
                          onChange={handleInputChange('bio')}
                          className={formErrors.bio ? 'border-destructive' : ''}
                          rows={3}
                          disabled={isLoading}
                        />
                        {formErrors.bio && (
                          <p className="text-sm text-destructive">{formErrors.bio}</p>
                        )}
                      </div>

                      {/* Avatar URL */}
                      <div className="space-y-2">
                        <Label htmlFor="avatarUrl">Avatar URL</Label>
                        <Input
                          id="avatarUrl"
                          type="url"
                          placeholder="https://example.com/avatar.jpg"
                          value={formData.avatarUrl}
                          onChange={handleInputChange('avatarUrl')}
                          className={formErrors.avatarUrl ? 'border-destructive' : ''}
                          disabled={isLoading}
                        />
                        {formErrors.avatarUrl && (
                          <p className="text-sm text-destructive">{formErrors.avatarUrl}</p>
                        )}
                      </div>

                      {/* Form Actions */}
                      <div className="flex space-x-2">
                        <Button type="submit" className="flex-1" disabled={isLoading}>
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleCancelEdit}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={ROUTES.createListing}>
                    <Button className="w-full">
                      📦 List New Item
                    </Button>
                  </Link>
                  <Link href={ROUTES.listings}>
                    <Button variant="outline" className="w-full">
                      🔍 Browse Items
                    </Button>
                  </Link>
                  <Link href={ROUTES.cart}>
                    <Button variant="outline" className="w-full">
                      🛒 View Cart {cartCount > 0 && `(${cartCount})`}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-primary">{availableListings}</div>
                    <div className="text-sm text-muted-foreground">Active Listings</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-primary">{formatPrice(totalSales)}</div>
                    <div className="text-sm text-muted-foreground">Listed Value</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-primary">{recentPurchases.length}</div>
                    <div className="text-sm text-muted-foreground">Purchases Made</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Listings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Your Recent Listings</CardTitle>
                    <Link href={ROUTES.myListings}>
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </div>
                  <CardDescription>
                    Manage your product listings and track their performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userProducts.length > 0 ? (
                    <div className="space-y-4">
                      {userProducts.slice(0, 3).map((product) => (
                        <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-16 h-16 rounded-md object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = APP_CONFIG.defaultProductImage;
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{product.title}</h4>
                            <p className="text-sm text-muted-foreground">{formatPrice(product.price)}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={product.isAvailable ? 'default' : 'secondary'}>
                                {product.isAvailable ? 'Available' : 'Sold'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(product.createdAt)}
                              </span>
                            </div>
                          </div>
                          <Link href={`/listings/${product.id}`}>
                            <Button variant="ghost" size="sm">View</Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📦</div>
                      <p className="text-muted-foreground mb-4">No listings yet</p>
                      <Link href={ROUTES.createListing}>
                        <Button>Create Your First Listing</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Purchases */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Purchases</CardTitle>
                    <Link href={ROUTES.purchases}>
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </div>
                  <CardDescription>
                    Your latest purchase history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentPurchases.length > 0 ? (
                    <div className="space-y-4">
                      {recentPurchases.map((purchase) => (
                        <div key={purchase.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <img
                            src={purchase.product?.imageUrl || APP_CONFIG.defaultProductImage}
                            alt={purchase.product?.title || 'Product'}
                            className="w-16 h-16 rounded-md object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = APP_CONFIG.defaultProductImage;
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{purchase.product?.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Sold by {purchase.seller.username}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="font-medium text-sm">{formatPrice(purchase.totalPrice)}</span>
                              <Badge variant="outline">{purchase.status}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(purchase.purchaseDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🛒</div>
                      <p className="text-muted-foreground mb-4">No purchases yet</p>
                      <Link href={ROUTES.listings}>
                        <Button>Start Shopping</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}