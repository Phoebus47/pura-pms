import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { PwaProvider } from '@/components/pwa/pwa-provider';
import { Toaster } from '@/components/ui/toast';
import { ErrorBoundary } from '@/components/error-boundary';
import { QueryProvider } from '@/lib/providers/query-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'PURA PMS - Property Management System',
    template: '%s | PURA PMS',
  },
  description:
    'Enterprise-grade Property Management System for 5-star hotels. Manage reservations, guests, rooms, billing, and reports with ease.',
  keywords: [
    'PMS',
    'Property Management System',
    'Hotel Management',
    'Reservation System',
    'Hotel Software',
  ],
  authors: [{ name: 'PURA PMS Team' }],
  creator: 'PURA PMS',
  publisher: 'PURA PMS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ),
  applicationName: 'PURA PMS',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PURA PMS',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'PURA PMS - Property Management System',
    description:
      'Enterprise-grade Property Management System for 5-star hotels',
    siteName: 'PURA PMS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PURA PMS - Property Management System',
    description:
      'Enterprise-grade Property Management System for 5-star hotels',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
  themeColor: '#1E4B8E',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scheme-light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PwaProvider>
          <ErrorBoundary>
            <QueryProvider>
              <AppLayout>{children}</AppLayout>
              <Toaster />
            </QueryProvider>
          </ErrorBoundary>
        </PwaProvider>
      </body>
    </html>
  );
}
