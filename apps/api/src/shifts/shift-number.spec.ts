import {
  datesEqualYmd,
  nextShiftNumber,
  shiftNumberPrefix,
} from './shift-number';

describe('shift-number', () => {
  it('should build a prefix with YYYYMMDD and property suffix', () => {
    expect(
      shiftNumberPrefix(new Date('2026-08-14T00:00:00.000Z'), 'abc123prop01'),
    ).toBe('SH-20260814-prop01-');
  });

  it('should increment from matching count', async () => {
    const number = await nextShiftNumber(
      () => Promise.resolve(2),
      '2026-08-14',
      'abc123prop01',
    );
    expect(number).toBe('SH-20260814-prop01-3');
  });

  it('should compare business dates by YYYY-MM-DD', () => {
    expect(
      datesEqualYmd('2026-08-14', new Date('2026-08-14T00:00:00.000Z')),
    ).toBe(true);
    expect(datesEqualYmd('2026-08-13', '2026-08-14')).toBe(false);
  });
});
