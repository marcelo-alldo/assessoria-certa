import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';

const Chats = lazy(() => import('./Chats'));

/**
 * The Chats page route.
 */
const ChatsRoute: FuseRouteItemType = {
  path: 'chats',
  children: [
    {
      path: '',
      element: <Chats />,
    },
    {
      path: ':remoteJid',
      element: <Chats />,
    },
  ],
  auth: authRoles.collaborator,
};

export default ChatsRoute;
