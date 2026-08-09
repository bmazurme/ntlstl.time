import AppDataSource from '../database/data-source';
import { YearConfig } from '../database/entities/year-config.entity';
import { Settings } from '../database/entities/settings.entity';
import { ProjectDictEntry } from '../database/entities/project-dict-entry.entity';

import legacyProps from '../legacy-data/props.json';
import legacySettings from '../legacy-data/settings.json';
import legacyProjectDict from '../legacy-data/project-dict.json';

type LegacyYearProps = {
  holidays: string[];
  shortDays: string[];
  badDays: string[];
  offDays: string[];
};

async function importFromJson() {
  await AppDataSource.initialize();

  const yearConfigRepository = AppDataSource.getRepository(YearConfig);
  const settingsRepository = AppDataSource.getRepository(Settings);
  const projectDictRepository = AppDataSource.getRepository(ProjectDictEntry);

  const yearEntries = Object.entries(legacyProps as Record<string, LegacyYearProps>);

  for (const [year, props] of yearEntries) {
    await yearConfigRepository.save({
      year: Number(year),
      holidays: props.holidays,
      shortDays: props.shortDays,
      badDays: props.badDays,
      offDays: props.offDays,
    });
  }
  console.log(`Imported ${yearEntries.length} year_config row(s).`);

  const [existingSettings] = await settingsRepository.find({ take: 1 });
  await settingsRepository.save({ ...existingSettings, ...legacySettings });
  console.log('Imported settings row.');

  const projectDictEntries = Object.entries(legacyProjectDict as Record<string, string>);

  for (const [code, label] of projectDictEntries) {
    await projectDictRepository.save({ code, label });
  }
  console.log(`Imported ${projectDictEntries.length} project_dict row(s).`);

  await AppDataSource.destroy();
}

importFromJson().catch((error) => {
  console.error('Import from JSON failed:', error);
  process.exitCode = 1;
});
