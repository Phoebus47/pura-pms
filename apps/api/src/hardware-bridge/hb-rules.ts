export const HARDWARE_DEVICE_TYPES = [
  'PRINTER',
  'KEY_CARD_ENCODER',
  'PASSPORT_SCANNER',
  'SMART_CARD_READER',
] as const;
export type HardwareDeviceType = (typeof HARDWARE_DEVICE_TYPES)[number];

export const HARDWARE_VENDORS = [
  'GENERIC',
  'VINGCARD',
  'SALTO',
  'HAFELE',
] as const;
export type HardwareVendor = (typeof HARDWARE_VENDORS)[number];

export const HARDWARE_JOB_TYPES = [
  'PRINT',
  'KEYCARD_ENCODE',
  'PASSPORT_SCAN',
  'ID_CARD_READ',
] as const;
export type HardwareJobType = (typeof HARDWARE_JOB_TYPES)[number];

export const HARDWARE_JOB_STATUSES = [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
] as const;
export type HardwareJobStatus = (typeof HARDWARE_JOB_STATUSES)[number];

export interface DefaultHardwareDevice {
  type: HardwareDeviceType;
  vendor: HardwareVendor;
  label: string;
  isDefault: boolean;
  isActive: boolean;
}

export const DEFAULT_HARDWARE_DEVICES: readonly DefaultHardwareDevice[] = [
  {
    type: 'PRINTER',
    vendor: 'GENERIC',
    label: 'Receipt printer',
    isDefault: true,
    isActive: true,
  },
  {
    type: 'KEY_CARD_ENCODER',
    vendor: 'GENERIC',
    label: 'Key card encoder',
    isDefault: true,
    isActive: true,
  },
  {
    type: 'PASSPORT_SCANNER',
    vendor: 'GENERIC',
    label: 'Passport scanner',
    isDefault: true,
    isActive: true,
  },
  {
    type: 'SMART_CARD_READER',
    vendor: 'GENERIC',
    label: 'Thai ID reader',
    isDefault: true,
    isActive: true,
  },
];

export const AGENT_DUPLICATE_MESSAGE =
  'Hardware agent with this machineId already exists for the property';
export const JOB_NOT_OPENABLE_MESSAGE =
  'Only pending or in-progress jobs can be updated';
export const KEYCARD_ROOM_REQUIRED_MESSAGE =
  'payload.roomNumber is required for KEYCARD_ENCODE';
export const UNKNOWN_JOB_TYPE_MESSAGE = 'Unsupported hardware job type';

const OPENABLE_STATUSES = new Set<string>(['PENDING', 'IN_PROGRESS']);

export function isOpenableJobStatus(status: string): boolean {
  return OPENABLE_STATUSES.has(status);
}

export function asPayloadRecord(payload: unknown): Record<string, unknown> {
  if (
    payload !== null &&
    typeof payload === 'object' &&
    !Array.isArray(payload)
  ) {
    return payload as Record<string, unknown>;
  }
  return {};
}

export function payloadString(
  payload: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = payload[key];
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return undefined;
}

export function payloadCopies(payload: Record<string, unknown>): number {
  const copies = payload.copies;
  if (typeof copies === 'number' && Number.isFinite(copies) && copies > 0) {
    return copies;
  }
  return 1;
}

export function catalogPayload() {
  return {
    deviceTypes: [...HARDWARE_DEVICE_TYPES],
    vendors: [...HARDWARE_VENDORS],
    jobTypes: [...HARDWARE_JOB_TYPES],
  };
}

export function defaultDeviceCreates(): DefaultHardwareDevice[] {
  return DEFAULT_HARDWARE_DEVICES.map((device) => ({ ...device }));
}
