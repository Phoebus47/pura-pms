import { describe, expect, it } from 'vitest';
import {
  catalogPayload,
  DEFAULT_HARDWARE_DEVICES,
  isOpenableJobStatus,
  JOB_NOT_OPENABLE_MESSAGE,
  payloadCopies,
  payloadString,
} from './hb-rules';

describe('hb-rules', () => {
  it('exposes catalog arrays', () => {
    const catalog = catalogPayload();
    expect(catalog.deviceTypes).toContain('PRINTER');
    expect(catalog.vendors).toContain('GENERIC');
    expect(catalog.jobTypes).toEqual([
      'PRINT',
      'KEYCARD_ENCODE',
      'PASSPORT_SCAN',
      'ID_CARD_READ',
    ]);
  });

  it('seeds one default device per type', () => {
    expect(DEFAULT_HARDWARE_DEVICES).toHaveLength(4);
    expect(DEFAULT_HARDWARE_DEVICES.map((d) => d.label)).toEqual([
      'Receipt printer',
      'Key card encoder',
      'Passport scanner',
      'Thai ID reader',
    ]);
  });

  it('allows only pending or in-progress jobs', () => {
    expect(isOpenableJobStatus('PENDING')).toBe(true);
    expect(isOpenableJobStatus('IN_PROGRESS')).toBe(true);
    expect(isOpenableJobStatus('COMPLETED')).toBe(false);
    expect(isOpenableJobStatus('FAILED')).toBe(false);
    expect(JOB_NOT_OPENABLE_MESSAGE.length).toBeGreaterThan(0);
  });

  it('reads payload copies and strings', () => {
    expect(payloadCopies({})).toBe(1);
    expect(payloadCopies({ copies: 4 })).toBe(4);
    expect(payloadString({ roomNumber: '101' }, 'roomNumber')).toBe('101');
    expect(payloadString({ roomNumber: 205 }, 'roomNumber')).toBe('205');
    expect(payloadString({}, 'roomNumber')).toBeUndefined();
  });
});
