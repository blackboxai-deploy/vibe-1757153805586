'use client';

import { 
  User, 
  Product, 
  CartItem, 
  Purchase, 
  AuthUser, 
  ProductWithSeller, 
  CartItemWithProduct,
  PurchaseWithDetails,
  ProductCategory
} from '@/types';
import { STORAGE_KEYS, APP_CONFIG, CATEGORY_PLACEHOLDER_IMAGES } from './constants';

// Utility functions for localStorage
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
};

// Generate unique IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Initialize demo data
const initializeDemoData = (): void => {
  const users = getFromStorage<User[]>(STORAGE_KEYS.users, []);
  const products = getFromStorage<Product[]>(STORAGE_KEYS.products, []);
  
  if (users.length === 0) {
    const demoUsers: User[] = [
      {
        id: 'demo-user-1',
        email: 'demo@ecofinds.com',
        username: 'EcoWarrior',
        password: 'demo123', // In real app, this would be hashed
        bio: 'Passionate about sustainable living and finding unique second-hand treasures.',
        avatarUrl: 'https://placehold.co/150x150?text=Eco+Warrior+Avatar',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    saveToStorage(STORAGE_KEYS.users, demoUsers);
  }
  
  if (products.length === 0) {
    const demoProducts: Product[] = [
      {
        id: 'demo-product-1',
        sellerId: 'demo-user-1',
        title: 'Vintage Leather Jacket',
        description: 'Authentic vintage leather jacket from the 80s. Gently worn with character. Perfect for sustainable fashion lovers.',
        price: 75.00,
        category: 'fashion',
        imageUrl: CATEGORY_PLACEHOLDER_IMAGES.fashion,
        isAvailable: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'demo-product-2',
        sellerId: 'demo-user-1',
        title: 'iPhone 12 Pro Max',
        description: 'Excellent condition iPhone 12 Pro Max, 128GB. Includes charger and protective case. Battery health at 89%.',
        price: 425.00,
        category: 'electronics',
        imageUrl: CATEGORY_PLACEHOLDER_IMAGES.electronics,
        isAvailable: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'demo-product-3',
        sellerId: 'demo-user-1',
        title: 'Ceramic Plant Pot Set',
        description: 'Beautiful set of 3 handmade ceramic pots. Perfect for indoor plants and home decoration.',
        price: 35.00,
        category: 'home-garden',
        imageUrl: CATEGORY_PLACEHOLDER_IMAGES['home-garden'],
        isAvailable: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    saveToStorage(STORAGE_KEYS.products, demoProducts);
  }
};

// Authentication functions
export const authService = {
  login: async (email: string, password: string): Promise<AuthUser> => {
    const users = getFromStorage<User[]>(STORAGE_KEYS.users, []);
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl
    };
    
    saveToStorage(STORAGE_KEYS.currentUser, authUser);
    saveToStorage(STORAGE_KEYS.authToken, generateId());
    
    return authUser;
  },
  
  register: async (email: string, username: string, password: string): Promise<AuthUser> => {
    const users = getFromStorage<User[]>(STORAGE_KEYS.users, []);
    
    if (users.find(u => u.email === email)) {
      throw new Error('User with this email already exists');
    }
    
    if (users.find(u => u.username === username)) {
      throw new Error('Username is already taken');
    }
    
    const newUser: User = {
      id: generateId(),
      email,
      username,
      password,
      avatarUrl: APP_CONFIG.defaultAvatarImage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveToStorage(STORAGE_KEYS.users, users);
    
    const authUser: AuthUser = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      bio: newUser.bio,
      avatarUrl: newUser.avatarUrl
    };
    
    saveToStorage(STORAGE_KEYS.currentUser, authUser);
    saveToStorage(STORAGE_KEYS.authToken, generateId());
    
    return authUser;
  },
  
  logout: async (): Promise<void> => {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    localStorage.removeItem(STORAGE_KEYS.authToken);
  },
  
  getCurrentUser: (): AuthUser | null => {
    return getFromStorage<AuthUser | null>(STORAGE_KEYS.currentUser, null);
  },
  
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(STORAGE_KEYS.authToken);
    const user = authService.getCurrentUser();
    return !!(token && user);
  },
  
  updateProfile: async (userId: string, updates: Partial<User>): Promise<AuthUser> => {
    const users = getFromStorage<User[]>(STORAGE_KEYS.users, []);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    saveToStorage(STORAGE_KEYS.users, users);
    
    const updatedAuthUser: AuthUser = {
      id: users[userIndex].id,
      email: users[userIndex].email,
      username: users[userIndex].username,
      bio: users[userIndex].bio,
      avatarUrl: users[userIndex].avatarUrl
    };
    
    saveToStorage(STORAGE_KEYS.currentUser, updatedAuthUser);
    return updatedAuthUser;
  }
};

// Product functions
export const productService = {
  getAll: (): ProductWithSeller[] => {
    const products = getFromStorage<Product[]>(STORAGE_KEYS.products, []);
    const users = getFromStorage<User[]>(STORAGE_KEYS.users, []);
    
    return products
      .filter(p => p.isAvailable)
      .map(product => {
        const seller = users.find(u => u.id === product.sellerId);
        return {
          ...product,
          seller: {
            id: seller?.id || '',
            username: seller?.username || 'Unknown User'
          }
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  getById: (id: string): ProductWithSeller | null => {
    const products = getFromStorage<Product[]>(STORAGE_KEYS.products, []);
    const users = getFromStorage<User[]>(STORAGE_KEYS.users, []);
    
    const product = products.find(p => p.id === id);
    if (!product) return null;
    
    const seller = users.find(u => u.id === product.sellerId);
    return {
      ...product,
      seller: {
        id: seller?.id || '',
        username: seller?.username || 'Unknown User'
      }
    };
  },
  
  getByUserId: (userId: string): Product[] => {
    const products = getFromStorage<Product[]>(STORAGE_KEYS.products, []);
    return products
      .filter(p => p.sellerId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  create: async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const products = getFromStorage<Product[]>(STORAGE_KEYS.products, []);
    
    const newProduct: Product = {
      ...productData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    saveToStorage(STORAGE_KEYS.products, products);
    
    return newProduct;
  },
  
  update: async (id: string, updates: Partial<Product>): Promise<Product> => {
    const products = getFromStorage<Product[]>(STORAGE_KEYS.products, []);
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      throw new Error('Product not found');
    }
    
    products[productIndex] = {
      ...products[productIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    saveToStorage(STORAGE_KEYS.products, products);
    return products[productIndex];
  },
  
  delete: async (id: string): Promise<void> => {
    const products = getFromStorage<Product[]>(STORAGE_KEYS.products, []);
    const updatedProducts = products.filter(p => p.id !== id);
    saveToStorage(STORAGE_KEYS.products, updatedProducts);
  },
  
  search: (query: string, category?: ProductCategory): ProductWithSeller[] => {
    const allProducts = productService.getAll();
    
    return allProducts.filter(product => {
      const matchesQuery = !query || 
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase());
      
      const matchesCategory = !category || category === 'all' || product.category === category;
      
      return matchesQuery && matchesCategory;
    });
  }
};

// Cart functions
export const cartService = {
  getCartItems: (userId: string): CartItemWithProduct[] => {
    const cartItems = getFromStorage<CartItem[]>(STORAGE_KEYS.cart, []);
    const userCartItems = cartItems.filter(item => item.userId === userId);
    
    return userCartItems.map(cartItem => {
      const product = productService.getById(cartItem.productId);
      return {
        ...cartItem,
        product: product!
      };
    }).filter(item => item.product); // Remove items where product was deleted
  },
  
  addToCart: async (userId: string, productId: string, quantity: number = 1): Promise<CartItem> => {
    const cartItems = getFromStorage<CartItem[]>(STORAGE_KEYS.cart, []);
    
    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(
      item => item.userId === userId && item.productId === productId
    );
    
    if (existingItemIndex !== -1) {
      // Update existing item
      cartItems[existingItemIndex].quantity += quantity;
      saveToStorage(STORAGE_KEYS.cart, cartItems);
      return cartItems[existingItemIndex];
    } else {
      // Add new item
      const newCartItem: CartItem = {
        id: generateId(),
        userId,
        productId,
        quantity,
        addedAt: new Date().toISOString()
      };
      
      cartItems.push(newCartItem);
      saveToStorage(STORAGE_KEYS.cart, cartItems);
      return newCartItem;
    }
  },
  
  updateQuantity: async (itemId: string, quantity: number): Promise<void> => {
    const cartItems = getFromStorage<CartItem[]>(STORAGE_KEYS.cart, []);
    const itemIndex = cartItems.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
      if (quantity <= 0) {
        cartItems.splice(itemIndex, 1);
      } else {
        cartItems[itemIndex].quantity = quantity;
      }
      saveToStorage(STORAGE_KEYS.cart, cartItems);
    }
  },
  
  removeFromCart: async (itemId: string): Promise<void> => {
    const cartItems = getFromStorage<CartItem[]>(STORAGE_KEYS.cart, []);
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    saveToStorage(STORAGE_KEYS.cart, updatedItems);
  },
  
  clearCart: async (userId: string): Promise<void> => {
    const cartItems = getFromStorage<CartItem[]>(STORAGE_KEYS.cart, []);
    const updatedItems = cartItems.filter(item => item.userId !== userId);
    saveToStorage(STORAGE_KEYS.cart, updatedItems);
  },
  
  getCartTotal: (userId: string): number => {
    const cartItems = cartService.getCartItems(userId);
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  },
  
  getCartCount: (userId: string): number => {
    const cartItems = cartService.getCartItems(userId);
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }
};

// Purchase functions
export const purchaseService = {
  createPurchase: async (buyerId: string, productId: string, quantity: number): Promise<Purchase> => {
    const purchases = getFromStorage<Purchase[]>(STORAGE_KEYS.purchases, []);
    const product = productService.getById(productId);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    const newPurchase: Purchase = {
      id: generateId(),
      buyerId,
      sellerId: product.sellerId,
      productId,
      quantity,
      totalPrice: product.price * quantity,
      purchaseDate: new Date().toISOString(),
      status: 'completed'
    };
    
    purchases.push(newPurchase);
    saveToStorage(STORAGE_KEYS.purchases, purchases);
    
    // Remove from cart if it exists
    await cartService.removeFromCart(productId);
    
    return newPurchase;
  },
  
  getPurchaseHistory: (userId: string): PurchaseWithDetails[] => {
    const purchases = getFromStorage<Purchase[]>(STORAGE_KEYS.purchases, []);
    const users = getFromStorage<User[]>(STORAGE_KEYS.users, []);
    const products = getFromStorage<Product[]>(STORAGE_KEYS.products, []);
    
    return purchases
      .filter(purchase => purchase.buyerId === userId)
      .map(purchase => {
        const product = products.find(p => p.id === purchase.productId);
        const seller = users.find(u => u.id === purchase.sellerId);
        
        return {
          ...purchase,
          product: product!,
          seller: {
            id: seller?.id || '',
            username: seller?.username || 'Unknown User'
          }
        };
      })
      .filter(purchase => purchase.product)
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  }
};

// Initialize demo data on import
if (typeof window !== 'undefined') {
  initializeDemoData();
}