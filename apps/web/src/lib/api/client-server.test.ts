/**
 * @jest-environment node
 */
import { getAuthToken, setAuthToken, clearAuthToken } from './client';

describe('Token Helpers (Server Side)', () => {
  // In node environment, window is undefined by default

  it('getAuthToken returns null', () => {
    expect(getAuthToken()).toBeNull();
  });

  it('setAuthToken does nothing', () => {
    expect(() => setAuthToken('token')).not.toThrow();
  });

  it('clearAuthToken does nothing', () => {
    expect(() => clearAuthToken()).not.toThrow();
  });
});
