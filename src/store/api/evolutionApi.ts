import { apiService as api } from 'src/store/apiService';

export const addTagTypes = [
  'create_instance',
  'connect_instance',
  'connection_state',
  'logout_instance',
  'find_chats',
  'find_messages',
  'send_text',
  'send_whatsapp_audio',
  'send_media',
  'create_temp_message',
  'visualize_messages',
  'get_base64_from_media_message',
] as const;

const EvolutionApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      evolutionCreateInstance: build.mutation<EvolutionCreateInstanceApiResponse, EvolutionCreateInstanceApiArg>({
        query: () => ({
          url: `/evolution/instance/create`,
          method: 'POST',
        }),
        invalidatesTags: ['create_instance'],
      }),
      evolutionConnectInstance: build.query<EvolutionConnectInstanceApiResponse, EvolutionConnectInstanceApiArg>({
        query: () => ({
          url: `/evolution/instance/connect`,
        }),
        providesTags: ['connect_instance'],
      }),
      evolutionConnectionState: build.query<EvolutionConnectionStateApiResponse, EvolutionConnectionStateApiArg>({
        query: () => ({
          url: `/evolution/instance/state`,
        }),
        providesTags: ['connection_state'],
      }),
      evolutionLogoutInstance: build.mutation<EvolutionLogoutInstanceApiResponse, EvolutionLogoutInstanceApiArg>({
        query: () => ({
          url: `/evolution/instance/logout`,
          method: 'DELETE',
        }),
        invalidatesTags: ['logout_instance'],
      }),
      evolutionFindChats: build.query<EvolutionFindChatsApiResponse, EvolutionFindChatsApiArg>({
        query: (query) => ({
          url: `/evolution/chat/find-chats?${query}`,
        }),
        providesTags: ['find_chats'],
      }),
      evolutionFindUniqueChat: build.query<EvolutionFindUniqueChatApiResponse, EvolutionFindUniqueChatApiArg>({
        query: (query) => ({
          url: `/evolution/chat/find-chats?${query}`,
        }),
        providesTags: ['find_chats'],
      }),
      evolutionVisualizeMessages: build.mutation<EvolutionVisualizeMessagesApiResponse, EvolutionVisualizeMessagesApiArg>({
        query: (remoteJid) => ({
          url: `/evolution/chat/visualize-messages`,
          method: 'POST',
          body: { remoteJid },
        }),
        invalidatesTags: ['visualize_messages'],
      }),
      evolutionSendText: build.mutation<EvolutionSendTextApiResponse, EvolutionSendTextApiArg>({
        query: (body) => ({
          url: `/evolution/message/send-text`,
          method: 'POST',
          body,
        }),
        invalidatesTags: ['send_text'],
      }),
      evolutionSendWhatsappAudio: build.mutation<EvolutionSendWhatsappAudioApiResponse, EvolutionSendWhatsappAudioApiArg>({
        query: ({ number, audio }) => ({
          url: `/evolution/message/send-whatsapp-audio`,
          method: 'POST',
          body: { number, audio },
        }),
        invalidatesTags: ['send_whatsapp_audio'],
      }),

      evolutionSendMedia: build.mutation<EvolutionSendMediaApiResponse, EvolutionSendMediaApiArg>({
        query: (body) => ({
          url: `/evolution/message/send-media`,
          method: 'POST',
          body,
        }),
        invalidatesTags: ['send_media'],
      }),
      evolutionCreateTempMessage: build.mutation<EvolutionCreateTempMessageApiResponse, EvolutionCreateTempMessageApiArg>({
        query: (body) => ({
          url: `/evolution/message/create-temp-message`,
          method: 'POST',
          body,
        }),
        invalidatesTags: ['create_temp_message'],
      }),
    }),
    overrideExisting: false,
  });

export default EvolutionApi;

export type EvolutionApiType = {
  [EvolutionApi.reducerPath]: ReturnType<typeof EvolutionApi.reducer>;
};

export type EvolutionCreateInstanceApiResponse = EvolutionResponse;
export type EvolutionCreateInstanceApiArg = void;

export type EvolutionConnectInstanceApiResponse = EvolutionConnectInstanceResponse;
export type EvolutionConnectInstanceApiArg = void;

export type EvolutionConnectionStateApiResponse = EvolutionConnectionStateResponse;
export type EvolutionConnectionStateApiArg = void;

export type EvolutionLogoutInstanceApiResponse = EvolutionResponse;
export type EvolutionLogoutInstanceApiArg = void;

export type EvolutionFindChatsApiResponse = EvolutionFindChatsResponse;
export type EvolutionFindChatsApiArg = string;

export type EvolutionFindUniqueChatApiResponse = EvolutionFindChatsResponse;
export type EvolutionFindUniqueChatApiArg = string;

export type EvolutionVisualizeMessagesApiResponse = EvolutionVisualizeMessagesResponse;
export type EvolutionVisualizeMessagesApiArg = string;

export type EvolutionSendTextApiResponse = EvolutionSendResponse;
export type EvolutionSendTextApiArg = EvolutionSendTextType;

export type EvolutionSendWhatsappAudioApiResponse = EvolutionSendResponse;
export type EvolutionSendWhatsappAudioApiArg = { number: string; audio: Base64URLString };

export type EvolutionSendMediaApiResponse = EvolutionSendResponse;
export type EvolutionSendMediaApiArg = EvolutionSendMediaType;

export type EvolutionCreateTempMessageApiResponse = EvolutionResponse;
export type EvolutionCreateTempMessageApiArg = { message: EvolutionMessagesType | EvolutionAttendantHistoryType };

export type EvolutionGetBase64FromMediaMessageApiResponse = EvolutionGetBase64FromMediaMessageResponse;
export type EvolutionGetBase64FromMediaMessageApiArg = string;

export type EvolutionSendMediaType = {
  number: string;
  mediaType: string;
  mimeType: string;
  caption: string;
  media: string;
  fileName: string;
};

export type EvolutionSendTextType = {
  number: string;
  text: string;
};

export type EvolutionSendResponse = {
  msg: string;
  data: EvolutionMessagesType;
  success: boolean;
};

export type EvolutionConnectionStateResponse = {
  success: boolean;
  msg: string;
  data: {
    instance?: {
      instanceName: string;
      state: string;
    };
    status?: number;
    error?: string;
    response?: {
      message: [string];
    };
  };
};

export type EvolutionConnectInstanceResponse = {
  success: boolean;
  msg: string;
  data: {
    pairingCode: string;
    code: string;
    base64: string;
    count: number;
  };
};

export type EvolutionResponse = {
  msg: string;
  success: boolean;
};

export type EvolutionMessagesType = {
  id: string;
  type: string;
  key: {
    id: string;
    fromMe: boolean;
    remoteJid: string;
  };
  pushName: string;
  messageType: string;
  message: {
    conversation: string;
  };
  messageTimestamp: number;
  instanceId: string;
  source: string;
  contextInfo: string;
  MessageUpdate: [
    {
      status: string;
    },
    {
      status: string;
    },
  ];
};

export type EvolutionAttendantHistoryType = {
  createdAt: string;
  description: string;
  masterUid: string;
  note: string;
  remoteJid: string;
  status: string;
  timestamp: number;
  transferTo: string;
  type: string;
  uid: string;
  updatedAt: string;
  userUid: string;
  user: {
    profile: {
      name: string;
    };
  };
  userTransfered: {
    profile: {
      name: string;
    };
  };
};

export type EvolutionVisualizeMessagesResponse = {
  msg: string;
  success: boolean;
};

export type EvolutionChatsType = {
  id: string;
  remoteJid: string;
  pushName: string;
  profilePicUrl: string;
  updatedAt: string;
  windowStart: string;
  windowExpires: string;
  windowActive: boolean;
  isClient: boolean;
  isLead: boolean;
  unreadMessages: number;
  attendant: {
    uid: string;
    name: string;
  };
  isMine: boolean;
  attendantStatus: string;
  messages: {
    records: EvolutionMessagesType[];
    total: number;
    pages: number;
    currentPage: number;
  };
};

export type EvolutionFindChatsResponse = {
  msg: string;
  data: EvolutionChatsType[];
  total: number;
  success: boolean;
};

export type EvolutionGetBase64FromMediaMessageResponse = {
  msg: string;
  success: boolean;
  data: {
    mediaType: string;
    fileName: string;
    size: {
      fileLength: string;
    };
    mimetype: string;
    base64: string;
    buffer: string;
  };
};

export const {
  useEvolutionCreateInstanceMutation,
  useEvolutionConnectInstanceQuery,
  useEvolutionConnectionStateQuery,
  useEvolutionLogoutInstanceMutation,
  useEvolutionFindChatsQuery,
  useEvolutionVisualizeMessagesMutation,
  useEvolutionSendTextMutation,
  useEvolutionSendWhatsappAudioMutation,
  useEvolutionSendMediaMutation,
  useEvolutionCreateTempMessageMutation,
  useEvolutionFindUniqueChatQuery,
} = EvolutionApi;
