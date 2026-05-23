import { apiService as api } from 'src/store/apiService';

export const addTagTypes = ['get_tags', 'create_tag', 'update_tag', 'delete_tag'] as const;

const TagsApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getTags: build.query<GetTagsApiResponse, void>({
        query: () => ({
          url: `/tags`,
          method: 'GET',
        }),
        providesTags: ['get_tags'],
      }),
      updateTag: build.mutation<UpdateTagApiResponse, UpdateTagApiArg>({
        query: ({ uid, ...tag }) => ({
          url: `/tags/${uid}`,
          method: 'PUT',
          body: tag,
        }),
        invalidatesTags: ['get_tags'],
      }),
      deleteTag: build.mutation<DeleteTagApiResponse, DeleteTagApiArg>({
        query: (uid) => ({
          url: `/tags/${uid}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['get_tags'],
      }),
      addTagToLead: build.mutation<AddTagToLeadApiResponse, AddTagToLeadApiArg>({
        query: ({ leadUid, tagUid }) => ({
          url: `/tags/lead/${leadUid}`,
          method: 'POST',
          body: { tagUid },
        }),
        invalidatesTags: ['get_tags'],
      }),
      addTagToClient: build.mutation<AddTagToClientApiResponse, AddTagToClientApiArg>({
        query: ({ clientUid, tagUid }) => ({
          url: `/tags/client/${clientUid}`,
          method: 'POST',
          body: { tagUid },
        }),
        invalidatesTags: ['get_tags'],
      }),
    }),
    overrideExisting: false,
  });

export default TagsApi;

export type TagsApiType = {
  [TagsApi.reducerPath]: ReturnType<typeof TagsApi.reducer>;
};

// Response Types
export type GetTagsApiResponse = TagsResponse;
export type UpdateTagApiResponse = TagResponse;
export type DeleteTagApiResponse = TagResponse;
export type AddTagToLeadApiResponse = TagResponse;
export type AddTagToClientApiResponse = TagResponse;

// Argument Types
export type UpdateTagApiArg = UpdateTagType;
export type DeleteTagApiArg = string;
export type AddTagToLeadApiArg = { leadUid: string; tagUid: string };
export type AddTagToClientApiArg = { clientUid: string; tagUid: string };

// Data Types
export type TagType = {
  uid: string;
  name: string;
  color: string;
  userUid: string;
  enable: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateTagType = {
  name: string;
  color: string;
};

export type UpdateTagType = {
  uid?: string;
  name: string;
  color: string;
  update?: boolean;
};

export type TagsResponse = {
  data: TagType[];
  success: boolean;
  msg: string;
};

export type TagResponse = {
  data?: TagType;
  success: boolean;
  msg: string;
};

export const { useGetTagsQuery, useUpdateTagMutation, useDeleteTagMutation, useAddTagToLeadMutation, useAddTagToClientMutation } = TagsApi;
