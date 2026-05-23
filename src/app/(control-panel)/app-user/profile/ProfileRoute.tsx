import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';

const Profile = lazy(() => import('./Profile'));

/**
 * The Profile page route.
 */
const ProfileRoute: FuseRouteItemType = {
  path: 'profile',
  element: <Profile />,
  auth: authRoles.collaborator,
};

export default ProfileRoute;
