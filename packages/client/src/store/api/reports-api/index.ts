import { createApi, retry } from '@reduxjs/toolkit/query/react';
import type { DateType, ProjectDictType, PushReportPayload, ReportType, SettingsType, StreamEvent } from '@reports/shared';

import baseQuery from '../../base-query';

export const baseQueryWithRetry = retry(baseQuery, { maxRetries: 0 });

/**
 * The API answers with HTTP 200 even for failures, marking them via `type: 'error'`.
 * Throwing here turns them into regular RTK Query errors so the UI can show them.
 */
const unwrap = <T>(fallbackMessage: string) => (response: StreamEvent): T => {
  if (response?.type === 'error') {
    throw new Error(typeof response.data === 'string' ? response.data : fallbackMessage);
  }

  return response?.data as T;
};

const reportsApi = createApi({
  reducerPath: 'reportsApi',
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Counts', 'Reports', 'Settings', 'ProjectDict'],
  endpoints: (builder) => ({
    getCounts: builder.query<DateType, string>({
      query: (year) => `counts/${year}`,
      transformResponse: unwrap<DateType>('Не удалось загрузить производственный календарь'),
      providesTags: ['Counts'],
    }),
    getReports: builder.query<ReportType[], void>({
      query: () => 'reports',
      transformResponse: unwrap<ReportType[]>('Не удалось загрузить задачи из GitLab'),
      providesTags: ['Reports'],
    }),
    addOffDays: builder.mutation<DateType, { year: string; dates: string[] }>({
      query: ({ year, dates }) => ({
        url: `counts/${year}/off-days`,
        method: 'POST',
        body: { dates },
      }),
      transformResponse: unwrap<DateType>('Не удалось добавить отгулы'),
      invalidatesTags: ['Counts'],
    }),
    removeOffDay: builder.mutation<DateType, { year: string; date: string }>({
      query: ({ year, date }) => ({
        url: `counts/${year}/off-days/${date}`,
        method: 'DELETE',
      }),
      transformResponse: unwrap<DateType>('Не удалось удалить отгул'),
      invalidatesTags: ['Counts'],
    }),
    importDayOffs: builder.mutation<DateType, string>({
      query: (year) => ({
        url: `counts/${year}/import-day-offs`,
        method: 'POST',
      }),
      transformResponse: unwrap<DateType>('Не удалось импортировать данные'),
      invalidatesTags: ['Counts'],
    }),
    pushReportToBridge: builder.mutation<unknown, PushReportPayload>({
      query: (payload) => ({
        url: 'reports/push-to-bridge',
        method: 'POST',
        body: payload,
      }),
      transformResponse: unwrap<unknown>('Не удалось отправить отчёт'),
    }),
    getSettings: builder.query<SettingsType, void>({
      query: () => 'settings',
      transformResponse: unwrap<SettingsType>('Не удалось загрузить настройки'),
      providesTags: ['Settings'],
    }),
    setSettings: builder.mutation<SettingsType, SettingsType>({
      query: (settings) => ({
        url: 'settings',
        method: 'POST',
        body: settings,
      }),
      transformResponse: unwrap<SettingsType>('Не удалось сохранить настройки'),
      invalidatesTags: ['Settings'],
    }),
    getProjectDict: builder.query<ProjectDictType, void>({
      query: () => 'project-dict',
      transformResponse: unwrap<ProjectDictType>('Не удалось загрузить коды проектов'),
      providesTags: ['ProjectDict'],
    }),
    addProjectCode: builder.mutation<ProjectDictType, { code: string; label: string }>({
      query: (body) => ({
        url: 'project-dict',
        method: 'POST',
        body,
      }),
      transformResponse: unwrap<ProjectDictType>('Не удалось добавить код проекта'),
      invalidatesTags: ['ProjectDict'],
    }),
    removeProjectCode: builder.mutation<ProjectDictType, { code: string }>({
      query: ({ code }) => ({
        url: `project-dict/${code}`,
        method: 'DELETE',
      }),
      transformResponse: unwrap<ProjectDictType>('Не удалось удалить код проекта'),
      invalidatesTags: ['ProjectDict'],
    }),
  }),
});

export const {
  useGetCountsQuery,
  useGetReportsQuery,
  useAddOffDaysMutation,
  useRemoveOffDayMutation,
  useImportDayOffsMutation,
  usePushReportToBridgeMutation,
  useGetSettingsQuery,
  useSetSettingsMutation,
  useGetProjectDictQuery,
  useAddProjectCodeMutation,
  useRemoveProjectCodeMutation,
} = reportsApi;
export default reportsApi;
