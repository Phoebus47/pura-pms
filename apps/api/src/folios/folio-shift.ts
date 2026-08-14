import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShiftStatus } from '@pura/database';

export const SYSTEM_USER_ID = 'SYSTEM';
export const OPEN_SHIFT_REQUIRED_MESSAGE =
  'An open shift is required to post this transaction';

export async function resolveCashierShiftId(
  prisma: PrismaService,
  userId: string,
  propertyId: string | undefined,
): Promise<string | null> {
  if (userId === SYSTEM_USER_ID) {
    return null;
  }
  if (!propertyId) {
    throw new BadRequestException(OPEN_SHIFT_REQUIRED_MESSAGE);
  }
  const openShift = await prisma.shift.findFirst({
    where: { userId, propertyId, status: ShiftStatus.OPEN },
  });
  if (!openShift) {
    throw new BadRequestException(OPEN_SHIFT_REQUIRED_MESSAGE);
  }
  return openShift.id;
}

export async function resolvePostShiftId(
  prisma: PrismaService,
  folioId: string,
  userId: string,
): Promise<string | null> {
  if (userId === SYSTEM_USER_ID) {
    return null;
  }
  const folio = await prisma.folio.findUnique({
    where: { id: folioId },
    include: {
      reservation: { include: { room: true } },
    },
  });
  return resolveCashierShiftId(
    prisma,
    userId,
    folio?.reservation?.room?.propertyId,
  );
}
