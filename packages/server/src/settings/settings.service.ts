import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { SettingsType } from '@reports/shared';

import { Settings } from '../database/entities/settings.entity';

const DEFAULT_SETTINGS: SettingsType = {
  gitlabUrl: '',
  privateToken: '',
  userId: '',
  employee: '',
  company: '',
};

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
  ) {}

  async getSettings(): Promise<SettingsType> {
    const [settings] = await this.settingsRepository.find({ take: 1 });

    return settings ? this.toSettingsType(settings) : DEFAULT_SETTINGS;
  }

  async setSettings(settings: SettingsType): Promise<SettingsType> {
    const [existing] = await this.settingsRepository.find({ take: 1 });
    const entity = existing ? Object.assign(existing, settings) : this.settingsRepository.create(settings);

    await this.settingsRepository.save(entity);

    return this.toSettingsType(entity);
  }

  private toSettingsType(settings: Settings): SettingsType {
    return {
      gitlabUrl: settings.gitlabUrl,
      privateToken: settings.privateToken,
      userId: settings.userId,
      employee: settings.employee,
      company: settings.company,
    };
  }
}
