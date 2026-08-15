import {
  arAccountOptionLabel,
  folioOptionLabel,
  reservationOptionLabel,
} from './entity-labels';
import type { FolioListItem } from '@/lib/api/folios';
import type { ArAccount } from '@/lib/api/ar-accounts';
import type { Reservation } from '@/lib/api/reservations';

describe('entity-labels', () => {
  it('formats a folio option with guest and room', () => {
    const folio = {
      id: 'f1',
      folioNumber: 'F000001',
      status: 'OPEN',
      balance: 100,
      reservationId: 'r1',
      reservation: {
        guest: { firstName: 'John', lastName: 'Doe' },
        room: { number: '102' },
      },
    } as FolioListItem;

    expect(folioOptionLabel(folio)).toBe('F000001 · John Doe · 102');
  });

  it('formats a reservation option', () => {
    const reservation = {
      confirmNumber: 'CN-1',
      guest: { firstName: 'Jane', lastName: 'Smith' },
      room: { number: '201' },
    } as Reservation;

    expect(reservationOptionLabel(reservation)).toBe('CN-1 · Jane Smith · 201');
  });

  it('formats an AR account option', () => {
    const account = {
      accountNumber: 'AR-001',
      companyName: 'Acme',
    } as ArAccount;

    expect(arAccountOptionLabel(account)).toBe('AR-001 · Acme');
  });
});
