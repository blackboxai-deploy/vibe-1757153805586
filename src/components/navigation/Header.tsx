'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { APP_CONFIG, ROUTES } from '@/lib/constants';
import { authManager } from '@/lib/auth';
import { cartService } from '@/lib/data';
import { AuthUser } from '@/types';

export function Header() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Subscribe to auth changes
  useEffect(() => {
    const updateAuthState = (user: AuthUser | null) => {
      setCurrentUser(user);
      if (user) {
        setCartCount(cartService.getCartCount(user.id));
      } else {
        setCartCount(0);
      }
    };

    // Initial state
    updateAuthState(authManager.getCurrentUser());

    // Subscribe to changes
    const unsubscribe = authManager.subscribe(updateAuthState);
    
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await authManager.logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/listings?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                🌱
              </div>
              <span className="text-xl font-bold text-primary hidden sm:block">
                {APP_CONFIG.name}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 ml-8">
              <Link 
                href={ROUTES.listings} 
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Browse
              </Link>
              {currentUser && (
                <Link 
                  href={ROUTES.createListing} 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Sell
                </Link>
              )}
            </nav>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="w-full">
              <Input
                type="search"
                placeholder="Search for items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart - Authenticated Users Only */}
            {currentUser && (
              <Link href={ROUTES.cart}>
                <Button variant="ghost" size="sm" className="relative">
                  🛒
                  {cartCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {/* User Menu or Login */}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline text-sm font-medium">
                      {currentUser.username}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start space-x-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.dashboard}>Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.myListings}>My Listings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.purchases}>Purchase History</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href={ROUTES.login}>
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href={ROUTES.register}>
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <span>☰</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-6 mt-6">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch}>
                    <Input
                      type="search"
                      placeholder="Search for items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col space-y-4">
                    <Link 
                      href={ROUTES.listings} 
                      onClick={closeMobileMenu}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                      Browse Items
                    </Link>
                    
                    {currentUser ? (
                      <>
                        <Link 
                          href={ROUTES.createListing} 
                          onClick={closeMobileMenu}
                          className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                        >
                          Sell Items
                        </Link>
                        <Link 
                          href={ROUTES.dashboard} 
                          onClick={closeMobileMenu}
                          className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                        >
                          Dashboard
                        </Link>
                        <Link 
                          href={ROUTES.myListings} 
                          onClick={closeMobileMenu}
                          className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                        >
                          My Listings
                        </Link>
                        <Link 
                          href={ROUTES.cart} 
                          onClick={closeMobileMenu}
                          className="text-lg font-medium text-foreground hover:text-primary transition-colors flex items-center justify-between"
                        >
                          <span>Cart</span>
                          {cartCount > 0 && (
                            <Badge variant="destructive">{cartCount}</Badge>
                          )}
                        </Link>
                        <Link 
                          href={ROUTES.purchases} 
                          onClick={closeMobileMenu}
                          className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                        >
                          Purchase History
                        </Link>
                        <Button 
                          onClick={() => {
                            handleLogout();
                            closeMobileMenu();
                          }}
                          variant="outline"
                          className="justify-start text-destructive"
                        >
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <div className="flex flex-col space-y-3 pt-4">
                        <Link href={ROUTES.login} onClick={closeMobileMenu}>
                          <Button variant="outline" className="w-full">Sign In</Button>
                        </Link>
                        <Link href={ROUTES.register} onClick={closeMobileMenu}>
                          <Button className="w-full">Sign Up</Button>
                        </Link>
                      </div>
                    )}
                  </nav>

                  {/* User Info - Mobile */}
                  {currentUser && (
                    <div className="pt-6 border-t border-border">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                          {currentUser.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{currentUser.username}</p>
                          <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}