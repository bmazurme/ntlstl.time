export type StreamEventType =
  | 'message'
  | 'done'
  | 'error';

export interface StreamEvent {
  type: StreamEventType;
  data?: any;
}

export type KeyType = 'allDays' | 'holidays' | 'weekends' | 'offDays' | 'shortDays' | 'workDays' | 'hours';
export type MonthType = {
  allDays: number;
  holidays: number;
  weekends: number;
  offDays: number;
  shortDays: number;
  workDays: number;
  hours: number;
}

export type MonthKeyType = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';

export type DateType = {
  calendar: Record<MonthKeyType, MonthType>;
  holidays: string[];
  shortDays: string[];
  badDays: string[];
  offDays: string[];
}
export type ReportType = {
  name: string;
  status: string;
  time: number;
};

export type SettingsType = {
  gitlabUrl: string;
  privateToken: string;
  userId: string;
  employee: string;
  company: string;
  bridgeApiUrl: string;
  bridgeApiKey: string;
};

export type DayOffsImportType = {
  year: number;
  holidays: string[];
  shortDays: string[];
  offDays: string[];
  badDays: string[];
};

export type ProjectDictType = Record<string, string>;

export type UserType = {
  id: number;
  username: string;
}


export type ResType = {
  id: string;
  iid: string;
  title: string;
  project_id: number;
  state: string;
  created_at: string;
  time_stats?: {
    human_time_estimate: string;
  },
}

export type IssueResponse = ResType[];

export type ResultType = {
  id: string;
  iid: string;
  title: string;
  project: number;
  status: string;
  created: string;
  timeStats: string;
}
