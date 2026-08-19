import { useState } from 'react';
import { Text, Button } from '@gravity-ui/uikit';
import type { MonthKeyType } from '@reports/shared';

import { columns } from '../../constants';
import MyTable, { RowData } from '../../hocs/with-table-sorting';
import { reportSelector, settingsSelector } from '../../store';
import { useGetCountsQuery, useGetReportsQuery, usePushReportToBridgeMutation } from '../../store/api';
import { useAppSelector } from '../../hooks';
import { exportReport } from '../../utils/export-report';

import style from '../../app.module.css';
import reportStyle from './report.module.css';

function Report({ report, offDays }: { report: RowData[]; offDays: number }) {
  const { month, year } = useAppSelector(reportSelector);
  const { employee, company } = useAppSelector(settingsSelector);
  const { refetch: refetchCounts } = useGetCountsQuery(year);
  const { refetch: refetchReports } = useGetReportsQuery();
  const [pushReportToBridge, { isLoading: isPushing }] = usePushReportToBridgeMutation();
  const [pushStatus, setPushStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const entriesToSend = report
    .filter((item) => item.time > 0)
    .map((item) => ({ taskName: item.name, status: item.status, hours: item.time }));

  const handleExport = () => {
    exportReport({
      report,
      month: month as MonthKeyType,
      year,
      employee,
      company,
      offDays,
    });
  };

  const handleRefresh = () => {
    refetchCounts();
    refetchReports();
  };

  const handlePush = async () => {
    setPushStatus(null);

    try {
      await pushReportToBridge({
        year: Number(year),
        month: Number(month),
        entries: entriesToSend,
      }).unwrap();

      setPushStatus({ type: 'success', message: 'Отчёт отправлен в bridge' });
    } catch (error) {
      const message = error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string'
        ? (error as { message: string }).message
        : 'Не удалось отправить отчёт';

      setPushStatus({ type: 'error', message });
    }
  };

  return (
    <div className={style.report}>
      <div className={reportStyle.header}>
        <Text variant="header-2">Report</Text>
        <div className={reportStyle.actions}>
          <Button view="normal" size="m" onClick={handleRefresh}>
            Refresh data
          </Button>
          <Button view="normal" size="m" onClick={handleExport}>
            Export
          </Button>
          <Button
            view="action"
            size="m"
            onClick={handlePush}
            loading={isPushing}
            disabled={entriesToSend.length === 0}
            title={entriesToSend.length === 0 ? 'Нет задач с затраченным временем' : undefined}
          >
            Send
          </Button>
        </div>
      </div>
      {pushStatus && (
        <Text
          variant="body-2"
          color={pushStatus.type === 'error' ? 'danger' : 'positive'}
          className={reportStyle.pushStatus}
        >
          {pushStatus.message}
        </Text>
      )}
      <div className={reportStyle.card}>
        <MyTable
          data={report}
          columns={columns}
          width="max"
          verticalAlign="middle"
          edgePadding
        />
      </div>
    </div>
  )
}

export default Report;
