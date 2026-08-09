import { Controller, Get } from '@nestjs/common';
import type { StreamEvent } from '@reports/shared';

import { ReportsService } from './reports.service';

@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  async getReports(): Promise<StreamEvent> {
    try {
      return { type: 'message', data: await this.reportsService.getReports() };
    } catch (error) {
      console.error('Counts error:', error);
      return { type: 'error', data: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
