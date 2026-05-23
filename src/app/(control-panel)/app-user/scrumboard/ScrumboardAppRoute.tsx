import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';

const ScrumboardApp = lazy(() => import('./ScrumboardApp'));
const Board = lazy(() => import('./board/Board'));

/**
 * The Scrumboard App Route
 */
const ScrumboardAppRoute: FuseRouteItemType = {
  path: 'scrumboard',
  element: <ScrumboardApp />,
  children: [
    {
      path: '',
      element: <Board />,
    },
  ],
  auth: authRoles.collaborator,
};

export default ScrumboardAppRoute;
