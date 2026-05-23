import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';
import RecoveryPasswordPage from './RecoveryPasswordPage';

const RecoveryPasswordPageRoute: FuseRouteItemType = {
  path: 'recovery-password/:token',
  element: <RecoveryPasswordPage />,
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

export default RecoveryPasswordPageRoute;
