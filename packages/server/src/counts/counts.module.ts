import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { YearConfig } from '../database/entities/year-config.entity';
import { CountsController } from './counts.controller';
import { CountsService } from './counts.service';

@Module({
  imports: [TypeOrmModule.forFeature([YearConfig])],
  controllers: [CountsController],
  providers: [CountsService],
})
export class CountsModule {}
