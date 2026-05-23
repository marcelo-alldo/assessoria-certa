import { apiService as api } from 'src/store/apiService';

export const addTagTypes = ['forgot_password', 'recovery_password', 'confirm_account'] as const;

const AuthApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      authForgotPassword: build.mutation<ForgotPasswordAuthApiResponse, ForgotPasswordAuthApiArg>({
        query: (email) => ({
          url: `/auth/forgot-password`,
          method: 'POST',
          body: { email },
        }),
        invalidatesTags: ['forgot_password'],
      }),
      authRecoveryPassword: build.mutation<RecoveryPasswordAuthApiResponse, RecoveryPasswordAuthApiArg>({
        query: ({ token, password }) => ({
          url: `/auth/recovery-password/${token}`,
          method: 'POST',
          body: { password },
        }),
        invalidatesTags: ['recovery_password'],
      }),
      authCheckToken: build.query<AuthResponse, string>({
        query: (token) => ({
          url: `/auth/recovery-password/${token}`,
          method: 'GET',
        }),
        providesTags: ['recovery_password'],
      }),
      authActivationEmail: build.mutation<AuthResponse, string>({
        query: (token) => ({
          url: `/auth/confirmation/${token}`,
          method: 'POST',
        }),
        invalidatesTags: ['confirm_account'],
      }),
      authUpdateActivationEmail: build.mutation<AuthResponse, string>({
        query: (token) => ({
          url: `/auth/confirmation/${token}`,
          method: 'PUT',
        }),
        invalidatesTags: ['confirm_account'],
      }),
    }),
    overrideExisting: false,
  });

export default AuthApi;

export type AuthApiType = {
  [AuthApi.reducerPath]: ReturnType<typeof AuthApi.reducer>;
};

export type ForgotPasswordAuthApiResponse = AuthResponse;
export type ForgotPasswordAuthApiArg = string;

export type RecoveryPasswordAuthApiResponse = AuthResponse;
export type RecoveryPasswordAuthApiArg = { token: string; password: string };

export type AuthResponse = {
  msg: string;
  success: boolean;
};

export const {
  useAuthForgotPasswordMutation,
  useAuthRecoveryPasswordMutation,
  useAuthCheckTokenQuery,
  useAuthActivationEmailMutation,
  useAuthUpdateActivationEmailMutation,
} = AuthApi;
