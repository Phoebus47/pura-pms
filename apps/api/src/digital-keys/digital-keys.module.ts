import { Module } from '@nestjs/common';
import { DigitalKeysController } from './digital-keys.controller';
import { DigitalKeysService } from './digital-keys.service';

@Module({
  controllers: [DigitalKeysController],
  providers: [DigitalKeysService],
  exports: [DigitalKeysService],
})
export class DigitalKeysModule {}
