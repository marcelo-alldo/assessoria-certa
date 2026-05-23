import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';

import GenerateKeyOffline from './GenerateKeyOffline';

/**
 * The Users page route.
 */
const GenerateKeyOfflineRoute: FuseRouteItemType = {
  path: 'admin',
  children: [
    {
      path: 'generate-key-offline',
      children: [
        {
          path: '',
          element: <GenerateKeyOffline />,
        },
      ],
    },
  ],
  auth: authRoles.admin,
};

export default GenerateKeyOfflineRoute;
