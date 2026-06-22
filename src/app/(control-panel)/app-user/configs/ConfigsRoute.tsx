import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';
import { Navigate } from 'react-router';
import About from './about/About';
import Products from './products/Products';
import Keys from './keys/Keys';
import Status from './status/Status';
import Whatsapp from './whatsapp/Whatsapp';
import Testing from './testing/Testing';
import Pauta from './pauta/Pauta';

/**
 * The Configs page route.
 */
const ConfigsRoute: FuseRouteItemType = {
  path: 'configs',
  children: [
    {
      path: '',
      element: <Navigate to="configs" />,
    },
    {
      path: 'status',
      element: <Status />,
    },
    {
      path: 'keys',
      element: <Keys />,
    },
    {
      path: 'whatsapp',
      element: <Whatsapp />,
    },
    {
      path: 'products',
      element: <Products />,
    },
    {
      path: 'about',
      element: <About />,
    },
    {
      path: 'pauta',
      element: <Pauta />,
    },
    {
      path: 'testing',
      element: <Testing />,
    },
  ],
  auth: authRoles.user,
};

export default ConfigsRoute;
