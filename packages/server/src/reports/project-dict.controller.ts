import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import type { StreamEvent } from '@reports/shared';

import { ProjectDictService } from './project-dict.service';

@Controller('api/project-dict')
export class ProjectDictController {
  constructor(private readonly projectDictService: ProjectDictService) {}

  @Get()
  async getProjectDict(): Promise<StreamEvent> {
    try {
      return { type: 'message', data: await this.projectDictService.getProjectDict() };
    } catch (error) {
      console.error('Get project dict error:', error);
      return { type: 'error', data: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Post()
  async addProjectCode(@Body('code') code: string, @Body('label') label: string): Promise<StreamEvent> {
    try {
      return { type: 'message', data: await this.projectDictService.addProjectCode(code, label) };
    } catch (error) {
      console.error('Add project code error:', error);
      return { type: 'error', data: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Delete(':code')
  async removeProjectCode(@Param('code') code: string): Promise<StreamEvent> {
    try {
      return { type: 'message', data: await this.projectDictService.removeProjectCode(code) };
    } catch (error) {
      console.error('Remove project code error:', error);
      return { type: 'error', data: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
