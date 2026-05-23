import { apiService as api } from 'src/store/apiService';

export const addTagTypes = ['create_message_template', 'get_message_templates', 'delete_message_template'] as const;

const MessageTemplatesApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getMessageTemplates: build.query<GetMessageTemplatesApiResponse, GetMessageTemplatesApiArg>({
        query: (query) => ({
          url: `/message-templates${query ? `?${query}` : ''}`,
          method: 'GET',
        }),
        providesTags: ['get_message_templates'],
      }),
      createMessageTemplate: build.mutation<CreateMessageTemplateApiResponse, CreateMessageTemplateApiArg>({
        query: (messageTemplate) => ({
          url: `/message-templates`,
          method: 'POST',
          body: messageTemplate,
        }),
        invalidatesTags: ['create_message_template', 'get_message_templates'],
      }),
      deleteMessageTemplate: build.mutation<DeleteMessageTemplateApiResponse, DeleteMessageTemplateApiArg>({
        query: (uid) => ({
          url: `/message-templates/${uid}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['delete_message_template', 'get_message_templates'],
      }),
    }),
    overrideExisting: false,
  });

export default MessageTemplatesApi;

export type MessageTemplatesApiType = {
  [MessageTemplatesApi.reducerPath]: ReturnType<typeof MessageTemplatesApi.reducer>;
};

export type GetMessageTemplatesApiResponse = MessageTemplatesResponse;
export type GetMessageTemplatesApiArg = string | undefined;

export type CreateMessageTemplateApiResponse = MessageTemplatesResponse;
export type CreateMessageTemplateApiArg = CreateMessageTemplateType;

export type DeleteMessageTemplateApiResponse = MessageTemplatesResponse;
export type DeleteMessageTemplateApiArg = string;

export type CreateMessageTemplateType = {
  name: string;
  category: string;
  enable: boolean;
  message: string;
  image?: File | string | null | undefined;
};

export type MessageTemplateType = {
  uid: string;
  name: string;
  category: 'MARKETING' | 'UTILITY';
  enable: boolean;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  message: string;
  userUid: string;
  createdAt: string;
  updatedAt: string;
  image?: File | string | null | undefined;
  imageUrl?: string | null | undefined;
};

export type MessageTemplatesResponse = {
  data?: MessageTemplateType[];
  total?: number;
  success: boolean;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  msg: string;
};

export const { useCreateMessageTemplateMutation, useGetMessageTemplatesQuery, useDeleteMessageTemplateMutation } = MessageTemplatesApi;
