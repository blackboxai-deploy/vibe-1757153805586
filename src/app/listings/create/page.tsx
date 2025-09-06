'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductForm } from '@/components/products/ProductForm';
import { authManager, handleAuthError } from '@/lib/auth';
import { productService } from '@/lib/data';
import { ROUTES, CATEGORY_PLACEHOLDER_IMAGES } from '@/lib/constants';
import { ProductFormData } from '@/lib/validations';
import { AuthUser } from '@/types';

export default function CreateListingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      router.push(`${ROUTES.login}?return=${encodeURIComponent(ROUTES.createListing)}`);
      return;
    }

    setCurrentUser(authManager.getCurrentUser());
  }, [router]);

  const handleSubmit = async (formData: ProductFormData) => {
    if (!currentUser) {
      setError('You must be logged in to create listings');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Use category placeholder if no image URL provided
      const imageUrl = formData.imageUrl || CATEGORY_PLACEHOLDER_IMAGES[formData.category];

      const newProduct = await productService.create({
        sellerId: currentUser.id,
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        imageUrl,
        isAvailable: true
      });

      // Redirect to the new product page
      router.push(`/listings/${newProduct.id}?created=true`);
    } catch (error) {
      setError(handleAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading if user is not set yet
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <span>→</span>
              <Link href={ROUTES.listings} className="hover:text-primary transition-colors">
                Listings
              </Link>
              <span>→</span>
              <span className="text-foreground">Create Listing</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                List Your Item
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Give your pre-owned item a new life! Create a listing and contribute to the circular economy 
                while earning from things you no longer need.
              </p>
            </div>
          </div>

          {/* Seller Info */}
          <div className="bg-primary/5 rounded-lg p-6 border border-primary/10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold">Listing as {currentUser.username}</h3>
                <p className="text-sm text-muted-foreground">
                  Your listing will be visible to all marketplace users
                </p>
              </div>
            </div>
          </div>

          {/* Product Form */}
          <ProductForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
            title="Create New Listing"
            description="Fill in the details below to list your item on the EcoFinds marketplace"
            submitText="Create Listing"
          />

          {/* Tips Section */}
          <div className="bg-muted/30 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <span>💡</span>
              <span>Tips for Better Listings</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Great Titles</h4>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Include brand, model, and key features</li>
                  <li>Mention condition (excellent, good, fair)</li>
                  <li>Use specific descriptive words</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Detailed Descriptions</h4>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Describe condition honestly</li>
                  <li>Mention any accessories included</li>
                  <li>Note any defects or wear</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Competitive Pricing</h4>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Research similar items</li>
                  <li>Consider age and condition</li>
                  <li>Be open to reasonable offers</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Quality Images</h4>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Use good lighting and clear shots</li>
                  <li>Show multiple angles</li>
                  <li>Highlight any flaws or wear</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center pt-8">
            <Link href={ROUTES.dashboard}>
              <Button variant="outline">
                ← Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}