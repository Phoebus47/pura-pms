import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompetitorRateDto } from './dto/create-competitor-rate.dto';
import { UpdateCompetitorRateDto } from './dto/update-competitor-rate.dto';
import {
  applyRecommendation,
  createCompetitorRate,
  dismissRecommendation,
  generateRecommendations,
  getPace,
  listCompetitorRates,
  listRecommendations,
  updateCompetitorRate,
} from './yield-ops';

@Injectable()
export class YieldService {
  constructor(private readonly prisma: PrismaService) {}

  getPace(propertyId: string, from?: string, to?: string) {
    return getPace(this.prisma, propertyId, from, to);
  }

  generateRecommendations(propertyId: string) {
    return generateRecommendations(this.prisma, propertyId);
  }

  listRecommendations(propertyId: string, status?: string) {
    return listRecommendations(this.prisma, propertyId, status);
  }

  applyRecommendation(id: string) {
    return applyRecommendation(this.prisma, id);
  }

  dismissRecommendation(id: string) {
    return dismissRecommendation(this.prisma, id);
  }

  createCompetitorRate(dto: CreateCompetitorRateDto) {
    return createCompetitorRate(this.prisma, dto);
  }

  listCompetitorRates(propertyId: string) {
    return listCompetitorRates(this.prisma, propertyId);
  }

  updateCompetitorRate(id: string, dto: UpdateCompetitorRateDto) {
    return updateCompetitorRate(this.prisma, id, dto);
  }
}
