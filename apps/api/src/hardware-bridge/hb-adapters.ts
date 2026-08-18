import { BadRequestException } from '@nestjs/common';
import {
  asPayloadRecord,
  KEYCARD_ROOM_REQUIRED_MESSAGE,
  payloadCopies,
  payloadString,
  UNKNOWN_JOB_TYPE_MESSAGE,
} from './hb-rules';

export function runMockAdapter(
  jobType: string,
  jobId: string,
  payload: unknown,
): Record<string, unknown> {
  const data = asPayloadRecord(payload);
  switch (jobType) {
    case 'PRINT':
      return mockPrint(data);
    case 'KEYCARD_ENCODE':
      return mockEncode(jobId, data);
    case 'PASSPORT_SCAN':
      return mockPassport();
    case 'ID_CARD_READ':
      return mockIdCard();
    default:
      throw new BadRequestException(UNKNOWN_JOB_TYPE_MESSAGE);
  }
}

function mockPrint(payload: Record<string, unknown>) {
  return { printed: true, copies: payloadCopies(payload) };
}

function mockEncode(jobId: string, payload: Record<string, unknown>) {
  const roomNumber = payloadString(payload, 'roomNumber');
  if (!roomNumber) {
    throw new BadRequestException(KEYCARD_ROOM_REQUIRED_MESSAGE);
  }
  return {
    encoded: true,
    vendor: payloadString(payload, 'vendor') ?? 'GENERIC',
    roomNumber,
    vendorReference: `MOCK-${jobId}`,
  };
}

function mockPassport() {
  return {
    firstName: 'SOMCHAI',
    lastName: 'JAADEE',
    nationality: 'THA',
    idType: 'PASSPORT',
    idNumber: 'AA1234567',
  };
}

function mockIdCard() {
  return {
    firstName: 'Somchai',
    lastName: 'Jaidee',
    nationality: 'TH',
    idType: 'NATIONAL_ID',
    idNumber: '1103700123456',
  };
}
