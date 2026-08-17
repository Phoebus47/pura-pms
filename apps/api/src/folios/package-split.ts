import { BadRequestException } from '@nestjs/common';
import { computePostingAmounts, round2 } from './folio-posting';
import type { FolioTransaction, Prisma } from '@pura/database';
import type { PostingTrxCode } from './folio-posting';
import type { PrismaService } from '../prisma/prisma.service';

export const ROOM_CHARGE_TRX_CODE = '1000';
export const PACKAGE_SPLIT_PERCENT_SUM_MESSAGE =
  'Package split rule percents must sum to 100';

export interface SplitTargetTrxCode extends PostingTrxCode {
  id: string;
  code: string;
}

export interface PackageSplitRuleInput {
  trxCodeId: string;
  percent: unknown;
  trxCode: SplitTargetTrxCode;
}

export interface SplitPostingLine {
  trxCodeId: string;
  code: string;
  amountNet: number;
  amountService: number;
  amountTax: number;
  amountTotal: number;
  sign: number;
}

export function percentsSumTo100(percents: number[]): boolean {
  const sum = percents.reduce((total, percent) => total + percent, 0);
  return Math.abs(sum - 100) <= 0.01;
}

export function allocateNetByPercent(
  amountNet: number,
  percents: number[],
): number[] {
  if (percents.length === 0) {
    return [];
  }
  const allocated: number[] = [];
  let used = 0;
  for (let i = 0; i < percents.length; i += 1) {
    if (i === percents.length - 1) {
      allocated.push(round2(amountNet - used));
      continue;
    }
    const part = round2((amountNet * percents[i]) / 100);
    allocated.push(part);
    used = round2(used + part);
  }
  return allocated;
}

export function buildSplitPostingLines(
  amountNet: number,
  rules: PackageSplitRuleInput[],
  taxExempt = false,
): SplitPostingLine[] {
  const percents = rules.map((rule) => Number(rule.percent));
  if (!percentsSumTo100(percents)) {
    throw new BadRequestException(PACKAGE_SPLIT_PERCENT_SUM_MESSAGE);
  }
  const nets = allocateNetByPercent(amountNet, percents);
  return rules.map((rule, index) => {
    const amounts = computePostingAmounts(nets[index], rule.trxCode, {
      taxExempt,
    });
    return {
      trxCodeId: rule.trxCodeId,
      code: rule.trxCode.code,
      ...amounts,
    };
  });
}

export function pickRoomOrFirstLine<T>(
  created: T[],
  lines: Pick<SplitPostingLine, 'code'>[],
): T {
  const roomIndex = lines.findIndex(
    (line) => line.code === ROOM_CHARGE_TRX_CODE,
  );
  if (roomIndex >= 0) {
    return created[roomIndex];
  }
  return created[0];
}

export function sumBalanceImpact(lines: SplitPostingLine[]): number {
  return round2(
    lines.reduce((total, line) => total + line.amountTotal * line.sign, 0),
  );
}

export async function resolvePostingLines(
  prisma: PrismaService,
  trxCode: SplitTargetTrxCode,
  rateCode: string | null,
  singleLine: SplitPostingLine,
  taxExempt = false,
): Promise<SplitPostingLine[]> {
  if (trxCode.code !== ROOM_CHARGE_TRX_CODE || !rateCode) {
    return [singleLine];
  }
  const rules = await prisma.packageSplitRule.findMany({
    where: { rateCode, isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: { trxCode: true },
  });
  if (rules.length === 0) {
    return [singleLine];
  }
  return buildSplitPostingLines(singleLine.amountNet, rules, taxExempt);
}

export async function persistPostingLines(
  tx: Prisma.TransactionClient,
  params: {
    folioId: string;
    windowId: string;
    businessDate: Date;
    reference?: string;
    remark?: string;
    userId: string;
    reasonCodeId?: string;
    shiftId: string | null;
    lines: SplitPostingLine[];
  },
) {
  const created: FolioTransaction[] = [];
  for (const line of params.lines) {
    created.push(
      await tx.folioTransaction.create({
        data: {
          windowId: params.windowId,
          trxCodeId: line.trxCodeId,
          businessDate: params.businessDate,
          amountNet: line.amountNet,
          amountService: line.amountService,
          amountTax: line.amountTax,
          amountTotal: line.amountTotal,
          sign: line.sign,
          reference: params.reference,
          remark: params.remark,
          userId: params.userId,
          reasonCodeId: params.reasonCodeId,
          shiftId: params.shiftId,
        },
      }),
    );
  }
  const totalImpact = sumBalanceImpact(params.lines);
  await tx.folioWindow.update({
    where: { id: params.windowId },
    data: { balance: { increment: totalImpact } },
  });
  await tx.folio.update({
    where: { id: params.folioId },
    data: { balance: { increment: totalImpact } },
  });
  return pickRoomOrFirstLine(created, params.lines);
}
