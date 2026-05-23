import { apiService as api } from 'src/store/apiService';

export const addTagTypes = ['get', 'update'] as const;

const AdminApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      generateUserKey: build.mutation<GenerateUserKeyApiResponse, GenerateUserKeyApiArg>({
        query: (body) => ({
          url: `/admin/generate-user-key`,
          method: 'POST',
          body,
        }),
      }),
      getDashboard: build.query<GetDashboardApiResponse, GetDashboardApiArg>({
        query: () => ({
          url: `/admin/dashboard`,
          method: 'GET',
        }),
        providesTags: ['get'],
      }),
    }),
    overrideExisting: false,
  });

export default AdminApi;

export type AdminApiType = {
  [AdminApi.reducerPath]: ReturnType<typeof AdminApi.reducer>;
};

export type GenerateUserKeyApiResponse = GenerateUserKeyResponse;
export type GenerateUserKeyApiArg = { userUid: string; password: string };

export type GetDashboardApiResponse = GetDashboardResponse;
export type GetDashboardApiArg = void;

export type GetDashboardResponse = {
  data: {
    totalUsers: number;
    totalFreeTier: number;
    totalStandard: number;
    totalCustom: number;
    usersPerDay: {
      friday: number;
      monday: number;
      saturday: number;
      sunday: number;
      thursday: number;
      tuesday: number;
      wednesday: number;
    };
  };
  success: boolean;
  msg: string;
};

export type GenerateUserKeyResponse = {
  data: { user_key: string };
  success: boolean;
  msg: string;
};

export const { useGenerateUserKeyMutation, useGetDashboardQuery } = AdminApi;
