import { useEffect, useState, type ReactNode } from 'react';
import { Button, Icon } from '@gravity-ui/uikit';
import { Bars } from '@gravity-ui/icons';

import Sidebar from '../sidebar';

import style from './content.module.css';

type ContentProps = {
  sidebar: boolean;
  main?: ReactNode;
}

function Content({ sidebar, main }: ContentProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  return (
    <div className={style.content}>
      {sidebar && (
        <>
          <div className={style.mobileTopbar}>
            <Button
              view="flat"
              size="l"
              onClick={() => setMobileNavOpen(true)}
              title="Меню"
            >
              <Icon data={Bars} size={18} />
            </Button>
          </div>
          {mobileNavOpen && (
            <div
              className={style.backdrop}
              onClick={() => setMobileNavOpen(false)}
            />
          )}
          <aside className={`${style.sidebar} ${mobileNavOpen ? style.sidebarOpen : ''}`}>
            <Sidebar onNavigate={() => setMobileNavOpen(false)} />
          </aside>
        </>
      )}
      <div className={style.right}>
        <div className={style.body}>
          {main && <main className={style.main}>{main}</main>}
        </div>
      </div>
    </div>
  )
}

export default Content;
