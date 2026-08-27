import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Sarabun } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import '../globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { PwaProvider } from '@/components/pwa/pwa-provider';
import { Toaster } from '@/components/ui/toast';
import { ErrorBoundary } from '@/components/error-boundary';
import { QueryProvider } from '@/lib/providers/query-provider';
import { ThemeProvider } from '@/lib/providers/theme-provider';
import { UI_STORE_KEY } from '@/lib/stores/use-ui-store';
import { I18nProvider } from '@/lib/i18n-provider';
import type en from '@/messages/en.json';
import { routing } from '@/i18n/routing';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const sarabun = Sarabun({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-sarabun',
  display: 'swap',
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
  colorScheme: 'light dark',
  themeColor: '#1E4B8E',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        {/*
          Applies the persisted theme before first paint so the shell does not
          flash light while React hydrates.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=localStorage.getItem(${JSON.stringify(
              UI_STORE_KEY,
            )});if(s&&JSON.parse(s).state.theme==='dark'){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${sarabun.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <I18nProvider locale={locale} messages={messages as typeof en}>
            <ThemeProvider>
              <PwaProvider>
                <ErrorBoundary>
                  <QueryProvider>
                    <AppLayout>{children}</AppLayout>
                    <Toaster />
                  </QueryProvider>
                </ErrorBoundary>
              </PwaProvider>
            </ThemeProvider>
          </I18nProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
