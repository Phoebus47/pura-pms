import { t } from './i18n';

describe('t', () => {
  it('returns nested message copy', () => {
    expect(t('reservations.splitStay.badge')).toBe('Split stay');
  });

  it('returns the path when a key is missing', () => {
    expect(t('reservations.missing.key')).toBe('reservations.missing.key');
  });
});
