export type DigitalKeyStatus = 'UNAVAILABLE';

export interface DigitalKeyStub {
  status: DigitalKeyStatus;
  message: string;
}

export function buildDigitalKeyStub(): DigitalKeyStub {
  return {
    status: 'UNAVAILABLE',
    message:
      'Digital key issuance is not available yet. Please collect a physical key at the front desk.',
  };
}
