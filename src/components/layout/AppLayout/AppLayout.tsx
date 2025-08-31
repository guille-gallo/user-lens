import { Suspense, createContext, useContext, useState, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { NotificationBell } from '../../ui/NotificationBell';
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
        {showNotificationBell && (
          <header className="app-layout__header">
            <div className="app-layout__header-content">
              <h1 className="app-layout__title">User Lens</h1>
              <div className="app-layout__header-actions">
                {headerActions}
                <NotificationBell />
              </div>
            </div>
          </header>
        )}
        
        <main className="app-layout__content">
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </HeaderContext.Provider>
  );
};
