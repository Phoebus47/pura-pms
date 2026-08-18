import { Module } from '@nestjs/common';
import { YieldController } from './yield.controller';
import { YieldService } from './yield.service';

@Module({
  controllers: [YieldController],
  providers: [YieldService],
})
export class YieldModule {}
