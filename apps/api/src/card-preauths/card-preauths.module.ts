import { Module } from '@nestjs/common';
import { CardPreauthsController } from './card-preauths.controller';
import { CardPreauthsService } from './card-preauths.service';

@Module({
  controllers: [CardPreauthsController],
  providers: [CardPreauthsService],
})
export class CardPreauthsModule {}
