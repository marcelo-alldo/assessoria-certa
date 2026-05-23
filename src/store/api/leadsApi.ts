import { apiService as api } from 'src/store/apiService';

export const addTagTypes = ['create_lead', 'upload_leads_file', 'get_leads', 'delete_lead', 'update_lead'] as const;

const LeadsApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      createLead: build.mutation<CreateLeadApiResponse, CreateLeadApiArg>({
        query: (member) => ({
          url: `/leads`,
          method: 'POST',
          body: member,
        }),
        invalidatesTags: ['create_lead'],
      }),
      uploadLeadsFile: build.mutation<UploadLeadFilesApiResponse, UploadLeadFilesApiArg>({
        query: (formData) => ({
          url: `/leads/upload`,
          method: 'POST',
          body: formData,
        }),
        invalidatesTags: ['upload_leads_file'],
      }),
      getLeads: build.query<GetLeadsApiResponse, GetLeadsApiArg>({
        query: (query) => ({
          url: `/leads?${query}`,
        }),
        providesTags: ['get_leads'],
      }),
      deleteLead: build.mutation<DeleteLeadApiResponse, DeleteLeadApiArg>({
        query: (uid) => ({
          url: `/leads/${uid}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['delete_lead'],
      }),
      updateLead: build.mutation<UpdateLeadApiResponse, UpdateLeadApiArg>({
        query: (lead) => ({
          url: `/leads/${lead.uid}`,
          method: 'PUT',
          body: lead,
        }),
        invalidatesTags: ['update_lead'],
      }),
      leadChangeOwner: build.mutation<UpdateLeadApiResponse, { uid: string }>({
        query: ({ uid }) => ({
          url: `/leads/${uid}/owner`,
          method: 'PUT',
        }),
        invalidatesTags: ['update_lead'],
      }),
    }),
    overrideExisting: false,
  });

export default LeadsApi;

export type LeadsApiType = {
  [LeadsApi.reducerPath]: ReturnType<typeof LeadsApi.reducer>;
};

export type CreateLeadApiResponse = LeadsResponse;
export type CreateLeadApiArg = CreateLeadType;

export type UploadLeadFilesApiResponse = LeadsResponse;
export type UploadLeadFilesApiArg = string;

export type GetLeadsApiResponse = LeadsResponse;
export type GetLeadsApiArg = string;

export type UpdateLeadApiResponse = LeadsResponse;
export type UpdateLeadApiArg = UpdateLeadType;

export type DeleteLeadApiResponse = LeadsResponse;
export type DeleteLeadApiArg = string /** member id */;

export type CreateLeadType = {
  email?: string;
  name: string;
  phone: string;
};

export type UpdateLeadType = {
  uid: string;
  name?: string;
  email?: string;
  summary?: string | null;
  notes?: string | null;
  phone?: string;
  cpf?: string | null;
  stepUid?: string;
  position?: number;
  changeStep?: boolean;
};

export type LeadType = {
  uid: string;
  name: string;
  archived: boolean;
  email: string;
  summary?: string | null;
  phone: string;
  cpf: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
  ieRg: string | null;
  cnpj: string | null;
  conversation: string | null;
  fantasyName: string | null;
  stepUid: string;
  birthDate: string | null;
  userUid: string;
  notes?: string | null;
  owner?: {
    profile: {
      name: string;
    };
  };
  ownerUid?: string;
  step?: {
    name: string;
    uid: string;
  };
  leadTags?: {
    uid: string;
    leadUid: string;
    tagUid: string;
    createdAt: string;
    updatedAt: string;
    tag: {
      uid: string;
      userUid: string;
      name: string;
      color: string;
      createdAt: string;
      updatedAt: string;
    };
  }[];
  historyNotes?: LeadHistoryNoteType[];
};

export type LeadHistoryNoteType = {
  uid: string;
  leadUid: string;
  clientUid: string | null;
  note: string;
  historyNoteType: string;
  changeIa: boolean;
  ownerUid: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    uid: string;
    login: string;
    profile?: {
      uid: string;
      name: string;
      email: string;
      phone: string | null;
      avatar: string | null;
    };
  };
};

export type LeadsResponse = {
  data: LeadType[];
  total: number;
  success: boolean;
  page: number;
  pageSize: number;
  totalPages: number;
  msg: string;
};

export const {
  useCreateLeadMutation,
  useUploadLeadsFileMutation,
  useGetLeadsQuery,
  useDeleteLeadMutation,
  useUpdateLeadMutation,
  useLeadChangeOwnerMutation,
} = LeadsApi;
