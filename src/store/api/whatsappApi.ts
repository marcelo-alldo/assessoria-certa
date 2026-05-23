/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiService as api } from 'src/store/apiService';

export const addTagTypes = [
  'auth-facebook',
  'send_text',
  'send_whatsapp_audio',
  'send_media',
  'create_temp_message',
  'visualize_messages',
  'get_base64_from_media_message',
  'download_save_media',
  'meta-logout',
] as const;

const WhatsAppApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      authFacebook: build.mutation<SendTextApiResponse, { code: string; data: { phone_number_id: string; waba_id: string; business_id: string } }>({
        query: (body) => ({
          url: `/facebook-auth`,
          method: 'POST',
          body,
        }),
        invalidatesTags: ['auth-facebook'],
      }),
      sendText: build.mutation<SendTextApiResponse, SendTextApiArg>({
        query: (body) => ({
          url: `/whatsapp-api/message/send-text`,
          method: 'POST',
          body,
        }),
        invalidatesTags: ['send_text'],
      }),
      sendWhatsappAudio: build.mutation<SendWhatsappAudioApiResponse, SendWhatsappAudioApiArg>({
        query: ({ number, audio }) => ({
          url: `/whatsapp-api/message/send-audio`,
          method: 'POST',
          body: { number, audio },
        }),
        invalidatesTags: ['send_whatsapp_audio'],
      }),

      sendMedia: build.mutation<SendMediaApiResponse, SendMediaApiArg>({
        query: (body) => ({
          url: `/whatsapp-api/message/send-media`,
          method: 'POST',
          body,
        }),
        invalidatesTags: ['send_media'],
      }),
      createTempMessage: build.mutation<CreateTempMessageApiResponse, CreateTempMessageApiArg>({
        query: (body) => ({
          url: `/whatsapp-api/message/create-temp-message`,
          method: 'POST',
          body,
        }),
        invalidatesTags: ['create_temp_message'],
      }),

      downloadAndSaveMedia: build.mutation<DownloadSaveMediaApiResponse, DownloadSaveMediaApiArg>({
        query: (body) => ({
          url: `/whatsapp-api/media/download-save`,
          method: 'POST',
          body,
        }),
        invalidatesTags: ['download_save_media'],
      }),
      metaLogout: build.mutation<MetaLogoutApiResponse, MetaLogoutApiArg>({
        query: () => ({
          url: `/meta-logout`,
          method: 'POST',
        }),
        invalidatesTags: ['meta-logout'],
      }),
    }),
    overrideExisting: false,
  });

export default WhatsAppApi;

export type WhatsAppApiType = {
  [WhatsAppApi.reducerPath]: ReturnType<typeof WhatsAppApi.reducer>;
};

export type CreateInstanceApiResponse = Response;
export type CreateInstanceApiArg = void;

export type ConnectInstanceApiArg = void;

export type ConnectionStateApiResponse = ConnectionStateResponse;
export type ConnectionStateApiArg = void;

export type LogoutInstanceApiResponse = Response;
export type LogoutInstanceApiArg = void;

export type FindChatsApiArg = string;

export type FindUniqueChatApiArg = string;

export type VisualizeMessagesApiArg = string;

export type SendTextApiResponse = SendResponse;
export type SendTextApiArg = SendTextType;

export type SendWhatsappAudioApiResponse = SendResponse;
export type SendWhatsappAudioApiArg = { number: string; audio: Base64URLString };

export type SendMediaApiResponse = SendResponse;
export type SendMediaApiArg = SendMediaType;

export type CreateTempMessageApiResponse = Response;
export type CreateTempMessageApiArg = any;

export type GetBase64FromMediaMessageApiArg = string;

export type GetBase64FromMediaMessageApiResponse = EvolutionGetBase64FromMediaMessageResponse;

export type DownloadSaveMediaApiResponse = SendResponse;
export type DownloadSaveMediaApiArg = { mediaId: string };

export type MetaLogoutApiResponse = SendResponse;
export type MetaLogoutApiArg = void;

export type SendMediaType = {
  number: string;
  mediaType: string;
  mimeType: string;
  caption: string;
  media?: string; // Base64 para arquivos < 4MB
  s3Key?: string; // S3 key para arquivos >= 4MB
  fileName: string;
};

export type SendTextType = {
  phone: string;
  text: string;
};

export type SendResponse = {
  msg: string;
  data: any;
  success: boolean;
};

export type ConnectionStateResponse = {
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
  useSendTextMutation,
  useSendWhatsappAudioMutation,
  useSendMediaMutation,
  useCreateTempMessageMutation,
  useDownloadAndSaveMediaMutation,
  useAuthFacebookMutation,
  useMetaLogoutMutation,
} = WhatsAppApi;
