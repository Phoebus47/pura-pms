import { Module } from '@nestjs/common';
import { FoliosService } from './folios.service';
import { FoliosController } from './folios.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FoliosController],
  providers: [FoliosService],
  exports: [FoliosService],
})
export class FoliosModule {}
