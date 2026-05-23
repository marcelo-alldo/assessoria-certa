import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';
import ConfirmAccountPage from './ConfirmAccountPage';

const ConfirmAccountPageRoute: FuseRouteItemType = {
  path: 'confirm-account/:token',
  element: <ConfirmAccountPage />,
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

export default ConfirmAccountPageRoute;
