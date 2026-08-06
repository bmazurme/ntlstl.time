import { Select, Text, Button, Icon } from '@gravity-ui/uikit';
import {
  House, Calendar as CalendarIcon, Gear, Moon, Sun, ChevronsLeft, ChevronsRight, Xmark,
} from '@gravity-ui/icons';
import { Link, useLocation } from 'react-router-dom';
import type { MonthKeyType } from '@reports/shared';

import { years, options } from '../../constants';
import { reportSelector, setReportState } from '../../store';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useTheme } from '../../hooks/use-theme';
import { useSidebarCollapse } from '../../hooks/use-sidebar-collapse';

import style from './sidebar.module.css';

const links = [
  { to: '/', label: 'Report', icon: House },
  { to: '/calendar', label: 'Calendar', icon: CalendarIcon },
  { to: '/settings', label: 'Settings', icon: Gear },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const dispatch = useAppDispatch();
  const state = useAppSelector(reportSelector);
  const { pathname } = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { collapsed, toggleCollapsed } = useSidebarCollapse();
  const theme = isDark ? 'dark' : 'light';

  return (
    <div className={`${style.sidebar} ${collapsed ? style.collapsed : ''}`}>
      <div className={style.workspace}>
        <div className={style.mark}>n</div>
        <div className={`${style.meta} ${collapsed ? style.hidden : ''}`}>
          <Text variant="subheader-2">ntlstl.time</Text>
          <Text variant="caption-2" color="secondary">Time tracking</Text>
        </div>
        {onNavigate && (
          <Button
            view="flat"
            size="m"
            onClick={onNavigate}
            className={style.closeButton}
            title="Закрыть"
          >
            <Icon data={Xmark} size={16} />
          </Button>
        )}
      </div>
      <div className={style.pad}>
        <nav className={style.nav}>
          {links.map(({ to, label, icon }) => (
            <Button
              key={to}
              view={pathname === to ? 'normal' : 'flat'}
              size="l"
              width="max"
              component={Link}
              to={to}
              className={style.navButton}
              title={label}
              onClick={onNavigate}
            >
              <Icon data={icon} size={16} />
              <span className={`${style.label} ${collapsed ? style.hidden : ''}`}>{label}</span>
            </Button>
          ))}
        </nav>
        <div className={`${style.selects} ${collapsed ? style.hidden : ''}`}>
          <Select
            label="Year"
            value={[state.year]}
            className={style.select}
            onUpdate={([t]) => dispatch(setReportState({ ...state, year: t as MonthKeyType }))}
            options={years}
          />
          <Select
            label="Month"
            value={[state.month]}
            className={style.select}
            onUpdate={([t]) => dispatch(setReportState({ ...state, month: t as MonthKeyType }))}
            options={options}
          />
        </div>
      </div>
      <div className={style.footer}>
        <Button
          view="flat"
          size="l"
          width="max"
          onClick={toggleTheme}
          className={style.navButton}
          title={theme === 'light' ? 'Тёмная' : 'Светлая'}
        >
          <Icon data={theme === 'light' ? Moon : Sun} size={16} />
          <span className={`${style.label} ${collapsed ? style.hidden : ''}`}>
            {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
          </span>
        </Button>
      </div>
      <div className={style.collapseBar}>
        <Button
          view="flat"
          size="l"
          width="max"
          onClick={toggleCollapsed}
          className={style.navButton}
          title={collapsed ? 'Развернуть' : 'Свернуть'}
        >
          <Icon data={collapsed ? ChevronsRight : ChevronsLeft} size={16} />
          <span className={`${style.label} ${collapsed ? style.hidden : ''}`}>Свернуть</span>
        </Button>
      </div>
    </div>
  )
}

export default Sidebar;
