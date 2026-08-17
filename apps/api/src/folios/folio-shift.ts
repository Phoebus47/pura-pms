import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FolioStatus, ShiftStatus } from '@pura/database';

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
): Promise<{
  shiftId: string | null;
  rateCode: string | null;
  propertyCurrency: string;
  status: FolioStatus | null;
  taxExempt: boolean;
}> {
  const folio = await prisma.folio.findUnique({
    where: { id: folioId },
    include: {
      reservation: { include: { room: { include: { property: true } } } },
    },
  });
  const rateCode = folio?.reservation?.rateCode ?? null;
  const propertyCurrency =
    folio?.reservation?.room?.property?.currency ?? 'THB';
  const status = folio?.status ?? null;
  const taxExempt = folio?.reservation?.taxExempt === true;
  if (userId === SYSTEM_USER_ID) {
    return { shiftId: null, rateCode, propertyCurrency, status, taxExempt };
  }
  const shiftId = await resolveCashierShiftId(
    prisma,
    userId,
    folio?.reservation?.room?.propertyId,
  );
  return { shiftId, rateCode, propertyCurrency, status, taxExempt };
}
