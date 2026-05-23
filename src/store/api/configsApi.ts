import { apiService as api } from 'src/store/apiService';

export const addTagTypes = ['get_configs', 'create_config', 'update_config', 'delete_config'] as const;

const ConfigsApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getConfigs: build.query<GetConfigsApiResponse, GetConfigsApiArg>({
        query: (query) => ({
          url: `/configs?${query}`,
        }),
        providesTags: ['get_configs'],
      }),
      createConfig: build.mutation<CreateConfigApiResponse, CreateConfigApiArg>({
        query: (config) => ({
          url: `/configs`,
          method: 'POST',
          body: config,
        }),
        invalidatesTags: ['create_config'],
      }),
      updateConfig: build.mutation<UpdateConfigApiResponse, UpdateConfigApiArg>({
        query: (config) => ({
          url: `/configs/${config.uid}`,
          method: 'PUT',
          body: config,
        }),
        invalidatesTags: ['update_config'],
      }),
      deleteConfig: build.mutation<DeleteConfigApiResponse, DeleteConfigApiArg>({
        query: ({ uid }) => ({
          url: `/configs/${uid}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['get_configs'],
      }),
    }),
    overrideExisting: false,
  });

export default ConfigsApi;

export type ConfigsApiType = {
  [ConfigsApi.reducerPath]: ReturnType<typeof ConfigsApi.reducer>;
};

export type GetConfigsApiResponse = ConfigsResponse;
export type GetConfigsApiArg = string;

export type CreateConfigApiResponse = ConfigsResponse;
export type CreateConfigApiArg = CreateConfigType;

export type DeleteConfigApiResponse = ConfigsResponse;
export type DeleteConfigApiArg = {
  uid: string;
};

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
  data?: ConfigType;
  success: boolean;
  msg: string;
};

export const { useGetConfigsQuery, useCreateConfigMutation, useUpdateConfigMutation, useDeleteConfigMutation } = ConfigsApi;
