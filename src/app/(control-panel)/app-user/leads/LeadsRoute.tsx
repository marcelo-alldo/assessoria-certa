import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';
import Lead from './Lead/Lead';

const Leads = lazy(() => import('./Leads'));

/**
 * The Leads page route.
 */
const LeadsRoute: FuseRouteItemType = {
  path: '',
  children: [
    {
      path: 'leads',
      children: [
        {
          path: '',
          element: <Leads />,
        },
        {
          path: ':uid',
          element: <Lead />,
        },
      ],
    },
  ],
  auth: authRoles.collaborator,
};

export default LeadsRoute;
