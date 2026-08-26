import { describe, expect, it } from 'vitest';
import { guestLastNameMatches } from './portal-auth';

describe('guestLastNameMatches', () => {
  it('matches case-insensitively and trims whitespace', () => {
    expect(guestLastNameMatches('Smith', ' smith ')).toBe(true);
    expect(guestLastNameMatches('Smith', 'SMITH')).toBe(true);
  });

  it('rejects mismatched last names', () => {
    expect(guestLastNameMatches('Smith', 'Jones')).toBe(false);
  });

  it('rejects missing values', () => {
    expect(guestLastNameMatches(null, 'Smith')).toBe(false);
    expect(guestLastNameMatches('Smith', undefined)).toBe(false);
    expect(guestLastNameMatches(undefined, undefined)).toBe(false);
  });
});
