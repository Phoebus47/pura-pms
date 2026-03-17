import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@pura/database';
import { CreateTransactionCodeDto } from './dto/create-transaction-code.dto';
import { UpdateTransactionCodeDto } from './dto/update-transaction-code.dto';

@Injectable()
export class FinancialService {
  constructor(private readonly prisma: PrismaService) {}

  private toTransactionCodeData(
    dto: CreateTransactionCodeDto | UpdateTransactionCodeDto,
  ): Prisma.TransactionCodeUncheckedCreateInput {
    if (
      dto.code === undefined ||
      dto.description === undefined ||
      dto.type === undefined ||
      dto.group === undefined ||
      dto.hasTax === undefined ||
      dto.hasService === undefined ||
      dto.glAccountCode === undefined
    ) {
      throw new Error('Invalid transaction code data');
    }
    return {
      code: dto.code,
      description: dto.description,
      descriptionTh: dto.descriptionTh,
      type: dto.type,
      group: dto.group,
      hasTax: dto.hasTax,
      hasService: dto.hasService,
      taxId: dto.taxId,
      serviceRate: dto.serviceRate,
      glAccountCode: dto.glAccountCode,
      departmentCode: dto.departmentCode,
    };
  }

  async findAllTransactionCodes() {
    return this.prisma.transactionCode.findMany({
      where: {
        // You could add isActive filtered here if needed
      },
      orderBy: {
        code: 'asc',
      },
    });
  }

  async findTransactionCodeById(id: string) {
    const trx = await this.prisma.transactionCode.findUnique({
      where: { id },
    });
    if (!trx) throw new NotFoundException('Transaction code not found');
    return trx;
  }

  async createTransactionCode(data: CreateTransactionCodeDto) {
    try {
      return await this.prisma.transactionCode.create({
        data: this.toTransactionCodeData(data),
      });
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ConflictException('Transaction code already exists');
        }
      }
      throw err;
    }
  }

  async updateTransactionCode(id: string, data: UpdateTransactionCodeDto) {
    try {
      return await this.prisma.transactionCode.update({
        where: { id },
        data,
      });
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw new NotFoundException('Transaction code not found');
        }
        if (err.code === 'P2002') {
          throw new ConflictException('Transaction code already exists');
        }
      }
      throw err;
    }
  }

  async findAllReasonCodes() {
    return this.prisma.reasonCode.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        code: 'asc',
      },
    });
  }
}
