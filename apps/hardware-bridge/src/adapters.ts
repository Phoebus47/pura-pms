export const SERVICE_NAME = 'pura-hardware-bridge' as const;

export type DeviceType =
  | 'PRINTER'
  | 'KEY_CARD_ENCODER'
  | 'PASSPORT_SCANNER'
  | 'SMART_CARD_READER';

export type HardwareVendor = 'GENERIC' | 'VINGCARD' | 'SALTO' | 'HAFELE';

export interface MockDevice {
  id: string;
  type: DeviceType;
  vendor: HardwareVendor;
  label: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface HealthResponse {
  ok: true;
  service: typeof SERVICE_NAME;
  devices: MockDevice[];
}

export interface PrintResult {
  printed: true;
  copies: number;
}

export interface EncodeResult {
  encoded: true;
  vendor: string;
  roomNumber: string;
  vendorReference: string;
}

export interface ErrorResponse {
  message: string;
}

export interface PassportScanResult {
  firstName: string;
  lastName: string;
  nationality: 'THA';
  idType: 'PASSPORT';
  idNumber: 'AA1234567';
}

export interface IdCardScanResult {
  firstName: string;
  lastName: string;
  nationality: 'TH';
  idType: 'NATIONAL_ID';
  idNumber: '1103700123456';
}

export const MOCK_DEVICES: readonly MockDevice[] = [
  {
    id: 'mock-printer',
    type: 'PRINTER',
    vendor: 'GENERIC',
    label: 'Front Desk Receipt Printer',
    isDefault: true,
    isActive: true,
  },
  {
    id: 'mock-encoder',
    type: 'KEY_CARD_ENCODER',
    vendor: 'GENERIC',
    label: 'Generic Key Card Encoder',
    isDefault: true,
    isActive: true,
  },
  {
    id: 'mock-passport',
    type: 'PASSPORT_SCANNER',
    vendor: 'GENERIC',
    label: 'Passport Scanner',
    isDefault: true,
    isActive: true,
  },
  {
    id: 'mock-id-reader',
    type: 'SMART_CARD_READER',
    vendor: 'GENERIC',
    label: 'Thai National ID Reader',
    isDefault: true,
    isActive: true,
  },
];

const DEFAULT_COPIES = 1;
const DEFAULT_VENDOR = 'GENERIC';
const ROOM_NUMBER_REQUIRED: ErrorResponse = {
  message: 'roomNumber is required',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

export function listDevices(): MockDevice[] {
  return MOCK_DEVICES.map((device) => ({ ...device }));
}

export function getHealth(): HealthResponse {
  return {
    ok: true,
    service: SERVICE_NAME,
    devices: listDevices(),
  };
}

export function printJob(input: unknown): PrintResult {
  const body = asRecord(input);
  const copies =
    typeof body.copies === 'number' &&
    Number.isInteger(body.copies) &&
    body.copies > 0
      ? body.copies
      : DEFAULT_COPIES;

  return { printed: true, copies };
}

export function encodeKeycard(input: unknown): EncodeResult | ErrorResponse {
  const body = asRecord(input);
  const roomNumber =
    typeof body.roomNumber === 'string' ? body.roomNumber.trim() : '';

  if (!roomNumber) {
    return ROOM_NUMBER_REQUIRED;
  }

  const vendor =
    typeof body.vendor === 'string' && body.vendor.trim().length > 0
      ? body.vendor.trim()
      : DEFAULT_VENDOR;

  return {
    encoded: true,
    vendor,
    roomNumber,
    vendorReference: `MOCK-${roomNumber}-${Date.now()}`,
  };
}

export function isEncodeError(
  value: EncodeResult | ErrorResponse,
): value is ErrorResponse {
  return !('encoded' in value);
}

export function scanPassport(): PassportScanResult {
  return {
    firstName: 'Somchai',
    lastName: 'Jaidee',
    nationality: 'THA',
    idType: 'PASSPORT',
    idNumber: 'AA1234567',
  };
}

export function scanIdCard(): IdCardScanResult {
  return {
    firstName: 'Niran',
    lastName: 'Suksawat',
    nationality: 'TH',
    idType: 'NATIONAL_ID',
    idNumber: '1103700123456',
  };
}
