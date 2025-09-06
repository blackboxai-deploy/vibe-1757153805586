import { ProductCategory } from '@/types';

// Product categories with display labels
export const PRODUCT_CATEGORIES: Record<ProductCategory, string> = {
  'electronics': 'Electronics',
  'fashion': 'Fashion & Clothing',
  'home-garden': 'Home & Garden',
  'sports-outdoors': 'Sports & Outdoors',
  'books-media': 'Books & Media',
  'toys-games': 'Toys & Games',
  'automotive': 'Automotive',
  'health-beauty': 'Health & Beauty',
  'other': 'Other'
};

// Get array of categories for dropdowns
export const CATEGORY_OPTIONS = Object.entries(PRODUCT_CATEGORIES).map(
  ([value, label]) => ({ value: value as ProductCategory, label })
);

// App configuration
export const APP_CONFIG = {
  name: 'EcoFinds',
  tagline: 'Sustainable Second-Hand Marketplace',
  description: 'Discover unique finds and promote sustainable consumption through our trusted marketplace for pre-owned goods.',
  version: '1.0.0',
  currency: '$',
  maxImageSize: 5 * 1024 * 1024, // 5MB
  maxDescriptionLength: 1000,
  maxTitleLength: 100,
  defaultProductImage: 'https://placehold.co/400x300?text=Product+Image+Placeholder',
  defaultAvatarImage: 'https://placehold.co/150x150?text=User+Avatar'
};

// Local storage keys
export const STORAGE_KEYS = {
  users: 'ecofinds_users',
  products: 'ecofinds_products',
  cart: 'ecofinds_cart',
  purchases: 'ecofinds_purchases',
  currentUser: 'ecofinds_current_user',
  authToken: 'ecofinds_auth_token'
};

// Routes
export const ROUTES = {
  home: '/',
  login: '/auth/login',
  register: '/auth/register',
  dashboard: '/dashboard',
  listings: '/listings',
  createListing: '/listings/create',
  myListings: '/listings/my-listings',
  cart: '/cart',
  purchases: '/purchases'
};

// Default product images for different categories
export const CATEGORY_PLACEHOLDER_IMAGES: Record<ProductCategory, string> = {
  'electronics': 'https://placehold.co/400x300?text=Modern+electronic+device+with+sleek+design',
  'fashion': 'https://placehold.co/400x300?text=Stylish+fashion+clothing+item+on+display',
  'home-garden': 'https://placehold.co/400x300?text=Beautiful+home+decor+and+garden+accessories',
  'sports-outdoors': 'https://placehold.co/400x300?text=Professional+sports+equipment+and+outdoor+gear',
  'books-media': 'https://placehold.co/400x300?text=Collection+of+books+and+media+items',
  'toys-games': 'https://placehold.co/400x300?text=Fun+toys+and+board+games+collection',
  'automotive': 'https://placehold.co/400x300?text=Automotive+parts+and+car+accessories',
  'health-beauty': 'https://placehold.co/400x300?text=Health+and+beauty+products+display',
  'other': 'https://placehold.co/400x300?text=Miscellaneous+items+and+products'
};

// Validation constants
export const VALIDATION = {
  minPasswordLength: 6,
  maxPasswordLength: 50,
  minUsernameLength: 3,
  maxUsernameLength: 30,
  minPriceValue: 0.01,
  maxPriceValue: 10000,
  minTitleLength: 5,
  minDescriptionLength: 10
};

// Error messages
export const ERROR_MESSAGES = {
  invalidCredentials: 'Invalid email or password',
  userExists: 'User with this email already exists',
  userNotFound: 'User not found',
  productNotFound: 'Product not found',
  unauthorized: 'You are not authorized to perform this action',
  invalidData: 'Invalid data provided',
  networkError: 'Network error occurred',
  generalError: 'An error occurred. Please try again.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  loginSuccess: 'Successfully logged in',
  registerSuccess: 'Account created successfully',
  productCreated: 'Product listing created successfully',
  productUpdated: 'Product listing updated successfully',
  productDeleted: 'Product listing deleted successfully',
  addedToCart: 'Product added to cart',
  removedFromCart: 'Product removed from cart',
  purchaseCompleted: 'Purchase completed successfully',
  profileUpdated: 'Profile updated successfully'
};