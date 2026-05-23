import { apiService as api } from 'src/store/apiService';

export const addTagTypes = ['presigned_url'] as const;

export type GetPresignedUrlApiResponse = {
  success: boolean;
  msg: string;
  data: {
    uploadUrl: string;
    s3Key: string;
  };
};

export type GetPresignedUrlApiArg = {
  fileName: string;
  fileType: string;
  fileSize: number;
};

const StorageApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getPresignedUrl: build.mutation<GetPresignedUrlApiResponse, GetPresignedUrlApiArg>({
        query: (body) => ({
          url: `/storage/presigned-url`,
          method: 'POST',
          body,
        }),
        invalidatesTags: ['presigned_url'],
      }),
    }),
    overrideExisting: false,
  });

export default StorageApi;

export type StorageApiType = {
  [StorageApi.reducerPath]: ReturnType<typeof StorageApi.reducer>;
};

export const { useGetPresignedUrlMutation } = StorageApi;
