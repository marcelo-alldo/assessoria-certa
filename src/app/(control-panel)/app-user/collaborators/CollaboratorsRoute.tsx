import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';
import Collaborator from './Collaborator/Collaborator';

const Collaborators = lazy(() => import('./Collaborators'));

/**
 * The Collaborators page route.
 */
const CollaboratorsRoute: FuseRouteItemType = {
  path: '',
  children: [
    {
      path: 'collaborators',
      children: [
        {
          path: '',
          element: <Collaborators />,
        },
        {
          path: ':uid',
          element: <Collaborator />,
        },
      ],
    },
  ],
  auth: authRoles.user,
};

export default CollaboratorsRoute;
