import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './styles/globals.scss';

/**
 * Main App component
 */
function App() {
  return <RouterProvider router={router} />;
}

export default App;
