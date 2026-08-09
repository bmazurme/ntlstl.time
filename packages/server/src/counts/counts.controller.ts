import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import type { StreamEvent } from '@reports/shared';

import { countWorkAndShortDays } from '../utils/count-work-and-short-days';
import { CountsService } from './counts.service';

@Controller('api/counts')
export class CountsController {
  constructor(private readonly countsService: CountsService) {}

  @Get(':id')
  async getCounts(@Param('id') id: string): Promise<StreamEvent> {
    try {
      const { holidays, shortDays, badDays, offDays } = await this.countsService.getProps(id);
      const calendar = countWorkAndShortDays(Number(id), holidays, shortDays, badDays, offDays);

      return { type: 'message', data: { calendar, holidays, shortDays, badDays, offDays } };
    } catch (error) {
      console.error('Counts error:', error);
      return { type: 'error', data: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Post(':id/off-days')
  async addOffDays(@Param('id') id: string, @Body('dates') dates: string[]): Promise<StreamEvent> {
    try {
      const { holidays, shortDays, badDays, offDays } = await this.countsService.addOffDays(id, dates);
      const calendar = countWorkAndShortDays(Number(id), holidays, shortDays, badDays, offDays);

      return { type: 'message', data: { calendar, holidays, shortDays, badDays, offDays } };
    } catch (error) {
      console.error('Add off day error:', error);
      return { type: 'error', data: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Delete(':id/off-days/:date')
  async removeOffDay(@Param('id') id: string, @Param('date') date: string): Promise<StreamEvent> {
    try {
      const { holidays, shortDays, badDays, offDays } = await this.countsService.removeOffDay(id, date);
      const calendar = countWorkAndShortDays(Number(id), holidays, shortDays, badDays, offDays);

      return { type: 'message', data: { calendar, holidays, shortDays, badDays, offDays } };
    } catch (error) {
      console.error('Remove off day error:', error);
      return { type: 'error', data: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
