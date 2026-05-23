/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiService as api } from 'src/store/apiService';

export const addTagTypes = ['get_messages', 'update_message', 'get_recipients', 'create_messages'] as const;

const ScheduledMessagesApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      createScheduledMessages: build.mutation<CreateScheduledMessagesResponse, CreateScheduledMessagesArg>({
        query: (data) => ({
          url: `/scheduled-messages`,
          method: 'POST',
          body: data,
        }),
        invalidatesTags: ['create_messages'],
      }),
      updateScheduledMessage: build.mutation<UpdateScheduledMessageResponse, UpdateScheduledMessageArg>({
        query: (body) => ({
          url: `/scheduled-messages/${body.uid}`,
          method: 'PUT',
          body,
        }),
        invalidatesTags: ['update_message'],
      }),
      updateToggleScheduledMessages: build.mutation<UpdateToggleScheduledMessageResponse, UpdateToggleScheduledMessageArg>({
        query: (uid) => ({
          url: `/scheduled-messages/${uid}`,
          method: 'PUT',
          body: { enable: true },
        }),
        invalidatesTags: ['update_message'],
      }),
      getScheduledMessage: build.query<GetScheduledMessagesApiResponse | ScheduledMessageResponse, GetScheduledMessagesApiArg>({
        query: (query) => ({
          url: `/scheduled-messages?${query}`,
        }),
        providesTags: ['get_messages'],
      }),
      getRecipients: build.query<GetRecipientsApiResponse, GetRecipientsApiArg>({
        query: (query) => ({
          url: `/recipients?${query}`,
        }),
        providesTags: ['get_recipients'],
      }),
    }),
    overrideExisting: false,
  });

export default ScheduledMessagesApi;

export type ScheduledMessagesApiType = {
  [ScheduledMessagesApi.reducerPath]: ReturnType<typeof ScheduledMessagesApi.reducer>;
};

export type CreateScheduledMessagesResponse = ScheduledMessagesResponse;
export type CreateScheduledMessagesArg = CreateScheduledMessageType;

export type UpdateScheduledMessageResponse = ScheduledMessagesResponse;
export type UpdateScheduledMessageArg = UpdateScheduledMessageType;

export type UpdateToggleScheduledMessageResponse = ScheduledMessagesResponse;
export type UpdateToggleScheduledMessageArg = string;

export type GetScheduledMessagesApiResponse = ScheduledMessagesResponse;
export type GetScheduledMessagesApiArg = string;

export type GetRecipientsApiResponse = RecipientsResponse;
export type GetRecipientsApiArg = string;

export type UpdateScheduledMessageType = {
  message: string;
  title: string;
  sendAt: string;
  newRecipients: any[];
  removedRecipients: string[];
  uid: string;
};

export type CreateScheduledMessageType = {
  message: string;
  title: string;
  sendAt: string;
  newRecipients: any[];
};

export type ScheduledMessage = {
  createdAt: string;
  enable: boolean;
  instance: string;
  message: string;
  sendAt: string;
  status: string;
  title: string;
  uid: string;
  updatedAt: string;
  userUid: string;
};

export type ScheduledMessageResponse = {
  data: ScheduledMessage[];
  total: number;
  success: boolean;
  page: number;
  pageSize: number;
  totalPages: number;
  msg: string;
};

export type ScheduledMessagesResponse = {
  data: {
    message: string;
    sendAt: string;
    status: string;
    enable: boolean;
    title: string;
    uid: string;
    _count: { recipients: number };
  }[];
  clientsRecipientsCount: number;
  leadsRecipientsCount: number;
  recipientsCount: number;
  total: number;
  success: boolean;
  page: number;
  pageSize: number;
  totalPages: number;
  msg: string;
};

export type RecipientsType = {
  client: any | null;
  clientProfile?: {
    uid: string;
    name: string;
    email: string;
    phone: string;
    summary: string;
    notes: string;
    cpf: string;
    cnpj: string;
    fantasyName: string;
    birthDate: string | null;
    avatar: string | null;
    createdAt: string;
    updatedAt: string;
  };
  clientUid: string | null;
  createdAt: string;
  lead: any | null;
  leadUid: string | null;
  name: string;
  remoteJid: string;
  scheduledMessageUid: string;
  status: string;
  uid: string;
  updatedAt: string;
  whatsappId: string | null;
  birthDate: string;
  cnpj: string;
  conversation: string;
  cpf: string;
  email: string;
  fantasyName: string;
  ieRg: string;
  notes: string;
  ownerUid: string;
  phone: string;
  position: number;
  scheduledMessageRecipients: { uid: string }[];
  stepUid: string;
  summary: string;
  userUid: string;
};

export type RecipientsResponse = {
  success: boolean;
  data: RecipientsType[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  msg: string;
};

export const {
  useCreateScheduledMessagesMutation,
  useUpdateScheduledMessageMutation,
  useUpdateToggleScheduledMessagesMutation,
  useGetScheduledMessageQuery,
  useGetRecipientsQuery,
  useLazyGetRecipientsQuery,
} = ScheduledMessagesApi;
