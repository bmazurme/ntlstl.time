import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ProjectDictType } from '@reports/shared';

import { ProjectDictEntry } from '../database/entities/project-dict-entry.entity';

@Injectable()
export class ProjectDictService {
  constructor(
    @InjectRepository(ProjectDictEntry)
    private readonly projectDictRepository: Repository<ProjectDictEntry>,
  ) {}

  async getProjectDict(): Promise<ProjectDictType> {
    const entries = await this.projectDictRepository.find();

    return entries.reduce<ProjectDictType>((dict, entry) => {
      dict[entry.code] = entry.label;
      return dict;
    }, {});
  }

  async addProjectCode(code: string, label: string): Promise<ProjectDictType> {
    const existing = await this.projectDictRepository.findOneBy({ code });
    const entry = existing ? Object.assign(existing, { label }) : this.projectDictRepository.create({ code, label });

    await this.projectDictRepository.save(entry);

    return this.getProjectDict();
  }

  async removeProjectCode(code: string): Promise<ProjectDictType> {
    await this.projectDictRepository.delete({ code });

    return this.getProjectDict();
  }
}
