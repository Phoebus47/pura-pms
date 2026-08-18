import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRateDto } from './dto/create-rate.dto';
import { UpdateRateDto } from './dto/update-rate.dto';
import { createRate, findRate, findRates, updateRate } from './rates-ops';

@Injectable()
export class RatesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateRateDto) {
    return createRate(this.prisma, dto);
  }

  findAll(propertyId?: string, roomTypeId?: string) {
    return findRates(this.prisma, propertyId, roomTypeId);
  }

  findOne(id: string) {
    return findRate(this.prisma, id);
  }

  update(id: string, dto: UpdateRateDto) {
    return updateRate(this.prisma, id, dto);
  }
}
