import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';

const Subscriptions = lazy(() => import('./Subscriptions'));
const Subscription = lazy(() => import('./subscription/Subscription'));

/**
 * The Subscriptions page route.
 */
const SubscriptionsRoute: FuseRouteItemType = {
  path: '',
  children: [
    {
      path: 'subscriptions',
      children: [
        {
          path: '',
          element: <Subscriptions />,
        },
        {
          path: ':subscriptionUid',
          element: <Subscription />,
        },
      ],
    },
  ],
  auth: authRoles.user,
};

export default SubscriptionsRoute;
