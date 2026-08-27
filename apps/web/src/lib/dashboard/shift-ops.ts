import type { Reservation } from '@/lib/api/reservations';
import type { Room } from '@/lib/api/rooms';

export interface QueueMetric {
  remaining: number;
  total: number;
}

export interface ShiftOpsWorkItem {
  id: string;
  guestName: string;
  confirmNumber: string;
  roomLabel: string;
  kind: 'arrival' | 'departure' | 'unassigned';
  status: Reservation['status'];
  blockers: string[];
  href: string;
}

export interface ShiftOpsSnapshot {
  businessDate: string;
  propertyName: string;
  occupancyRate: number;
  readyToSell: number;
  dirtyRooms: number;
  totalRooms: number;
  arrivals: QueueMetric;
  departures: QueueMetric;
  unassigned: QueueMetric;
  vipCount: number;
  balanceDueCount: number;
  workItems: ShiftOpsWorkItem[];
}

export function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

export function todayDateKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function guestName(reservation: Reservation): string {
  return `${reservation.guest?.firstName ?? ''} ${reservation.guest?.lastName ?? ''}`.trim();
}

function guestVipLevel(reservation: Reservation): number {
  const guest = reservation.guest as { vipLevel?: number } | undefined;
  return guest?.vipLevel ?? 0;
}

function hasRoom(reservation: Reservation): boolean {
  return Boolean(reservation.roomId && reservation.roomId.length > 0);
}

function isArrivalDue(reservation: Reservation, today: string): boolean {
  return (
    toDateKey(reservation.checkIn) === today &&
    (reservation.status === 'CONFIRMED' ||
      reservation.status === 'TENTATIVE' ||
      reservation.status === 'CHECKED_IN')
  );
}

function isDepartureDue(reservation: Reservation, today: string): boolean {
  return (
    toDateKey(reservation.checkOut) === today &&
    (reservation.status === 'CHECKED_IN' ||
      reservation.status === 'CHECKED_OUT')
  );
}

function roomLabel(reservation: Reservation): string {
  if (reservation.room?.number) {
    return reservation.room.number;
  }
  return '—';
}

function blockersFor(
  reservation: Reservation,
  roomsById: Map<string, Room>,
): string[] {
  const blockers: string[] = [];
  if (!hasRoom(reservation) && reservation.status === 'CONFIRMED') {
    blockers.push('unassigned');
  }
  if (guestVipLevel(reservation) > 0 || reservation.isRoomLocked) {
    blockers.push('vip');
  }
  const balance =
    Number(reservation.totalAmount) - Number(reservation.paidAmount ?? 0);
  if (balance > 0 && reservation.status === 'CHECKED_IN') {
    blockers.push('balanceDue');
  }
  if (reservation.roomId) {
    const room = roomsById.get(reservation.roomId);
    if (
      room &&
      (room.status === 'VACANT_DIRTY' ||
        room.status === 'OCCUPIED_DIRTY' ||
        room.hkStage === 'DIRTY')
    ) {
      blockers.push('dirty');
    }
  }
  return blockers;
}

export function buildShiftOpsSnapshot(
  reservations: Reservation[],
  rooms: Room[],
  now = new Date(),
): ShiftOpsSnapshot {
  const today = todayDateKey(now);
  const roomsById = new Map(rooms.map((room) => [room.id, room]));

  const arrivalDue = reservations.filter((row) => isArrivalDue(row, today));
  const arrivalRemaining = arrivalDue.filter(
    (row) => row.status === 'CONFIRMED' || row.status === 'TENTATIVE',
  );

  const departureDue = reservations.filter((row) => isDepartureDue(row, today));
  const departureRemaining = departureDue.filter(
    (row) => row.status === 'CHECKED_IN',
  );

  const unassignedDue = reservations.filter(
    (row) =>
      (row.status === 'CONFIRMED' || row.status === 'TENTATIVE') &&
      !hasRoom(row),
  );

  const checkedIn = reservations.filter((row) => row.status === 'CHECKED_IN');
  const readyToSell = rooms.filter(
    (room) =>
      room.status === 'VACANT_CLEAN' ||
      room.hkStage === 'READY' ||
      room.hkStage === 'CLEAN',
  ).length;
  const dirtyRooms = rooms.filter(
    (room) =>
      room.status === 'VACANT_DIRTY' ||
      room.status === 'OCCUPIED_DIRTY' ||
      room.hkStage === 'DIRTY',
  ).length;

  const vipCount = [...arrivalRemaining, ...checkedIn].filter(
    (row) => guestVipLevel(row) > 0 || row.isRoomLocked,
  ).length;

  const balanceDueCount = checkedIn.filter(
    (row) => Number(row.totalAmount) - Number(row.paidAmount ?? 0) > 0,
  ).length;

  const propertyName =
    rooms[0]?.property?.name ?? reservations[0]?.room?.property?.name ?? '';

  const occupancyRate =
    rooms.length > 0 ? Math.round((checkedIn.length / rooms.length) * 100) : 0;

  const workSource = [
    ...arrivalRemaining.map(
      (row) =>
        ({
          reservation: row,
          kind: 'arrival' as const,
        }) as const,
    ),
    ...departureRemaining.map(
      (row) =>
        ({
          reservation: row,
          kind: 'departure' as const,
        }) as const,
    ),
    ...unassignedDue
      .filter((row) => !arrivalRemaining.some((a) => a.id === row.id))
      .map(
        (row) =>
          ({
            reservation: row,
            kind: 'unassigned' as const,
          }) as const,
      ),
  ];

  const seen = new Set<string>();
  const workItems: ShiftOpsWorkItem[] = [];
  for (const item of workSource) {
    if (seen.has(item.reservation.id)) {
      continue;
    }
    seen.add(item.reservation.id);
    workItems.push({
      id: item.reservation.id,
      guestName: guestName(item.reservation) || item.reservation.confirmNumber,
      confirmNumber: item.reservation.confirmNumber,
      roomLabel: roomLabel(item.reservation),
      kind: item.kind,
      status: item.reservation.status,
      blockers: blockersFor(item.reservation, roomsById),
      href: `/reservations/${item.reservation.id}`,
    });
  }

  return {
    businessDate: today,
    propertyName,
    occupancyRate,
    readyToSell,
    dirtyRooms,
    totalRooms: rooms.length,
    arrivals: {
      remaining: arrivalRemaining.length,
      total: arrivalDue.length,
    },
    departures: {
      remaining: departureRemaining.length,
      total: departureDue.length,
    },
    unassigned: {
      remaining: unassignedDue.length,
      total: unassignedDue.length,
    },
    vipCount,
    balanceDueCount,
    workItems: workItems.slice(0, 12),
  };
}
