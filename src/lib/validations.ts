import { z } from 'zod';
import { PRODUCT_CATEGORIES, VALIDATION } from './constants';

// Auth validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(VALIDATION.minPasswordLength, `Password must be at least ${VALIDATION.minPasswordLength} characters`)
});

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  username: z
    .string()
    .min(1, 'Username is required')
    .min(VALIDATION.minUsernameLength, `Username must be at least ${VALIDATION.minUsernameLength} characters`)
    .max(VALIDATION.maxUsernameLength, `Username must be less than ${VALIDATION.maxUsernameLength} characters`)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(VALIDATION.minPasswordLength, `Password must be at least ${VALIDATION.minPasswordLength} characters`)
    .max(VALIDATION.maxPasswordLength, `Password must be less than ${VALIDATION.maxPasswordLength} characters`),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Product validation schemas
export const productSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(VALIDATION.minTitleLength, `Title must be at least ${VALIDATION.minTitleLength} characters`)
    .max(VALIDATION.maxUsernameLength, `Title must be less than ${VALIDATION.maxUsernameLength} characters`),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(VALIDATION.minDescriptionLength, `Description must be at least ${VALIDATION.minDescriptionLength} characters`)
    .max(1000, 'Description must be less than 1000 characters'),
  price: z
    .number({
      required_error: 'Price is required',
      invalid_type_error: 'Price must be a number'
    })
    .min(VALIDATION.minPriceValue, `Price must be at least $${VALIDATION.minPriceValue}`)
    .max(VALIDATION.maxPriceValue, `Price cannot exceed $${VALIDATION.maxPriceValue}`)
    .multipleOf(0.01, 'Price must be in cents (e.g., 19.99)'),
  category: z
    .string()
    .min(1, 'Category is required')
    .refine((val) => Object.keys(PRODUCT_CATEGORIES).includes(val), 'Invalid category selected'),
  imageUrl: z
    .string()
    .min(1, 'Image is required')
    .url('Invalid image URL')
});

// User profile update schema
export const userUpdateSchema = z.object({
  username: z
    .string()
    .min(VALIDATION.minUsernameLength, `Username must be at least ${VALIDATION.minUsernameLength} characters`)
    .max(VALIDATION.maxUsernameLength, `Username must be less than ${VALIDATION.maxUsernameLength} characters`)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  avatarUrl: z
    .string()
    .url('Invalid avatar URL')
    .optional()
    .or(z.literal(''))
});

// Search and filter schema
export const searchFilterSchema = z.object({
  search: z.string().optional(),
  category: z
    .string()
    .refine((val) => val === 'all' || Object.keys(PRODUCT_CATEGORIES).includes(val), 'Invalid category')
    .optional(),
  minPrice: z
    .number()
    .min(0, 'Minimum price cannot be negative')
    .optional(),
  maxPrice: z
    .number()
    .min(0, 'Maximum price cannot be negative')
    .optional()
}).refine((data) => {
  if (data.minPrice !== undefined && data.maxPrice !== undefined) {
    return data.minPrice <= data.maxPrice;
  }
  return true;
}, {
  message: 'Minimum price cannot be greater than maximum price',
  path: ['minPrice']
});

// Cart item schema
export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(10, 'Maximum quantity is 10')
});

// Type inference
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;
export type SearchFilterData = z.infer<typeof searchFilterSchema>;
export type CartItemData = z.infer<typeof cartItemSchema>;

// Validation helper functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePrice = (price: string): boolean => {
  const priceNumber = parseFloat(price);
  return !isNaN(priceNumber) && priceNumber >= VALIDATION.minPriceValue && priceNumber <= VALIDATION.maxPriceValue;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};