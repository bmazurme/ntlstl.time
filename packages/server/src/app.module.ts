import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { dataSourceOptions } from './database/data-source';
import { CountsModule } from './counts/counts.module';
import { SettingsModule } from './settings/settings.module';
import { ProjectDictModule } from './reports/project-dict.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    CountsModule,
    SettingsModule,
    ProjectDictModule,
    ReportsModule,
  ],
})
export class AppModule {}
