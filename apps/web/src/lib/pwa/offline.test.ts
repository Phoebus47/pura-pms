import {
  assertOnlineMutation,
  isBrowserOffline,
  OfflineMutationError,
} from './offline';

describe('offline helpers', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    });
  });

  it('detects offline state', () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    });
    expect(isBrowserOffline()).toBe(true);
  });

  it('allows GET when offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    });
    expect(() => assertOnlineMutation('GET')).not.toThrow();
  });

  it('blocks POST when offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    });
    expect(() => assertOnlineMutation('POST')).toThrow(OfflineMutationError);
  });
});
