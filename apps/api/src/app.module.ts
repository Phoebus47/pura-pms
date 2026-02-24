import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './properties/properties.module';
import { RoomTypesModule } from './room-types/room-types.module';
import { RoomsModule } from './rooms/rooms.module';
import { GuestsModule } from './guests/guests.module';
import { ReservationsModule } from './reservations/reservations.module';
import { FoliosModule } from './folios/folios.module';
import { FinancialModule } from './financial/financial.module';
import { BullModule } from '@nestjs/bullmq';
import { NightAuditModule } from './night-audit/night-audit.module';

@Module({
  imports: [
    LoggerModule,
    PrismaModule,
    UsersModule,
    AuthModule,
    PropertiesModule,
    RoomTypesModule,
    RoomsModule,
    GuestsModule,
    ReservationsModule,
    FoliosModule,
    FinancialModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number.parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    NightAuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
