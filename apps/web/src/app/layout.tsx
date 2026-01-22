import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
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
  icons: {
    icon: '/pura-icon.svg',
    shortcut: '/pura-icon.svg',
    apple: '/pura-icon.svg',
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <QueryProvider>
            <AppLayout>{children}</AppLayout>
            <Toaster />
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
