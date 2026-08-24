import type { NextConfig } from 'next';
import { withSerwist } from '@serwist/turbopack';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {};

export default withSerwist(withNextIntl(nextConfig));
