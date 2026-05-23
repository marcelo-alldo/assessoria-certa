import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';

const MessageTemplates = lazy(() => import('./MessageTemplates'));
const MessageTemplate = lazy(() => import('./message-template/MessageTemplate'));

const MessageTemplatesRoute: FuseRouteItemType = {
  path: '',
  children: [
    {
      path: 'message-templates',
      children: [
        {
          path: '',
          element: <MessageTemplates />,
        },
        {
          path: ':uid',
          element: <MessageTemplate />,
        },
      ],
    },
  ],
  auth: authRoles.collaborator,
};

export default MessageTemplatesRoute;
