import { describe, expect, it } from 'vitest';
import {
  encodeKeycard,
  getHealth,
  isEncodeError,
  listDevices,
  printJob,
  scanIdCard,
  scanPassport,
  SERVICE_NAME,
} from './adapters.js';

describe('hardware-bridge adapters', () => {
  it('returns health with mock devices', () => {
    const health = getHealth();
    expect(health.ok).toBe(true);
    expect(health.service).toBe(SERVICE_NAME);
    expect(health.devices.length).toBeGreaterThan(0);
  });

  it('lists mock devices', () => {
    const devices = listDevices();
    expect(devices.map((device) => device.type)).toEqual([
      'PRINTER',
      'KEY_CARD_ENCODER',
      'PASSPORT_SCANNER',
      'SMART_CARD_READER',
    ]);
  });

  it('prints with default copies', () => {
    expect(printJob({})).toEqual({ printed: true, copies: 1 });
  });

  it('prints the requested copy count', () => {
    expect(printJob({ copies: 3, jobType: 'REG_CARD' })).toEqual({
      printed: true,
      copies: 3,
    });
  });

  it('rejects encode without roomNumber', () => {
    const outcome = encodeKeycard({ guestName: 'Test' });
    expect(isEncodeError(outcome)).toBe(true);
    expect(outcome).toEqual({ message: 'roomNumber is required' });
  });

  it('encodes a mock keycard', () => {
    const outcome = encodeKeycard({
      roomNumber: '101',
      guestName: 'Somchai',
    });
    expect(isEncodeError(outcome)).toBe(false);
    if (isEncodeError(outcome)) {
      return;
    }
    expect(outcome.encoded).toBe(true);
    expect(outcome.vendor).toBe('GENERIC');
    expect(outcome.roomNumber).toBe('101');
    expect(outcome.vendorReference.startsWith('MOCK-')).toBe(true);
  });

  it('uses the requested encoder vendor', () => {
    const outcome = encodeKeycard({
      vendor: 'SALTO',
      roomNumber: '202',
    });
    expect(isEncodeError(outcome)).toBe(false);
    if (isEncodeError(outcome)) {
      return;
    }
    expect(outcome.vendor).toBe('SALTO');
  });

  it('scans a mock passport', () => {
    expect(scanPassport()).toEqual({
      firstName: 'Somchai',
      lastName: 'Jaidee',
      nationality: 'THA',
      idType: 'PASSPORT',
      idNumber: 'AA1234567',
    });
  });

  it('scans a mock Thai national ID', () => {
    expect(scanIdCard()).toEqual({
      firstName: 'Niran',
      lastName: 'Suksawat',
      nationality: 'TH',
      idType: 'NATIONAL_ID',
      idNumber: '1103700123456',
    });
  });
});
