import { FONT_THAI_VARIABLE } from './fonts.constants';
import { fontVariableClassName } from './fonts';

vi.mock('next/font/google', () => ({
  Geist: vi.fn(() => ({ variable: '--font-geist-sans' })),
  Geist_Mono: vi.fn(() => ({ variable: '--font-geist-mono' })),
  Prompt: vi.fn(() => ({ variable: '--font-thai' })),
}));

describe('fontVariableClassName', () => {
  it('joins next/font CSS variables for the document root', () => {
    expect(
      fontVariableClassName(
        { variable: '--font-geist-sans' },
        { variable: '--font-geist-mono' },
        { variable: FONT_THAI_VARIABLE },
      ),
    ).toBe('--font-geist-sans --font-geist-mono --font-thai');
  });
});
