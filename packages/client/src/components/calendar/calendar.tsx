
import { useMemo, useState } from 'react';

import {
  Button, Dialog, DialogHeader, DialogBody, DialogFooter, Text, Icon,
  TabProvider, TabList, Tab, TabPanel,
} from '@gravity-ui/uikit';
import { Plus, TrashBin, CalendarXmark, ArrowDownToLine } from '@gravity-ui/icons';
import { RangeDatePicker, type RangeValue } from '@gravity-ui/date-components';
import { DateTime, dateTimeParse } from '@gravity-ui/date-utils';
import { DateType } from '@reports/shared';

import { useAddOffDaysMutation, useRemoveOffDayMutation, useImportDayOffsMutation } from '../../store/api';

import CalendarMonth from './calendar-month';
import style from './calendar.module.css';

const TABS = {
  calendar: 'calendar',
  dayOff: 'day-off',
} as const;

const monthTitleFormatter = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const weekdayFormatter = new Intl.DateTimeFormat('ru-RU', { weekday: 'short', timeZone: 'UTC' });

const formatMonthTitle = (monthKey: string) => {
  const [y, m] = monthKey.split('-').map(Number);
  const label = monthTitleFormatter.format(new Date(Date.UTC(y, m - 1, 1)));

  return label.charAt(0).toUpperCase() + label.slice(1);
};

const formatWeekday = (date: string) => {
  const label = weekdayFormatter.format(new Date(`${date}T00:00:00Z`));

  return label.charAt(0).toUpperCase() + label.slice(1);
};

const groupByMonth = (dates: string[]) => {
  const groups = new Map<string, string[]>();

  [...dates].sort().forEach((date) => {
    const monthKey = date.slice(0, 7);
    const group = groups.get(monthKey) ?? [];

    group.push(date);
    groups.set(monthKey, group);
  });

  return [...groups.entries()];
};

function MyCalendar({ data, year }: { data: DateType; year: string }) {
  const [addOffDays] = useAddOffDaysMutation();
  const [removeOffDay] = useRemoveOffDayMutation();
  const [importDayOffsRequest, { isLoading: isImporting }] = useImportDayOffsMutation();
  const [activeTab, setActiveTab] = useState<string>(TABS.calendar);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<RangeValue<DateTime> | null>(null);
  const [dayToRemove, setDayToRemove] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const offDays = data.offDays;
  const groupedOffDays = useMemo(() => groupByMonth(offDays), [offDays]);

  const getLastDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };
  const isWeekendOrHoliday = ((t: DateTime) => {
    const y = t.year();
    const m = t.month();
    const d = t.date();
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayOfWeek = new Date(Date.UTC(y, m, d)).getUTCDay();

    if (!data) {
      return false;
    }

    if (offDays.includes(dateStr)) {
      return true;
    }

    if ((dayOfWeek === 0 || dayOfWeek === 6) && !data.badDays.includes(dateStr)) {
      return true;
    }

    return data.holidays.includes(dateStr);
  });

  const handleAddDayOff = () => {
    if (selectedRange?.start && selectedRange?.end) {
      const dates: string[] = [];
      let current = selectedRange.start;

      while (!current.startOf('day').isAfter(selectedRange.end.startOf('day'))) {
        dates.push(`${current.year()}-${String(current.month() + 1).padStart(2, '0')}-${String(current.date()).padStart(2, '0')}`);
        current = current.add(1, 'day');
      }

      addOffDays({ year, dates });
    }

    setIsDialogOpen(false);
    setSelectedRange(null);
  };

  const handleRemoveOffDay = () => {
    if (dayToRemove) {
      removeOffDay({ year, date: dayToRemove });
    }

    setDayToRemove(null);
  };

  const handleImport = async () => {
    setImportStatus(null);

    try {
      await importDayOffsRequest(year).unwrap();
      setImportStatus({ type: 'success', message: 'Данные импортированы из bridge' });
    } catch (error) {
      const message = error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string'
        ? (error as { message: string }).message
        : 'Не удалось импортировать данные';

      setImportStatus({ type: 'error', message });
    }
  };

  return <div className={style.page}>
    <div className={style.header}>
      <Text variant="header-2">Calendar</Text>
    </div>
    <TabProvider value={activeTab} onUpdate={setActiveTab}>
      <TabList className={style.tabs}>
        <Tab value={TABS.calendar}>Calendar</Tab>
        <Tab value={TABS.dayOff} counter={offDays.length}>Day off</Tab>
      </TabList>
      <TabPanel value={TABS.calendar} className={style.main}>
        <div className={style.grid}>
          {Object.keys(data.calendar).map((month) => {
            const monthNum = Number(month);
            const minDate = dateTimeParse(new Date(`${year}-${monthNum}-01`))!;
            const maxDate = dateTimeParse(new Date(`${year}-${monthNum}-${getLastDayOfMonth(Number(year), monthNum)}`))!;

            return (
              <CalendarMonth
                key={month}
                minDate={minDate}
                maxDate={maxDate}
                isWeekendOrHoliday={isWeekendOrHoliday}
                shortDays={data.shortDays}
                holidays={data.holidays}
                offDays={offDays}
                year={year}
                month={monthNum}
                lastDay={getLastDayOfMonth(Number(year), monthNum)}
              />
            )
          })}
        </div>
        <div className={style.legend}>
          <div className={style.legendItem}>
            <span className={`${style.legendColor} ${style.shortDay}`} />
            Короткий день
          </div>
          <div className={style.legendItem}>
            <span className={`${style.legendColor} ${style.holiday}`} />
            Праздник
          </div>
          <div className={style.legendItem}>
            <span className={`${style.legendColor} ${style.offDay}`} />
            Отпуск/отгул/больничный
          </div>
        </div>
      </TabPanel>
      <TabPanel value={TABS.dayOff} className={style.side}>
        <div className={style.addRow}>
          <Button view="action" size="m" onClick={() => setIsDialogOpen(true)}>
            <Icon data={Plus} size={16} />
            Add day off
          </Button>
          <Button view="normal" size="m" onClick={handleImport} loading={isImporting}>
            <Icon data={ArrowDownToLine} size={16} />
            Import
          </Button>
          <Text variant="body-2" color="secondary">
            Всего: {offDays.length}
          </Text>
        </div>
        {importStatus && (
          <Text
            variant="body-2"
            color={importStatus.type === 'error' ? 'danger' : 'positive'}
            className={style.importStatus}
          >
            {importStatus.message}
          </Text>
        )}
        {offDays.length === 0 ? (
          <div className={style.emptyState}>
            <Icon data={CalendarXmark} size={28} />
            <Text variant="body-2" color="secondary">Отгулов пока нет</Text>
          </div>
        ) : (
          groupedOffDays.map(([monthKey, dates]) => (
            <div key={monthKey} className={style.monthGroup}>
              <Text variant="subheader-1" className={style.monthGroupTitle}>
                {formatMonthTitle(monthKey)}
              </Text>
              <div className={style.offDaysList}>
                {dates.map((date) => (
                  <div key={date} className={style.offDaysItem}>
                    <div className={style.offDaysItemDate}>
                      <span className={style.offDaysDay}>{Number(date.slice(-2))}</span>
                      <div className={style.offDaysDateText}>
                        <Text variant="body-2">{formatWeekday(date)}</Text>
                        <Text variant="caption-2" color="secondary">{date}</Text>
                      </div>
                    </div>
                    <Button
                      view="flat"
                      size="s"
                      onClick={() => setDayToRemove(date)}
                      title="Удалить"
                    >
                      <Icon data={TrashBin} size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </TabPanel>
    </TabProvider>
    <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
      <DialogHeader caption="Add day off" />
      <DialogBody>
        <RangeDatePicker value={selectedRange} onUpdate={setSelectedRange} />
      </DialogBody>
      <DialogFooter
        onClickButtonCancel={() => setIsDialogOpen(false)}
        onClickButtonApply={handleAddDayOff}
        textButtonApply="Add"
        textButtonCancel="Cancel"
        propsButtonApply={{ disabled: !selectedRange?.start || !selectedRange?.end }}
      />
    </Dialog>
    <Dialog open={!!dayToRemove} onClose={() => setDayToRemove(null)}>
      <DialogHeader caption="Remove day off" />
      <DialogBody>
        Удалить {dayToRemove} из дополнительных выходных?
      </DialogBody>
      <DialogFooter
        onClickButtonCancel={() => setDayToRemove(null)}
        onClickButtonApply={handleRemoveOffDay}
        textButtonApply="Remove"
        textButtonCancel="Cancel"
      />
    </Dialog>
  </div>
}

export default MyCalendar;
