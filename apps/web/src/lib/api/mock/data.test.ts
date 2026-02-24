import { describe, it, expect } from 'vitest';
import { mockDb } from './data';

describe('Mock Data Store', () => {
  it('should export a properly structured mockDb object', () => {
    expect(mockDb).toBeDefined();
    expect(mockDb.users).toBeDefined();
    expect(mockDb.properties).toBeDefined();
    expect(mockDb.rooms).toBeDefined();
    expect(mockDb.guests).toBeDefined();
    expect(mockDb.reservations).toBeDefined();
    expect(mockDb.folios).toBeDefined();
    expect(mockDb.folioWindows).toBeDefined();
    expect(mockDb.transactionCodes).toBeDefined();
    expect(mockDb.folioTransactions).toBeDefined();
  });

  it('should have initial seed data', () => {
    expect(mockDb.users.length).toBeGreaterThan(0);
    expect(mockDb.properties.length).toBeGreaterThan(0);
  });
});
