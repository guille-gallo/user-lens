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
        {/* Skip Navigation Link */}
        <a href="#main-content" className="app-layout__skip-link">
          Skip to main content
        </a>
        
        {showNotificationBell && (
          <header className="app-layout__header" role="banner">
            <div className="app-layout__header-content">
              <h1 className="app-layout__title">User Lens</h1>
              <nav className="app-layout__header-actions" role="navigation" aria-label="Primary navigation">
                {headerActions}
                <NotificationBell />
              </nav>
            </div>
          </header>
        )}
        
        <main 
          id="main-content" 
          className="app-layout__content" 
          role="main"
          tabIndex={-1}
        >
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </HeaderContext.Provider>
  );
};
