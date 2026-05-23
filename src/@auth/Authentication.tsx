import React from 'react';

import AWSAuthProvider from '@auth/services/aws/AWSAuthProvider';
import JwtAuthProvider from '@auth/services/jwt/JwtAuthProvider';
import { FuseAuthProviderType } from '@fuse/core/FuseAuthProvider/types/FuseAuthTypes';
import FuseAuthProvider from '@fuse/core/FuseAuthProvider';
import FuseAuthorization from '@fuse/core/FuseAuthorization';
import { User } from '@auth/user';
/**
 * The Authentication providers.
 */
const authProviders: FuseAuthProviderType[] = [
  {
    name: 'jwt',
    Provider: JwtAuthProvider,
  },
  {
    name: 'aws',
    Provider: AWSAuthProvider,
  },
  // {
  //   name: 'firebase',
  //   Provider: FirebaseAuthProvider,
  // },
];

type AuthenticationProps = {
  children: React.ReactNode;
};

function Authentication(props: AuthenticationProps) {
  const { children } = props;

  return (
    <FuseAuthProvider providers={authProviders}>
      {(authState) => {
        const userRole = authState?.user?.role as User['role'];
        const loginRedirectUrl = (authState?.user?.data &&
          (authState.user.data as User['data']).loginRedirectUrl) as User['data']['loginRedirectUrl'];
        return (
          <FuseAuthorization userRole={userRole} loginRedirectUrl={loginRedirectUrl}>
            {children}
          </FuseAuthorization>
        );
      }}
    </FuseAuthProvider>
  );
}

export default Authentication;
