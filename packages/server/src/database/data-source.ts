import 'dotenv/config';
import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';

import { YearConfig } from './entities/year-config.entity';
import { Settings } from './entities/settings.entity';
import { ProjectDictEntry } from './entities/project-dict-entry.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'reports',
  password: process.env.DB_PASSWORD || 'reports',
  database: process.env.DB_NAME || 'reports',
  entities: [YearConfig, Settings, ProjectDictEntry],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
};

const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;
