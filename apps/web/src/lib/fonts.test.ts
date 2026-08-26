import { FONT_THAI_VARIABLE, PRINT_DOCUMENT_CLASS } from './fonts.constants';

describe('fonts.constants', () => {
  it('exports the Thai font CSS variable contract', () => {
    expect(FONT_THAI_VARIABLE).toBe('--font-thai');
  });

  it('exports the shared print document class', () => {
    expect(PRINT_DOCUMENT_CLASS).toBe('print-document');
  });
});
