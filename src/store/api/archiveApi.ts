import { apiService as api } from 'src/store/apiService';

export const addTagTypes = ['archive_toggle'] as const;

const ArchiveApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      toggleArchive: build.mutation<ToggleArchiveApiResponse, ToggleArchiveApiArg>({
        query: ({ entity, uid, archived }) => ({
          url: `/${entity}/${uid}/archive`,
          method: 'PUT',
          body: { archived },
        }),
      }),
    }),
    overrideExisting: false,
  });

export default ArchiveApi;

export type ArchiveApiType = {
  [ArchiveApi.reducerPath]: ReturnType<typeof ArchiveApi.reducer>;
};

export type ToggleArchiveApiResponse = {
  success: boolean;
  msg: string;
};

export type ToggleArchiveApiArg = {
  entity: 'leads' | 'clients';
  uid: string;
  archived: boolean;
};

export const { useToggleArchiveMutation } = ArchiveApi;
