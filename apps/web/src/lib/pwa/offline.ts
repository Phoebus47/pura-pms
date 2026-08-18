export class OfflineMutationError extends Error {
  constructor() {
    super('OFFLINE_MUTATION_BLOCKED');
    this.name = 'OfflineMutationError';
  }
}

export function isBrowserOffline(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.onLine === 'boolean' &&
    !navigator.onLine
  );
}

export function assertOnlineMutation(method: string): void {
  const verb = method.toUpperCase();
  if (verb === 'GET' || verb === 'HEAD') {
    return;
  }
  if (isBrowserOffline()) {
    throw new OfflineMutationError();
  }
}
