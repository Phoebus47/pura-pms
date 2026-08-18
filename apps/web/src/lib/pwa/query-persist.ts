const PERSISTED_ROOT_KEYS = new Set([
  'properties',
  'rooms',
  'room-types',
  'guests',
  'reservations',
  'housekeeping-board',
  'housekeeping-checklist',
  'hardware-agents',
  'hardware-jobs',
]);

export function shouldPersistQuery(queryKey: readonly unknown[]): boolean {
  const root = queryKey[0];
  return typeof root === 'string' && PERSISTED_ROOT_KEYS.has(root);
}
