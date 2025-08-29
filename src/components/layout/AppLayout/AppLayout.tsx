import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import './AppLayout.scss';

export const AppLayout: React.FC = () => {
  return (
    <div className="app-layout">
      <main className="app-layout__content">
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};
