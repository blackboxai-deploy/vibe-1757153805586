import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/navigation/Header';
import { APP_CONFIG } from '@/lib/constants';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} - ${APP_CONFIG.tagline}`,
  description: APP_CONFIG.description,
  keywords: ['second-hand', 'marketplace', 'sustainable', 'eco-friendly', 'pre-owned', 'circular economy'],
  authors: [{ name: 'EcoFinds Team' }],
  creator: 'EcoFinds',
  publisher: 'EcoFinds',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ecofinds.com',
    siteName: APP_CONFIG.name,
    title: `${APP_CONFIG.name} - ${APP_CONFIG.tagline}`,
    description: APP_CONFIG.description,
    images: [
      {
        url: 'https://placehold.co/1200x630?text=EcoFinds+Sustainable+Marketplace+Logo',
        width: 1200,
        height: 630,
        alt: `${APP_CONFIG.name} - ${APP_CONFIG.tagline}`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_CONFIG.name} - ${APP_CONFIG.tagline}`,
    description: APP_CONFIG.description,
    images: ['https://placehold.co/1200x630?text=EcoFinds+Sustainable+Marketplace+Logo']
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#059669'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="https://placehold.co/32x32?text=🌱" type="image/png" />
        <link rel="apple-touch-icon" href="https://placehold.co/180x180?text=EcoFinds+App+Icon" />
        <meta name="theme-color" content="#059669" />
        <meta name="msapplication-TileColor" content="#059669" />
      </head>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        {/* Global App Layout */}
        <div className="flex min-h-screen flex-col">
          {/* Header Navigation */}
          <Header />
          
          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="border-t border-border bg-muted/30">
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Brand Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                      🌱
                    </div>
                    <span className="text-lg font-bold text-primary">{APP_CONFIG.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {APP_CONFIG.description}
                  </p>
                </div>
                
                {/* Quick Links */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold">Marketplace</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><a href="/listings" className="hover:text-primary transition-colors">Browse Items</a></li>
                    <li><a href="/listings/create" className="hover:text-primary transition-colors">Sell Items</a></li>
                    <li><a href="/categories" className="hover:text-primary transition-colors">Categories</a></li>
                  </ul>
                </div>
                
                {/* Account Links */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold">Account</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><a href="/dashboard" className="hover:text-primary transition-colors">Dashboard</a></li>
                    <li><a href="/listings/my-listings" className="hover:text-primary transition-colors">My Listings</a></li>
                    <li><a href="/purchases" className="hover:text-primary transition-colors">Purchase History</a></li>
                  </ul>
                </div>
                
                {/* Support */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold">Support</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><a href="/help" className="hover:text-primary transition-colors">Help Center</a></li>
                    <li><a href="/contact" className="hover:text-primary transition-colors">Contact Us</a></li>
                    <li><a href="/sustainability" className="hover:text-primary transition-colors">Sustainability</a></li>
                  </ul>
                </div>
              </div>
              
              {/* Bottom Footer */}
              <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <p className="text-sm text-muted-foreground">
                  © 2024 {APP_CONFIG.name}. All rights reserved.
                </p>
                <div className="flex space-x-6 text-sm text-muted-foreground">
                  <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
                  <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
                  <a href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
        
        {/* Global Scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Theme detection and setup
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'light';
                  document.documentElement.classList.toggle('dark', theme === 'dark');
                } catch (e) {
                  console.warn('Theme detection failed:', e);
                }
              })();
            `
          }}
        />
      </body>
    </html>
  );
}