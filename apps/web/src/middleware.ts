import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { middlewareMatcher } from './i18n/middleware-config';

export default createMiddleware(routing);

export const config = {
  matcher: middlewareMatcher,
};
