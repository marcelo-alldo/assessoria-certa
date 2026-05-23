import { apiService as api } from 'src/store/apiService';

export const addTagTypes = ['dashboard'] as const;

const ReportsApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getDashboardUser: build.query<GetDashboardApiResponse, GetDashboardApiArg>({
        query: () => ({
          url: `/reports/dashboard`,
          method: 'GET',
        }),
        providesTags: ['dashboard'],
      }),
    }),
    overrideExisting: false,
  });

export default ReportsApi;

export type AdminApiType = {
  [ReportsApi.reducerPath]: ReturnType<typeof ReportsApi.reducer>;
};

export type GetDashboardApiResponse = GetDashboardResponse;
export type GetDashboardApiArg = void;

export type GetDashboardResponse = {
  data: {
    totalLeads: number;
    totalClientsEnable: number;
    totalClientsDisable: number;
    totalCollaborators: number;
    totalMessages: number;
    totalMessagesPending: number;
    leadsPerMonth: [];
    clientsPerMonth: [];
  };
  success: boolean;
  msg: string;
};

export const { useGetDashboardUserQuery } = ReportsApi;
