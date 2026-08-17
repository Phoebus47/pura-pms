import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import {
  allocateNetByPercent,
  buildSplitPostingLines,
  PACKAGE_SPLIT_PERCENT_SUM_MESSAGE,
  percentsSumTo100,
  pickRoomOrFirstLine,
  resolvePostingLines,
  ROOM_CHARGE_TRX_CODE,
  sumBalanceImpact,
} from './package-split';
import type {
  PackageSplitRuleInput,
  SplitTargetTrxCode,
} from './package-split';

const roomTrx: SplitTargetTrxCode = {
  id: 'trx-room',
  code: ROOM_CHARGE_TRX_CODE,
  type: 'CHARGE',
  hasTax: true,
  hasService: true,
  serviceRate: 10,
};

const fnbTrx: SplitTargetTrxCode = {
  id: 'trx-fnb',
  code: '2000',
  type: 'CHARGE',
  hasTax: true,
  hasService: true,
  serviceRate: 10,
};

const pkgBbRules: PackageSplitRuleInput[] = [
  { trxCodeId: roomTrx.id, percent: 80, trxCode: roomTrx },
  { trxCodeId: fnbTrx.id, percent: 20, trxCode: fnbTrx },
];

describe('package-split', () => {
  describe('percentsSumTo100', () => {
    it('accepts percents that sum to 100', () => {
      expect(percentsSumTo100([80, 20])).toBe(true);
    });

    it('accepts percents within 0.01 of 100', () => {
      expect(percentsSumTo100([50, 49.99])).toBe(true);
    });

    it('rejects percents outside 0.01 of 100', () => {
      expect(percentsSumTo100([50, 49.98])).toBe(false);
    });
  });

  describe('allocateNetByPercent', () => {
    it('puts remainder on the last line so nets match exactly', () => {
      const nets = allocateNetByPercent(10, [33.33, 33.33, 33.34]);
      expect(nets).toEqual([3.33, 3.33, 3.34]);
      expect(nets.reduce((sum, n) => sum + n, 0)).toBe(10);
    });

    it('splits 80/20 without remainder drift', () => {
      expect(allocateNetByPercent(1000, [80, 20])).toEqual([800, 200]);
    });
  });

  describe('buildSplitPostingLines', () => {
    it('splits PKG-BB 80/20 nets that sum to the original amountNet', () => {
      const lines = buildSplitPostingLines(1000, pkgBbRules);
      expect(lines).toHaveLength(2);
      expect(lines[0].amountNet + lines[1].amountNet).toBe(1000);
      expect(lines[0]).toMatchObject({
        trxCodeId: roomTrx.id,
        code: '1000',
        amountNet: 800,
      });
      expect(lines[1]).toMatchObject({
        trxCodeId: fnbTrx.id,
        code: '2000',
        amountNet: 200,
      });
    });

    it('skips VAT on split lines when tax-exempt', () => {
      const lines = buildSplitPostingLines(1000, pkgBbRules, true);
      expect(lines.every((line) => line.amountTax === 0)).toBe(true);
    });

    it('throws when percents do not sum to 100', () => {
      expect(() =>
        buildSplitPostingLines(1000, [
          { trxCodeId: roomTrx.id, percent: 50, trxCode: roomTrx },
          { trxCodeId: fnbTrx.id, percent: 30, trxCode: fnbTrx },
        ]),
      ).toThrow(BadRequestException);
      expect(() =>
        buildSplitPostingLines(1000, [
          { trxCodeId: roomTrx.id, percent: 50, trxCode: roomTrx },
          { trxCodeId: fnbTrx.id, percent: 30, trxCode: fnbTrx },
        ]),
      ).toThrow(PACKAGE_SPLIT_PERCENT_SUM_MESSAGE);
    });
  });

  describe('pickRoomOrFirstLine', () => {
    it('returns the room line when present', () => {
      expect(
        pickRoomOrFirstLine(
          [{ id: 'fnb' }, { id: 'room' }],
          [{ code: '2000' }, { code: '1000' }],
        ),
      ).toEqual({ id: 'room' });
    });

    it('returns the first line when no room line exists', () => {
      expect(
        pickRoomOrFirstLine([{ id: 'first' }], [{ code: '2000' }]),
      ).toEqual({ id: 'first' });
    });
  });

  describe('sumBalanceImpact', () => {
    it('sums amountTotal * sign across lines', () => {
      expect(
        sumBalanceImpact([
          {
            trxCodeId: 'a',
            code: '1000',
            amountNet: 800,
            amountService: 80,
            amountTax: 61.6,
            amountTotal: 941.6,
            sign: 1,
          },
          {
            trxCodeId: 'b',
            code: '2000',
            amountNet: 200,
            amountService: 20,
            amountTax: 15.4,
            amountTotal: 235.4,
            sign: 1,
          },
        ]),
      ).toBe(1177);
    });
  });

  describe('resolvePostingLines', () => {
    const singleLine = {
      trxCodeId: roomTrx.id,
      code: roomTrx.code,
      amountNet: 1000,
      amountService: 100,
      amountTax: 77,
      amountTotal: 1177,
      sign: 1,
    };

    it('returns one row when the trx code is not 1000', async () => {
      const findMany = vi.fn();
      const prisma = {
        packageSplitRule: { findMany },
      } as unknown as PrismaService;

      const lines = await resolvePostingLines(
        prisma,
        { ...roomTrx, code: '9000' },
        'PKG-BB',
        singleLine,
      );

      expect(lines).toEqual([singleLine]);
      expect(findMany).not.toHaveBeenCalled();
    });

    it('returns one row when no rules exist', async () => {
      const findMany = vi.fn().mockResolvedValue([]);
      const prisma = {
        packageSplitRule: { findMany },
      } as unknown as PrismaService;

      const lines = await resolvePostingLines(
        prisma,
        roomTrx,
        'STD',
        singleLine,
      );

      expect(lines).toEqual([singleLine]);
      expect(findMany).toHaveBeenCalledWith({
        where: { rateCode: 'STD', isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: { trxCode: true },
      });
    });

    it('returns split lines for PKG-BB 80/20', async () => {
      const findMany = vi.fn().mockResolvedValue(pkgBbRules);
      const prisma = {
        packageSplitRule: { findMany },
      } as unknown as PrismaService;

      const lines = await resolvePostingLines(
        prisma,
        roomTrx,
        'PKG-BB',
        singleLine,
      );

      expect(lines).toHaveLength(2);
      expect(lines[0].amountNet + lines[1].amountNet).toBe(1000);
    });
  });
});
