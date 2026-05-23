import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';
import ForgotPasswordPage from './ForgotPasswordPage';

const ForgotPasswordPageRoute: FuseRouteItemType = {
  path: 'forgot-password',
  element: <ForgotPasswordPage />,
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

export default ForgotPasswordPageRoute;
