import { Geist, Geist_Mono, Prompt } from 'next/font/google';

export { FONT_THAI_VARIABLE, PRINT_DOCUMENT_CLASS } from './fonts.constants';

export const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/**
 * Prompt covers Latin + Thai so mixed guest names and Thai UI render
 * without a second webfont pipeline. Loaded on every locale.
 */
export const promptThai = Prompt({
  variable: '--font-thai',
  subsets: ['latin', 'thai'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  adjustFontFallback: false,
});

export function fontVariableClassName(
  ...fonts: Array<{ variable: string }>
): string {
  return fonts.map((font) => font.variable).join(' ');
}
