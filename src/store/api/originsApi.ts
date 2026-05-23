import { apiService as api } from 'src/store/apiService';
import type { TagType } from './tagsApi';

export const addTagTypes = ['get_origins', 'create_origin', 'update_origin', 'delete_origin'] as const;

const OriginsApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getOrigins: build.query<GetOriginsApiResponse, GetOriginsApiArg>({
        query: (query) => ({
          url: `/origins?${query}`,
        }),
        providesTags: ['get_origins'],
      }),
      createOrigin: build.mutation<CreateOriginApiResponse, CreateOriginApiArg>({
        query: (data) => ({
          url: '/origins',
          method: 'POST',
          body: data,
        }),
        invalidatesTags: ['get_origins'],
      }),
      updateOrigin: build.mutation<UpdateOriginApiResponse, UpdateOriginApiArg>({
        query: (data) => ({
          url: `/origins/${data.uid}`,
          method: 'PUT',
          body: data,
        }),
        invalidatesTags: ['get_origins'],
      }),
      deleteOrigin: build.mutation<void, string>({
        query: (uid) => ({
          url: `/origins/${uid}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['get_origins'],
      }),
    }),
    overrideExisting: false,
  });

export default OriginsApi;

export type OriginsApiType = {
  [OriginsApi.reducerPath]: ReturnType<typeof OriginsApi.reducer>;
};

export type GetOriginsApiResponse = OriginsResponse;
export type GetOriginsApiArg = string;

export type CreateOriginApiResponse = OriginResponse;
export type CreateOriginApiArg = CreateOriginType;

export type UpdateOriginApiResponse = OriginResponse;
export type UpdateOriginApiArg = UpdateOriginType;

export type CreateOriginType = {
  name: string;
  key: string;
  tagUid?: string;
};

export type UpdateOriginType = {
  uid: string;
  name: string;
  key: string;
  tagUid?: string;
};

export type OriginType = {
  uid: string;
  name: string;
  key: string;
  tagUid?: string | null;
  userUid: string;
  createdAt: string;
  updatedAt: string;
  tag?: TagType | null;
  _count?: { originTracings: number };
};

export type OriginsResponse = {
  data?: OriginType[];
  success: boolean;
  msg: string;
};

export type OriginResponse = {
  data?: OriginType;
  success: boolean;
  msg: string;
};

export const { useGetOriginsQuery, useCreateOriginMutation, useUpdateOriginMutation, useDeleteOriginMutation } = OriginsApi;
