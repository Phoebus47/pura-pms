const THAI_NATIONALITIES = new Set(['TH', 'THA', 'THAI', 'THAILAND']);

export const TM30_MISSING_PROPERTY = 'propertyId is required';
export const TM30_NOT_PENDING = 'Only pending TM.30 reports can be submitted';
export const TM30_NOT_SUBMITTED =
  'Only submitted TM.30 reports can be confirmed or failed';

export type Tm30SkipReason =
  | 'THAI_NATIONAL'
  | 'MISSING_NATIONALITY'
  | 'MISSING_PASSPORT'
  | 'ALREADY_EXISTS';

export function normalizeNationality(value: string | null | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

export function isThaiNationality(value: string | null | undefined): boolean {
  return THAI_NATIONALITIES.has(normalizeNationality(value));
}

export function classifyGuestForTm30(guest: {
  nationality?: string | null;
  idNumber?: string | null;
}): Tm30SkipReason | null {
  const nationality = normalizeNationality(guest.nationality);
  if (!nationality) return 'MISSING_NATIONALITY';
  if (isThaiNationality(nationality)) return 'THAI_NATIONAL';
  if (!guest.idNumber?.trim()) return 'MISSING_PASSPORT';
  return null;
}

export function dueAtFromArrival(arrival: Date): Date {
  return new Date(arrival.getTime() + 24 * 60 * 60 * 1000);
}

export function toUtcDate(value: Date): Date {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  );
}

export function isOverdue(
  status: string,
  dueAt: Date,
  now: Date = new Date(),
): boolean {
  return status === 'PENDING' && dueAt.getTime() < now.getTime();
}

export function formatTm30Tsv(
  rows: Array<{
    passportNumber: string;
    fullName: string;
    nationality: string;
    dateOfBirth: Date | string | null;
    roomNumber: string;
    arrivalDate: Date | string;
    departureDate: Date | string | null;
    addressInThailand: string | null;
  }>,
): string {
  const header = [
    'PASSPORT',
    'FULL_NAME',
    'NATIONALITY',
    'DOB',
    'ROOM',
    'ARRIVAL',
    'DEPARTURE',
    'ADDRESS',
  ].join('\t');
  const lines = rows.map((row) =>
    [
      row.passportNumber,
      row.fullName,
      row.nationality,
      toDateCell(row.dateOfBirth),
      row.roomNumber,
      toDateCell(row.arrivalDate),
      toDateCell(row.departureDate),
      row.addressInThailand ?? '',
    ].join('\t'),
  );
  return [header, ...lines].join('\n');
}

function toDateCell(value: Date | string | null): string {
  if (!value) return '';
  return String(value).slice(0, 10);
}
