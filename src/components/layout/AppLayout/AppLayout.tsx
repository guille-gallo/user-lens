import { Suspense, createContext, useContext, useState, useCallback } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { NotificationBell } from '../../ui/NotificationBell';
import { ARIA_LABELS } from '../../../constants/accessibility';
import './AppLayout.scss';

interface HeaderContextType {
  setHeaderActions: (actions: React.ReactNode) => void;
  clearHeaderActions: () => void;
}

const HeaderContext = createContext<HeaderContextType | null>(null);

export const useHeaderActions = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeaderActions must be used within AppLayout');
  }
  return context;
};

export const AppLayout = () => {
  const location = useLocation();
  const [headerActions, setHeaderActionsState] = useState<React.ReactNode>(null);
  
  // Hide notification bell on notifications page to avoid circular navigation
  const showNotificationBell = location.pathname !== '/notifications';

  const setHeaderActions = useCallback((actions: React.ReactNode) => {
    setHeaderActionsState(actions);
  }, []);

  const clearHeaderActions = useCallback(() => {
    setHeaderActionsState(null);
  }, []);

  return (
    <HeaderContext.Provider value={{ setHeaderActions, clearHeaderActions }}>
      <div className="app-layout">
        {/* Skip Navigation Link */}
        <a href="#main-content" className="app-layout__skip-link">
          {ARIA_LABELS.SKIP_TO_CONTENT}
        </a>
        
        <header className="app-layout__header" role="banner">
          <div className="app-layout__header-content">
            <h1 className="app-layout__title">
              <Link 
                to="/" 
                className="app-layout__title-link"
                aria-label={ARIA_LABELS.HOME_NAVIGATION}
              >
                User Lens
              </Link>
            </h1>
            <nav className="app-layout__header-actions" role="navigation" aria-label={ARIA_LABELS.PRIMARY_NAVIGATION}>
              {headerActions}
              {showNotificationBell && <NotificationBell />}
            </nav>
          </div>
        </header>
        
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
    </HeaderContext.Provider>
  );
};
