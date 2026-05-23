import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';
import Client from './client/Client';

const Clients = lazy(() => import('./Clients'));

/**
 * The Clients page route.
 */
const ClientsRoute: FuseRouteItemType = {
  path: '',
  children: [
    {
      path: 'clients',
      children: [
        {
          path: '',
          element: <Clients />,
        },
        {
          path: ':uid',
          element: <Client />,
        },
      ],
    },
  ],
  auth: authRoles.collaborator,
};

export default ClientsRoute;
