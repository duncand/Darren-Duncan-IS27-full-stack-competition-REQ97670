import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PositionsService } from './positions.service';
import { PositionsController } from './positions.controller';

@Module({
  imports: [ConfigModule],
  controllers: [PositionsController],
  providers: [PositionsService]
})
export class PositionsModule {}
