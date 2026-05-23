import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';
import TermsPrivacy from './TermsPrivacy';

/**
 * The Clients page route.
 */
const TermsPrivacyRoute: FuseRouteItemType = {
  path: '/terms-privacy',
  element: <TermsPrivacy />,
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
  auth: authRoles.onlyGuest,
};

export default TermsPrivacyRoute;
