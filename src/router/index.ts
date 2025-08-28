import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { UsersPage } from '../pages/UsersPage';
import UserDetailPage from '../pages/UserDetailPage.tsx';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

/**
 * Application router setup 
 * 
 * Routes:
 * - / - Users list page
 * - /users/:id - Individual user detail page
 */
export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppLayout,
    ErrorBoundary: ErrorBoundary,
    children: [
      {
        index: true,
        Component: UsersPage,
      },
      {
        path: 'users/:id',
        Component: UserDetailPage,
      }
    ]
  },
]);
