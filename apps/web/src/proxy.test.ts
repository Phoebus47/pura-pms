import { routing } from '@/i18n/routing';

export const expectedProxyMatcher = [
  '/',
  '/(th|en)/:path*',
  '/((?!api|_next|_vercel|serwist|.*\\..*).*)',
];

describe('next-intl routing config', () => {
  it('defines en and th locales with en as default', () => {
    expect(routing.locales).toEqual(['en', 'th']);
    expect(routing.defaultLocale).toBe('en');
    expect(routing.localePrefix).toBe('as-needed');
  });

  it('persists locale preference in a cookie', () => {
    expect(routing.localeCookie).toEqual({
      name: 'NEXT_LOCALE',
      maxAge: 60 * 60 * 24 * 365,
    });
  });
});

describe('next-intl proxy matcher', () => {
  it('documents static matcher patterns required by Next.js', () => {
    expect(expectedProxyMatcher).toEqual([
      '/',
      '/(th|en)/:path*',
      '/((?!api|_next|_vercel|serwist|.*\\..*).*)',
    ]);
  });
});
