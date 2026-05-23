import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';
import User from './user/User';

const Users = lazy(() => import('./Users'));

/**
 * The Users page route.
 */
const UsersRoute: FuseRouteItemType = {
  path: 'admin',
  children: [
    {
      path: 'users',
      children: [
        {
          path: '',
          element: <Users />,
        },
        {
          path: ':uid',
          element: <User />,
        },
      ],
    },
  ],
  auth: authRoles.admin,
};

export default UsersRoute;
