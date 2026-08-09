import { Injectable } from '@nestjs/common';
import type { IssueResponse, ReportType, ResultType } from '@reports/shared';

import { SettingsService } from '../settings/settings.service';
import { ProjectDictService } from './project-dict.service';
import { exportToCsv } from './export-to-csv';
import { getCurrentMonthDates } from './get-current-month-dates';
import { convertToHours } from './convert-to-hours';
import { statusDict } from './constants';
import { buildName } from './build-name';
import { mockReports } from './mock-data';

@Injectable()
export class ReportsService {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly projectDictService: ProjectDictService,
  ) {}

  async getReports(): Promise<ReportType[]> {
    const { gitlabUrl: GITLAB_URL, privateToken: PRIVATE_TOKEN, userId: USER_ID } = await this.settingsService.getSettings();
    const projectDict = await this.projectDictService.getProjectDict();

    if (!GITLAB_URL) {
      return mockReports;
    }

    const filename = buildName();
    const { start, end } = getCurrentMonthDates();
    const fetchConfig = {
      method: 'GET',
      headers: {
        'Private-Token': PRIVATE_TOKEN,
        'Content-Type': 'application/json',
      },
    };
    const closedUrl = `${GITLAB_URL}/issues?assignee_id=${USER_ID}&scope=all&state=closed&updated_after=${start}`;
    const openUrl = `${GITLAB_URL}/issues?assignee_id=${USER_ID}&scope=all&state=opened`;

    let issues: ReportType[] = [];

    try {
      const [closedResponse, openResponse] = await Promise.all([
        fetch(closedUrl, fetchConfig),
        fetch(openUrl, fetchConfig),
      ]);

      if (!closedResponse.ok) {
        throw new Error(`Ошибка HTTP для закрытых задач: ${closedResponse.status}`);
      }

      if (!openResponse.ok) {
        throw new Error(`Ошибка HTTP для открытых задач: ${openResponse.status}`);
      }

      const [closedIssues, openedIssues] = await Promise.all([
        closedResponse.json() as Promise<IssueResponse>,
        openResponse.json() as Promise<IssueResponse>,
      ]);
      const allIssues = [...closedIssues, ...openedIssues];
      const result: ResultType[] = allIssues.map((issue) => ({
        id: issue.id,
        iid: issue.iid,
        title: issue.title,
        project: issue.project_id,
        status: issue.state,
        created: issue.created_at,
        timeStats: issue.time_stats?.human_time_estimate || '0',
      }));

      issues = result.map((x) => {
        const title = x.title.trim();
        const normalizedTitle = title.endsWith('.') ? title : `${title}.`;

        return {
          name: `${x.iid} ${projectDict[x.project] || ''} ${normalizedTitle}`,
          status: statusDict[x.status],
          time: convertToHours(x.timeStats),
        };
      });

      exportToCsv(filename, issues);
    } catch (error) {
      console.error('Ошибка при получении задач:', error);
    }

    return issues;
  }
}
