import { useState, useEffect, useCallback, useMemo, useImperativeHandle } from 'react';
import { FuseAuthProviderComponentProps, FuseAuthProviderState } from '@fuse/core/FuseAuthProvider/types/FuseAuthTypes';
import useLocalStorage from '@fuse/hooks/useLocalStorage';
import { authRefreshToken, authSignIn, authSignInWithToken, authSignUp, authUpdateDbUser } from '@auth/authApi';
import { User } from '../../user';
import { removeGlobalHeaders, setGlobalHeaders } from '@/utils/apiFetch';
import { isTokenValid } from './utils/jwtUtils';
import JwtAuthContext from '@auth/services/jwt/JwtAuthContext';
import { JwtAuthContextType } from '@auth/services/jwt/JwtAuthContext';

export type JwtSignInPayload = {
  email: string;
  password: string;
  remember?: boolean;
};

export type JwtSignUpPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  mode: 'DEFAULT' | 'OPTICO' | 'ASSESSOR';
  subscription?: string;
  value?: number;
  description?: string;
  cycle?: 'MONTHLY' | 'YEARLY';
  billingType?: 'CREDIT_CARD' | 'PIX' | 'BOLETO' | 'TRIAL';
  userUid?: string;
  remoteIp?: string;
  creditCardInfo?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
    cpfCnpj: string;
    fullName: string;
    postalCode: string;
    addressNumber: string;
    addressComplement: string;
    cardAlias: string;
  };
};

function JwtAuthProvider(props: FuseAuthProviderComponentProps) {
  const { ref, children, onAuthStateChanged } = props;

  const {
    value: tokenStorageValue,
    setValue: setTokenStorageValue,
    removeValue: removeTokenStorageValue,
  } = useLocalStorage<string>('jwt_access_token');

  /**
   * Fuse Auth Provider State
   */
  const [authState, setAuthState] = useState<FuseAuthProviderState<User>>({
    authStatus: 'configuring',
    isAuthenticated: false,
    user: null,
  });

  /**
   * Watch for changes in the auth state
   * and pass them to the FuseAuthProvider
   */
  useEffect(() => {
    if (onAuthStateChanged) {
      onAuthStateChanged(authState);
    }
  }, [authState, onAuthStateChanged]);

  /**
   * Attempt to auto login with the stored token
   */
  useEffect(() => {
    const attemptAutoLogin = async () => {
      const accessToken = tokenStorageValue;

      if (isTokenValid(accessToken)) {
        try {
          /**
           * Sign in with the token
           */
          const response = await authSignInWithToken(accessToken);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          setGlobalHeaders({ Authorization: `Bearer ${accessToken}` });

          const userData = await response.json();

          return userData.data.user;
        } catch {
          return false;
        }
      }

      // Also check sessionStorage for temporary tokens
      const sessionTokenString = window.sessionStorage.getItem('jwt_access_token');

      if (sessionTokenString) {
        try {
          const sessionToken = JSON.parse(sessionTokenString);

          if (isTokenValid(sessionToken)) {
            const response = await authSignInWithToken(sessionToken);

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            setGlobalHeaders({ Authorization: `Bearer ${sessionToken}` });

            const userData = await response.json();

            return userData.data.user;
          }
        } catch {
          return false;
        }
      }

      return false;
    };

    if (!authState.isAuthenticated) {
      attemptAutoLogin().then((userData) => {
        if (userData) {
          setAuthState({
            authStatus: 'authenticated',
            isAuthenticated: true,
            user: userData,
          });
        } else {
          removeTokenStorageValue();
          window.sessionStorage.removeItem('jwt_access_token');
          removeGlobalHeaders(['Authorization']);
          setAuthState({
            authStatus: 'unauthenticated',
            isAuthenticated: false,
            user: null,
          });
        }
      });
    }
    // eslint-disable-next-line
  }, [authState.isAuthenticated]);

  /**
   * Sign in
   */
  const signIn: JwtAuthContextType['signIn'] = useCallback(
    async (credentials) => {
      const response = await authSignIn(credentials);

      const session = (await response.json()) as { data: { user: User; access_token: string } };

      if (session) {
        setAuthState({
          authStatus: 'authenticated',
          isAuthenticated: true,
          user: session.data.user,
        });

        if (credentials.remember) {
          setTokenStorageValue(session.data.access_token);
        } else {
          window.sessionStorage.setItem('jwt_access_token', JSON.stringify(session.data.access_token));
        }

        setGlobalHeaders({ Authorization: `Bearer ${session.data.access_token}` });
      }

      return response;
    },
    [setTokenStorageValue],
  );

  /**
   * Sign up
   */
  const signUp: JwtAuthContextType['signUp'] = useCallback(
    async (data) => {
      const response = await authSignUp(data);

      const session = (await response.json()) as { user: User; access_token: string };

      if (session) {
        setAuthState({
          authStatus: 'authenticated',
          isAuthenticated: true,
          user: session.user,
        });
        setTokenStorageValue(session.access_token);
        setGlobalHeaders({ Authorization: `Bearer ${session.access_token}` });
      }

      return response;
    },
    [setTokenStorageValue],
  );

  /**
   * Sign out
   */
  const signOut: JwtAuthContextType['signOut'] = useCallback(() => {
    removeTokenStorageValue();
    window.sessionStorage.removeItem('jwt_access_token');
    removeGlobalHeaders(['Authorization']);
    setAuthState({
      authStatus: 'unauthenticated',
      isAuthenticated: false,
      user: null,
    });
  }, [removeTokenStorageValue]);

  /**
   * Update user
   */
  const updateUser: JwtAuthContextType['updateUser'] = useCallback(async (_user) => {
    try {
      return await authUpdateDbUser(_user);
    } catch (error) {
      console.error('Error updating user:', error);
      return Promise.reject(error);
    }
  }, []);

  /**
   * Refresh access token
   */
  const refreshToken: JwtAuthContextType['refreshToken'] = useCallback(async () => {
    const response = await authRefreshToken();

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    return response;
  }, []);

  /**
   * Auth Context Value
   */
  const authContextValue = useMemo(
    () =>
      ({
        ...authState,
        signIn,
        signUp,
        signOut,
        updateUser,
        refreshToken,
      }) as JwtAuthContextType,
    [authState, signIn, signUp, signOut, updateUser, refreshToken],
  );

  /**
   * Expose methods to the FuseAuthProvider
   */
  useImperativeHandle(ref, () => ({
    signOut,
    updateUser,
  }));

  /**
   * Intercept fetch requests to refresh the access token
   */
  const interceptFetch = useCallback(() => {
    const { fetch: originalFetch } = window;

    window.fetch = async (...args) => {
      const [resource, config] = args;
      const response = await originalFetch(resource, config);
      const newAccessToken = response.headers.get('New-Access-Token');

      if (newAccessToken) {
        setGlobalHeaders({ Authorization: `Bearer ${newAccessToken}` });
        setTokenStorageValue(newAccessToken);
      }

      if (response.status === 401) {
        signOut();

        console.error('Unauthorized request. User was signed out.');
      }

      return response;
    };
  }, [setTokenStorageValue, signOut]);

  useEffect(() => {
    if (authState.isAuthenticated) {
      interceptFetch();
    }
  }, [authState.isAuthenticated, interceptFetch]);

  return <JwtAuthContext value={authContextValue}>{children}</JwtAuthContext>;
}

export default JwtAuthProvider;
