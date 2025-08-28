import { createBrowserRouter } from 'react-router-dom';
import { UsersPage } from '../pages/UsersPage';

/**
 * application router setup 
 * 
 * Routes:
 * - / - Users list page
 */
export const router = createBrowserRouter([
  {
    path: '/',
    Component: UsersPage,
  },
]);
