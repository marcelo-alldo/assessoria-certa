/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiService as api } from 'src/store/apiService';

export const addTagTypes = ['alldo-n8n'] as const;

const N8NApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      n8n: build.mutation<N8NResponse, N8NRequest>({
        query: (data) => ({
          url: `/alldo-n8n`,
          method: 'POST',
          body: data,
        }),
        invalidatesTags: ['alldo-n8n'],
      }),
    }),
    overrideExisting: false,
  });

export default N8NApi;

export type LocationApiType = {
  [N8NApi.reducerPath]: ReturnType<typeof N8NApi.reducer>;
};

export type N8NResponse = {
  data: any;
  msg: string;
  success: boolean;
};

export type N8NRequest = {
  url: string;
  method: string;
  data?: any;
};

export const { useN8nMutation } = N8NApi;
