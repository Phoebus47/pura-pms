import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { runMockAdapter } from './hb-adapters';
import { KEYCARD_ROOM_REQUIRED_MESSAGE } from './hb-rules';

describe('hb-adapters', () => {
  it('prints with default copies', () => {
    expect(runMockAdapter('PRINT', 'job-1', {})).toEqual({
      printed: true,
      copies: 1,
    });
  });

  it('prints with payload copies', () => {
    expect(runMockAdapter('PRINT', 'job-1', { copies: 3 })).toEqual({
      printed: true,
      copies: 3,
    });
  });

  it('encodes a keycard with vendor and mock reference', () => {
    expect(
      runMockAdapter('KEYCARD_ENCODE', 'job-9', {
        roomNumber: '101',
        vendor: 'SALTO',
      }),
    ).toEqual({
      encoded: true,
      vendor: 'SALTO',
      roomNumber: '101',
      vendorReference: 'MOCK-job-9',
    });
  });

  it('defaults encode vendor to GENERIC', () => {
    expect(
      runMockAdapter('KEYCARD_ENCODE', 'job-2', { roomNumber: '205' }),
    ).toMatchObject({ vendor: 'GENERIC', encoded: true });
  });

  it('rejects encode without roomNumber', () => {
    expect(() => runMockAdapter('KEYCARD_ENCODE', 'job-1', {})).toThrow(
      BadRequestException,
    );
    expect(() => runMockAdapter('KEYCARD_ENCODE', 'job-1', {})).toThrow(
      KEYCARD_ROOM_REQUIRED_MESSAGE,
    );
  });

  it('scans a mock passport', () => {
    expect(runMockAdapter('PASSPORT_SCAN', 'job-1', {})).toEqual({
      firstName: 'SOMCHAI',
      lastName: 'JAADEE',
      nationality: 'THA',
      idType: 'PASSPORT',
      idNumber: 'AA1234567',
    });
  });

  it('reads a mock Thai national ID', () => {
    expect(runMockAdapter('ID_CARD_READ', 'job-1', {})).toEqual({
      firstName: 'Somchai',
      lastName: 'Jaidee',
      nationality: 'TH',
      idType: 'NATIONAL_ID',
      idNumber: '1103700123456',
    });
  });
});
