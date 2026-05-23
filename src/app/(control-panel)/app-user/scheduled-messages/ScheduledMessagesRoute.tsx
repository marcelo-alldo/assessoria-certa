import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';
import ScheduledMessage from './scheduled-message/ScheduledMessage';
import ReportScheduledMessage from './report-schedule-message/ReportScheduleMessage';

const ScheduledMessages = lazy(() => import('./ScheduledMessages'));

const ScheduledMessagesRoute: FuseRouteItemType = {
  path: '',
  children: [
    {
      path: 'scheduled-messages',
      children: [
        {
          path: '',
          element: <ScheduledMessages />,
        },
        {
          path: ':uid',
          element: <ScheduledMessage />,
        },
        {
          path: ':uid/report',
          element: <ReportScheduledMessage />,
        },
      ],
    },
  ],
  auth: authRoles.collaborator,
};

export default ScheduledMessagesRoute;
