import { Module } from '@nestjs/common';

import { SettingsModule } from '../settings/settings.module';
import { ProjectDictModule } from './project-dict.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [SettingsModule, ProjectDictModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
