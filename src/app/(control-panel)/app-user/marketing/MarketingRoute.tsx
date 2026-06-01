import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';
import { Navigate } from 'react-router';
import Dashboard from './Dashboard';
import Origins from './origins/Origins';
import Avatar from './avatar/Avatar';

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
    {
      path: 'avatar',
      element: <Avatar />,
    },
  ],
  auth: authRoles.collaborator,
};

export default MarketingRoute;
