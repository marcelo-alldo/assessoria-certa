import { apiService as api } from 'src/store/apiService';

export const addTagTypes = ['get_flows', 'create_config', 'update_config'] as const;

const FlowsApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getFlows: build.query<GetConfigsApiResponse, GetConfigsApiArg>({
        query: (query) => ({
          url: `/configs?${query}`,
        }),
        providesTags: ['get_flows'],
      }),
    }),
    overrideExisting: false,
  });

export default FlowsApi;

export type FlowsApiType = {
  [FlowsApi.reducerPath]: ReturnType<typeof FlowsApi.reducer>;
};

export type GetConfigsApiResponse = ConfigsResponse;
export type GetConfigsApiArg = string;

export type CreateConfigApiResponse = ConfigsResponse;
export type CreateConfigApiArg = CreateConfigType;

export type UpdateConfigApiResponse = ConfigsResponse;
export type UpdateConfigApiArg = UpdateConfigType;

export type CreateConfigType = {
  name: string;
  key: string;
  value: string;
  data?: string;
};

export type UpdateConfigType = {
  uid: string;
  name: string;
  key: string;
  value: string;
  data?: string;
};

export type ConfigType = {
  uid: string;
  name: string;
  key: string;
  value: string;
  data: string;
  userUid: string;
  createdAt: string;
  updatedAt: string;
};

export type ConfigsResponse = {
  data?: ConfigType[];
  success: boolean;
  msg: string;
};

export const { useGetFlowsQuery } = FlowsApi;
