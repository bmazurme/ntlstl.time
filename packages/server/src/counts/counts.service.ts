import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { YearConfig } from '../database/entities/year-config.entity';

export type YearProps = {
  holidays: string[];
  shortDays: string[];
  badDays: string[];
  offDays: string[];
};

@Injectable()
export class CountsService {
  constructor(
    @InjectRepository(YearConfig)
    private readonly yearConfigRepository: Repository<YearConfig>,
  ) {}

  private async getYearConfig(year: number | string): Promise<YearConfig> {
    const config = await this.yearConfigRepository.findOneBy({ year: Number(year) });

    if (!config) {
      throw new Error(`Year config for ${year} not found`);
    }

    return config;
  }

  async getProps(year: number | string): Promise<YearProps> {
    return this.toProps(await this.getYearConfig(year));
  }

  async addOffDays(year: number | string, dates: string[]): Promise<YearProps> {
    const config = await this.getYearConfig(year);
    const newDates = dates.filter((date) => !config.offDays.includes(date));

    if (newDates.length > 0) {
      config.offDays = [...config.offDays, ...newDates];
      await this.yearConfigRepository.save(config);
    }

    return this.toProps(config);
  }

  async removeOffDay(year: number | string, date: string): Promise<YearProps> {
    const config = await this.getYearConfig(year);

    if (config.offDays.includes(date)) {
      config.offDays = config.offDays.filter((d) => d !== date);
      await this.yearConfigRepository.save(config);
    }

    return this.toProps(config);
  }

  private toProps(config: YearConfig): YearProps {
    return {
      holidays: config.holidays,
      shortDays: config.shortDays,
      badDays: config.badDays,
      offDays: config.offDays,
    };
  }
}
