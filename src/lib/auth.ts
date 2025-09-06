'use client';

import { AuthUser } from '@/types';
import { authService } from './data';

// Authentication context and utilities
export class AuthManager {
  private static instance: AuthManager;
  private currentUser: AuthUser | null = null;
  private listeners: Set<(user: AuthUser | null) => void> = new Set();

  private constructor() {
    // Initialize current user from storage on client side
    if (typeof window !== 'undefined') {
      this.currentUser = authService.getCurrentUser();
    }
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // Get current authenticated user
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return authService.isAuthenticated() && this.currentUser !== null;
  }

  // Subscribe to auth state changes
  subscribe(callback: (user: AuthUser | null) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners of auth state change
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.currentUser));
  }

  // Login user
  async login(email: string, password: string): Promise<AuthUser> {
    try {
      const user = await authService.login(email, password);
      this.currentUser = user;
      this.notifyListeners();
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Register new user
  async register(email: string, username: string, password: string): Promise<AuthUser> {
    try {
      const user = await authService.register(email, username, password);
      this.currentUser = user;
      this.notifyListeners();
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await authService.logout();
      this.currentUser = null;
      this.notifyListeners();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<AuthUser>): Promise<AuthUser> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      const updatedUser = await authService.updateProfile(this.currentUser.id, updates);
      this.currentUser = updatedUser;
      this.notifyListeners();
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  // Check if current user owns a resource
  isOwner(resourceOwnerId: string): boolean {
    return this.currentUser?.id === resourceOwnerId;
  }

  // Require authentication (throws if not authenticated)
  requireAuth(): AuthUser {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required');
    }
    return this.currentUser!;
  }
}

// Export singleton instance
export const authManager = AuthManager.getInstance();

// Hook-like functions for React components
export const useAuthUser = (): AuthUser | null => {
  return authManager.getCurrentUser();
};

export const useIsAuthenticated = (): boolean => {
  return authManager.isAuthenticated();
};

// Route protection utilities
export const redirectToLogin = (returnUrl?: string): void => {
  const loginUrl = '/auth/login';
  const url = returnUrl ? `${loginUrl}?return=${encodeURIComponent(returnUrl)}` : loginUrl;
  
  if (typeof window !== 'undefined') {
    window.location.href = url;
  }
};

export const redirectToDashboard = (): void => {
  if (typeof window !== 'undefined') {
    window.location.href = '/dashboard';
  }
};

export const redirectToHome = (): void => {
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

// Protected route wrapper
export const requireAuth = <T extends any[]>(
  fn: (...args: T) => any
) => {
  return (...args: T) => {
    if (!authManager.isAuthenticated()) {
      redirectToLogin();
      return;
    }
    return fn(...args);
  };
};

// Storage utilities
export const clearUserData = (): void => {
  if (typeof window !== 'undefined') {
    // Clear sensitive data on logout
    const keysToKeep = ['ecofinds_products', 'ecofinds_users']; // Keep demo data
    const storage = { ...localStorage };
    
    Object.keys(storage).forEach(key => {
      if (key.startsWith('ecofinds_') && !keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
  }
};

// Auth error handling
export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export const handleAuthError = (error: unknown): string => {
  if (error instanceof AuthError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    // Map common error messages
    if (error.message.includes('Invalid credentials')) {
      return 'Invalid email or password. Please try again.';
    }
    if (error.message.includes('already exists')) {
      return 'An account with this email already exists. Please login instead.';
    }
    if (error.message.includes('Username is already taken')) {
      return 'This username is already taken. Please choose another.';
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

// Session management
export const getSessionInfo = () => {
  const user = authManager.getCurrentUser();
  const isAuthenticated = authManager.isAuthenticated();
  
  return {
    user,
    isAuthenticated,
    userId: user?.id || null,
    username: user?.username || null,
    email: user?.email || null
  };
};

// Initialize auth manager on client side
if (typeof window !== 'undefined') {
  // Restore session on page load
  const restoreSession = () => {
    const user = authService.getCurrentUser();
    if (user && authService.isAuthenticated()) {
      authManager.getCurrentUser(); // This will set the current user
    }
  };
  
  // Restore session when module loads
  restoreSession();
  
  // Handle storage changes (for multi-tab support)
  window.addEventListener('storage', (e) => {
    if (e.key === 'ecofinds_current_user' || e.key === 'ecofinds_auth_token') {
      restoreSession();
    }
  });
}