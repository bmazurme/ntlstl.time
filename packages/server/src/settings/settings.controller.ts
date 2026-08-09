import { Body, Controller, Get, Post } from '@nestjs/common';
import type { SettingsType, StreamEvent } from '@reports/shared';

import { SettingsService } from './settings.service';

@Controller('api/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(): Promise<StreamEvent> {
    try {
      return { type: 'message', data: await this.settingsService.getSettings() };
    } catch (error) {
      console.error('Get settings error:', error);
      return { type: 'error', data: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Post()
  async setSettings(@Body() settings: SettingsType): Promise<StreamEvent> {
    try {
      return { type: 'message', data: await this.settingsService.setSettings(settings) };
    } catch (error) {
      console.error('Set settings error:', error);
      return { type: 'error', data: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
