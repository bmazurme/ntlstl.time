import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProjectDictEntry } from '../database/entities/project-dict-entry.entity';
import { ProjectDictController } from './project-dict.controller';
import { ProjectDictService } from './project-dict.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectDictEntry])],
  controllers: [ProjectDictController],
  providers: [ProjectDictService],
  exports: [ProjectDictService],
})
export class ProjectDictModule {}
