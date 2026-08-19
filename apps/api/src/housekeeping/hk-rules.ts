export const HK_STAGES = ['DIRTY', 'CLEAN', 'READY'] as const;
export type HkStage = (typeof HK_STAGES)[number];

export const HK_ITEM_CODES = [
  'BED',
  'BATH',
  'LINEN',
  'AMENITIES',
  'MINIBAR',
] as const;
export type HkItemCode = (typeof HK_ITEM_CODES)[number];

export interface HkChecklistItem {
  code: HkItemCode;
  required: boolean;
}

export const HK_CHECKLIST: readonly HkChecklistItem[] = [
  { code: 'BED', required: true },
  { code: 'BATH', required: true },
  { code: 'LINEN', required: true },
  { code: 'AMENITIES', required: true },
  { code: 'MINIBAR', required: false },
];

export const HK_NOT_DIRTY_MESSAGE = 'Only a dirty room can be marked clean';
export const HK_NOT_CLEAN_MESSAGE = 'Only a cleaned room can be inspected';
export const HK_CLOSED_MESSAGE =
  'Out of order or out of service rooms cannot enter the inspection workflow';
export const HK_CHECKLIST_MESSAGE =
  'Inspection must include every checklist item';
export const HK_DND_CLEAN_MESSAGE =
  'Clear Do Not Disturb before marking the room clean';

export const GUEST_ROOM_REQUESTS = ['NONE', 'DND', 'MUR'] as const;
export type GuestRoomRequest = (typeof GUEST_ROOM_REQUESTS)[number];

export function isGuestRoomRequest(value: string): value is GuestRoomRequest {
  return GUEST_ROOM_REQUESTS.includes(value as GuestRoomRequest);
}
const DIRTY_STATUSES = new Set(['VACANT_DIRTY', 'OCCUPIED_DIRTY']);
const CLEAN_STATUSES = new Set(['VACANT_CLEAN', 'OCCUPIED_CLEAN']);
const CLOSED_STATUSES = new Set(['OUT_OF_ORDER', 'OUT_OF_SERVICE']);

export function isClosedRoomStatus(status: string): boolean {
  return CLOSED_STATUSES.has(status);
}

export function isDirtyRoomStatus(status: string): boolean {
  return DIRTY_STATUSES.has(status);
}

export function toDirtyRoomStatus(status: string): string {
  if (status === 'OCCUPIED_CLEAN' || status === 'OCCUPIED_DIRTY') {
    return 'OCCUPIED_DIRTY';
  }
  return 'VACANT_DIRTY';
}

export function toCleanRoomStatus(status: string): string {
  if (status === 'OCCUPIED_DIRTY' || status === 'OCCUPIED_CLEAN') {
    return 'OCCUPIED_CLEAN';
  }
  return 'VACANT_CLEAN';
}

export function hkStageForStatusChange(
  nextStatus: string,
  currentHkStage: string,
): HkStage {
  if (isDirtyRoomStatus(nextStatus)) {
    return 'DIRTY';
  }
  if (CLEAN_STATUSES.has(nextStatus) && currentHkStage === 'DIRTY') {
    return 'CLEAN';
  }
  if (HK_STAGES.includes(currentHkStage as HkStage)) {
    return currentHkStage as HkStage;
  }
  return 'READY';
}

export function inspectionPassed(
  lines: { itemCode: string; passed: boolean }[],
): boolean {
  return HK_CHECKLIST.filter((item) => item.required).every((item) =>
    lines.some((line) => line.itemCode === item.code && line.passed),
  );
}

export function hasFullChecklist(lines: { itemCode: string }[]): boolean {
  const codes = new Set(lines.map((line) => line.itemCode));
  return HK_ITEM_CODES.every((code) => codes.has(code));
}
