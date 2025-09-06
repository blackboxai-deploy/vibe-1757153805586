'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { APP_CONFIG, ROUTES } from '@/lib/constants';
import { authManager } from '@/lib/auth';
import { productService } from '@/lib/data';
import { ProductWithSeller, AuthUser } from '@/types';
import { formatPrice } from '@/lib/validations';

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<ProductWithSeller[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializePage = () => {
      // Get current user
      setCurrentUser(authManager.getCurrentUser());
      
      // Get featured products (latest 6)
      const allProducts = productService.getAll();
      setFeaturedProducts(allProducts.slice(0, 6));
      
      setIsLoading(false);
    };

    initializePage();
    
    // Subscribe to auth changes
    const unsubscribe = authManager.subscribe(setCurrentUser);
    return unsubscribe;
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Hero Content */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground">
                Discover. Share.{' '}
                <span className="text-primary">Sustain.</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {APP_CONFIG.description}
              </p>
            </div>

            {/* Hero Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link href={ROUTES.listings}>
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                  🔍 Start Browsing
                </Button>
              </Link>
              {currentUser ? (
                <Link href={ROUTES.createListing}>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                    📦 Sell Your Items
                  </Button>
                </Link>
              ) : (
                <Link href={ROUTES.register}>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                    🚀 Join EcoFinds
                  </Button>
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{featuredProducts.length}+</div>
                <div className="text-sm text-muted-foreground">Items Listed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">1K+</div>
                <div className="text-sm text-muted-foreground">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Items Sold</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Latest Finds
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover amazing pre-owned items from our community of conscious sellers
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="p-0">
                    <div className="aspect-square relative overflow-hidden rounded-t-lg">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = APP_CONFIG.defaultProductImage;
                        }}
                      />
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-background/90">
                          {formatPrice(product.price)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">
                      {product.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {product.description}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        by {product.seller.username}
                      </div>
                      <Link href={`/listings/${product.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-2">No items yet</h3>
              <p className="text-muted-foreground mb-6">
                Be the first to list an item and start the sustainable marketplace!
              </p>
              {currentUser && (
                <Link href={ROUTES.createListing}>
                  <Button>List Your First Item</Button>
                </Link>
              )}
            </div>
          )}

          {featuredProducts.length > 0 && (
            <div className="text-center">
              <Link href={ROUTES.listings}>
                <Button variant="outline" size="lg">
                  View All Items
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose EcoFinds?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join the movement towards sustainable consumption and discover the benefits of our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <CardHeader>
                <div className="text-4xl mb-4">🌱</div>
                <CardTitle className="text-xl">Sustainable Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Extend the lifecycle of products and reduce waste by giving items a second chance
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardHeader>
                <div className="text-4xl mb-4">💰</div>
                <CardTitle className="text-xl">Great Value</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Find quality items at affordable prices while earning from your unused possessions
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardHeader>
                <div className="text-4xl mb-4">🤝</div>
                <CardTitle className="text-xl">Trusted Community</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect with like-minded individuals who care about sustainability and responsible consumption
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!currentUser && (
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Ready to Start Your Sustainable Journey?
              </h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of users who are making a difference through conscious consumption
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={ROUTES.register}>
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                    Create Free Account
                  </Button>
                </Link>
                <Link href={ROUTES.listings}>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                    Explore Marketplace
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}