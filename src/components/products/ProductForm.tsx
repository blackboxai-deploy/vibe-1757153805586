'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PRODUCT_CATEGORIES, CATEGORY_PLACEHOLDER_IMAGES, APP_CONFIG } from '@/lib/constants';
import { ProductFormData, productSchema, formatPrice } from '@/lib/validations';
import { ProductCategory } from '@/types';

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isLoading: boolean;
  error: string;
  submitText?: string;
  title?: string;
  description?: string;
}

export function ProductForm({
  initialData,
  onSubmit,
  isLoading,
  error,
  submitText = 'Create Listing',
  title = 'Create New Listing',
  description = 'Fill in the details below to list your item on the marketplace'
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    category: initialData?.category || 'other',
    imageUrl: initialData?.imageUrl || ''
  });

  const [errors, setErrors] = useState<Partial<ProductFormData>>({});
  const [priceInput, setPriceInput] = useState(
    initialData?.price ? initialData.price.toString() : ''
  );

  const handleInputChange = (field: keyof ProductFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPriceInput(value);
    
    // Convert to number for validation
    const priceNumber = parseFloat(value);
    if (!isNaN(priceNumber)) {
      setFormData(prev => ({ ...prev, price: priceNumber }));
    }
    
    // Clear price error
    if (errors.price) {
      setErrors(prev => ({ ...prev, price: undefined }));
    }
  };

  const handleCategoryChange = (value: string) => {
    const category = value as ProductCategory;
    setFormData(prev => ({ 
      ...prev, 
      category,
      // Auto-set category-specific placeholder image if no image URL is provided
      imageUrl: prev.imageUrl || CATEGORY_PLACEHOLDER_IMAGES[category]
    }));
    
    // Clear category error
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      productSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<ProductFormData> = {};
      error.errors.forEach((err: any) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ProductFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Global Error */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Title Field */}
            <div className="space-y-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter a descriptive title for your item"
                value={formData.title}
                onChange={handleInputChange('title')}
                className={errors.title ? 'border-destructive' : ''}
                disabled={isLoading}
                maxLength={100}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Category Field */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={handleCategoryChange}
                disabled={isLoading}
              >
                <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRODUCT_CATEGORIES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category}</p>
              )}
            </div>

            {/* Price Field */}
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  {APP_CONFIG.currency}
                </span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="10000"
                  placeholder="0.00"
                  value={priceInput}
                  onChange={handlePriceChange}
                  className={`pl-8 ${errors.price ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price}</p>
              )}
              {formData.price > 0 && (
                <p className="text-xs text-muted-foreground">
                  Display price: {formatPrice(formData.price)}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of your item including condition, features, and any relevant information"
                value={formData.description}
                onChange={handleInputChange('description')}
                className={errors.description ? 'border-destructive' : ''}
                rows={5}
                disabled={isLoading}
                maxLength={1000}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/1000 characters
              </p>
            </div>

            {/* Image URL Field */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL *</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg or leave blank for category default"
                value={formData.imageUrl}
                onChange={handleInputChange('imageUrl')}
                className={errors.imageUrl ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.imageUrl && (
                <p className="text-sm text-destructive">{errors.imageUrl}</p>
              )}
              
              {/* Image Preview */}
              {formData.imageUrl && (
                <div className="space-y-2">
                  <Label>Image Preview</Label>
                  <div className="relative w-full h-48 border rounded-md overflow-hidden bg-muted">
                    <img
                      src={formData.imageUrl}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'block';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Category Default Image Hint */}
              {!formData.imageUrl && formData.category && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground mb-2">
                    No image URL provided. A category-appropriate placeholder will be used:
                  </p>
                  <div className="w-full h-32 border rounded overflow-hidden">
                    <img
                      src={CATEGORY_PLACEHOLDER_IMAGES[formData.category]}
                      alt={`${PRODUCT_CATEGORIES[formData.category]} placeholder`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? 'Creating Listing...' : submitText}
              </Button>
            </div>

            {/* Form Guidelines */}
            <div className="pt-4 border-t border-border space-y-2">
              <h4 className="text-sm font-medium">Listing Guidelines</h4>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Use clear, descriptive titles that accurately represent your item</li>
                <li>Provide honest descriptions including any defects or wear</li>
                <li>Price competitively based on item condition and market value</li>
                <li>Use high-quality images that show the item clearly</li>
                <li>Select the most appropriate category for better discoverability</li>
              </ul>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}