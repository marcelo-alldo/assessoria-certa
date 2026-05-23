import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';

const Flows = lazy(() => import('./Flows'));

/**
 * The Flows page route.
 */
const FlowsRoute: FuseRouteItemType = {
  path: 'flows',
  element: <Flows />,
  auth: authRoles.user,
};

export default FlowsRoute;
