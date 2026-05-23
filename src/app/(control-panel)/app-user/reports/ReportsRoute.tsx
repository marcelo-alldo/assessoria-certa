import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';

const Reports = lazy(() => import('./Reports'));

/**
 * The Reports page route.
 */
const ReportsRoute: FuseRouteItemType = {
  path: 'reports',
  element: <Reports />,
  auth: authRoles.collaborator,
};

export default ReportsRoute;
