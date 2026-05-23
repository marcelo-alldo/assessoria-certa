import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';
import { Navigate } from 'react-router';
import Dashboard from './Dashboard';
import Origins from './origins/Origins';

/**
 * The Marketing page route.
 */
const MarketingRoute: FuseRouteItemType = {
  path: 'marketing',
  children: [
    {
      path: '',
      element: <Navigate to="dashboard" />,
    },
    {
      path: 'dashboard',
      element: <Dashboard />,
    },
    {
      path: 'origins',
      element: <Origins />,
    },
  ],
  auth: authRoles.collaborator,
};

export default MarketingRoute;
