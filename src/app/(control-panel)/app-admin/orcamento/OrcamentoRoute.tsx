import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';

const Orcamento = lazy(() => import('./OrcamentoPage'));

/**
 * The Orcamento page route.
 */
const OrcamentoRoute: FuseRouteItemType = {
  path: 'admin/orcamento',
  element: <Orcamento />,
  auth: authRoles.admin,
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
};

export default OrcamentoRoute;
