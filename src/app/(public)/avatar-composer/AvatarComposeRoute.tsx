import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';
import AvatarComposer from './AvatarComposer';

const AvatarComposeRoute: FuseRouteItemType = {
  path: 'criar-avatar',
  element: <AvatarComposer />,
  settings: {
    layout: {
      config: {
        navbar: {
          display: false,
        },
        toolbar: {
          display: false,
        },
        footer: {
          display: false,
        },
        leftSidePanel: {
          display: false,
        },
        rightSidePanel: {
          display: false,
        },
      },
    },
  },
  auth: authRoles.onlyGuest, // []
};

export default AvatarComposeRoute;
