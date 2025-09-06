// Core type definitions for EcoFinds marketplace

export interface User {
  id: string;
  email: string;
  username: string;
  password: string; // In real app, this would be hashed
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  addedAt: string;
}

export interface Purchase {
  id: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  purchaseDate: string;
  status: PurchaseStatus;
}

export interface ProductWithSeller extends Product {
  seller: {
    id: string;
    username: string;
  };
}

export interface CartItemWithProduct extends CartItem {
  product: ProductWithSeller;
}

export interface PurchaseWithDetails extends Purchase {
  product: Product;
  seller: {
    id: string;
    username: string;
  };
}

export type ProductCategory = 
  | 'electronics'
  | 'fashion'
  | 'home-garden'
  | 'sports-outdoors'
  | 'books-media'
  | 'toys-games'
  | 'automotive'
  | 'health-beauty'
  | 'other';

export type PurchaseStatus = 
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  bio?: string;
  avatarUrl?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
}

export interface UserUpdateData {
  username?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface ProductFilters {
  search?: string;
  category?: ProductCategory | 'all';
  minPrice?: number;
  maxPrice?: number;
}

export interface AppState {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  cartItems: CartItemWithProduct[];
  cartCount: number;
}