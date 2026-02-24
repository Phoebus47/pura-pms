import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinancialService {
  constructor(private readonly prisma: PrismaService) {}

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
