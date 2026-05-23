import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';

const ClientsScrumboardApp = lazy(() => import('./ClientsScrumboardApp'));
const Board = lazy(() => import('./board/Board'));
/**
 * The Clients Scrumboard App Route
 */
const ClientsScrumboardAppRoute: FuseRouteItemType = {
  path: 'clients-scrumboard',
  element: <ClientsScrumboardApp />,
  children: [
    {
      path: '',
      element: <Board />,
    },
  ],
  auth: authRoles.collaborator,
};

export default ClientsScrumboardAppRoute;
