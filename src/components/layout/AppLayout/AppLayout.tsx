import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { NotificationBell } from '../../ui/NotificationBell';
import { Header, HeaderActions } from '../Header';
import { ARIA_LABELS } from '../../../constants/accessibility';
import './AppLayout.scss';

export const AppLayout = () => {
  return (
    <div className="app-layout">
      {/* Skip Navigation Link */}
      <a href="#main-content" className="app-layout__skip-link">
        {ARIA_LABELS.SKIP_TO_CONTENT}
      </a>
      
      <Header 
        actions={<HeaderActions />}
        notifications={<NotificationBell />}
      />
      
      <main 
        id="main-content" 
        className="app-layout__content" 
        role="main"
        tabIndex={-1}
        aria-label={ARIA_LABELS.MAIN_CONTENT}
      >
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};
