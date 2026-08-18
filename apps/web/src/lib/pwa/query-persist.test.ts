import { shouldPersistQuery } from './query-persist';

describe('shouldPersistQuery', () => {
  it('persists front-office read keys', () => {
    expect(shouldPersistQuery(['properties'])).toBe(true);
    expect(shouldPersistQuery(['reservations', 'prop-1'])).toBe(true);
    expect(shouldPersistQuery(['housekeeping-board', 'prop-1'])).toBe(true);
  });

  it('skips unknown keys', () => {
    expect(shouldPersistQuery(['night-audit'])).toBe(false);
    expect(shouldPersistQuery([])).toBe(false);
  });
});
