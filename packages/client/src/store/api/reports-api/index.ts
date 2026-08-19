import { createApi, retry } from '@reduxjs/toolkit/query/react';
import type { DateType, ProjectDictType, ReportType, SettingsType, StreamEvent } from '@reports/shared';

import baseQuery from '../../base-query';

export const baseQueryWithRetry = retry(baseQuery, { maxRetries: 0 });

const reportsApi = createApi({
  reducerPath: 'reportsApi',
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Counts', 'Reports', 'Settings', 'ProjectDict'],
  endpoints: (builder) => ({
    getCounts: builder.query<DateType, string>({
      query: (year) => `counts/${year}`,
      transformResponse: (response: StreamEvent) => response.data as DateType,
      providesTags: ['Counts'],
    }),
    getReports: builder.query<ReportType[], void>({
      query: () => 'reports',
      transformResponse: (response: StreamEvent) => response.data as ReportType[],
      providesTags: ['Reports'],
    }),
    addOffDays: builder.mutation<DateType, { year: string; dates: string[] }>({
      query: ({ year, dates }) => ({
        url: `counts/${year}/off-days`,
        method: 'POST',
        body: { dates },
      }),
      transformResponse: (response: StreamEvent) => response.data as DateType,
      invalidatesTags: ['Counts'],
    }),
    removeOffDay: builder.mutation<DateType, { year: string; date: string }>({
      query: ({ year, date }) => ({
        url: `counts/${year}/off-days/${date}`,
        method: 'DELETE',
      }),
      transformResponse: (response: StreamEvent) => response.data as DateType,
      invalidatesTags: ['Counts'],
    }),
    importDayOffs: builder.mutation<DateType, string>({
      query: (year) => ({
        url: `counts/${year}/import-day-offs`,
        method: 'POST',
      }),
      transformResponse: (response: StreamEvent) => {
        if (response.type === 'error') {
          throw new Error(typeof response.data === 'string' ? response.data : 'Import failed');
        }

        return response.data as DateType;
      },
      invalidatesTags: ['Counts'],
    }),
    getSettings: builder.query<SettingsType, void>({
      query: () => 'settings',
      transformResponse: (response: StreamEvent) => response.data as SettingsType,
      providesTags: ['Settings'],
    }),
    setSettings: builder.mutation<SettingsType, SettingsType>({
      query: (settings) => ({
        url: 'settings',
        method: 'POST',
        body: settings,
      }),
      transformResponse: (response: StreamEvent) => response.data as SettingsType,
      invalidatesTags: ['Settings'],
    }),
    getProjectDict: builder.query<ProjectDictType, void>({
      query: () => 'project-dict',
      transformResponse: (response: StreamEvent) => response.data as ProjectDictType,
      providesTags: ['ProjectDict'],
    }),
    addProjectCode: builder.mutation<ProjectDictType, { code: string; label: string }>({
      query: (body) => ({
        url: 'project-dict',
        method: 'POST',
        body,
      }),
      transformResponse: (response: StreamEvent) => response.data as ProjectDictType,
      invalidatesTags: ['ProjectDict'],
    }),
    removeProjectCode: builder.mutation<ProjectDictType, { code: string }>({
      query: ({ code }) => ({
        url: `project-dict/${code}`,
        method: 'DELETE',
      }),
      transformResponse: (response: StreamEvent) => response.data as ProjectDictType,
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
  useGetSettingsQuery,
  useSetSettingsMutation,
  useGetProjectDictQuery,
  useAddProjectCodeMutation,
  useRemoveProjectCodeMutation,
} = reportsApi;
export default reportsApi;
