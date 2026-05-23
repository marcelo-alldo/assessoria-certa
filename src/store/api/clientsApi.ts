import { apiService as api } from 'src/store/apiService';

export const addTagTypes = ['get_clients', 'update_clients', 'create_client'] as const;

const ClientsApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      createClient: build.mutation<CreateClientApiResponse, CreateClientApiArg>({
        query: (member) => ({
          url: `/clients`,
          method: 'POST',
          body: member,
        }),
        invalidatesTags: ['create_client'],
      }),
      getClients: build.query<GetClientsApiResponse, GetClientsApiArg>({
        query: (query) => ({
          url: `/clients?${query}`,
        }),
        providesTags: ['get_clients'],
      }),
      updateClient: build.mutation<UpdateClientApiResponse, UpdateClientApiArg>({
        query: (client) => ({
          url: `/clients/${client.uid}`,
          method: 'PUT',
          body: client,
        }),
        invalidatesTags: ['update_clients'],
      }),
      clientChangeOwner: build.mutation<UpdateClientApiResponse, { uid: string }>({
        query: ({ uid }) => ({
          url: `/clients/${uid}/owner`,
          method: 'PUT',
        }),
        invalidatesTags: ['update_clients'],
      }),
    }),
    overrideExisting: false,
  });

export default ClientsApi;

export type ClientsApiType = {
  [ClientsApi.reducerPath]: ReturnType<typeof ClientsApi.reducer>;
};

export type CreateClientApiResponse = ClientsResponse;
export type CreateClientApiArg = CreateClientType;

export type GetClientsApiResponse = ClientsResponse;
export type GetClientsApiArg = string;

export type UpdateClientApiResponse = ClientsResponse;
export type UpdateClientApiArg = UpdateClientType;

export type CreateClientType = {
  profileUpdate?: boolean;
  name: string;
  email?: string;
  phone: string;
  cpf?: string;
  cnpj?: string;
  fantasyName?: string;
  deleteLead?: boolean;
  note?: string;
  summary?: string;
  birthDate?: string | null;
  avatar?: string | null;
  addressUpdate?: boolean;
  address?: string;
  complement?: string;
  cityUid?: string;
  latitude?: string | number;
  longitude?: string | number;
  neighborhood?: string;
  number?: string;
  zipCode?: string;
  documentUpdate?: boolean;
};

export type UpdateClientType = {
  uid: string;
  enable?: boolean;
  profileUpdate?: boolean;
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  cnpj?: string;
  fantasyName?: string;
  birthDate?: string | null;
  lastPurchase?: string | null;
  notes?: string;
  summary?: string;
  avatar?: string | null;
  addressUpdate?: boolean;
  address?: string;
  complement?: string;
  cityUid?: string;
  latitude?: string | number;
  longitude?: string | number;
  neighborhood?: string;
  number?: string;
  zipCode?: string;
  documentUpdate?: boolean;
};

export type ClientProfileType = {
  uid: string;
  name: string;
  email: string;
  phone: string;
  enable: boolean;
  cpf: string;
  cnpj: string;
  notes: string;
  summary: string;
  fantasyName: string;
  birthDate: string | null;
  lastPurchase: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AddressType = {
  address: string;
  complement: string;
  cityUid: string;
  stateUid: string;
  latitude: string;
  longitude: string;
  neighborhood: string;
  number: string;
  zipCode: string;
};

export type ClientType = {
  uid: string;
  userUid: string;
  archived: boolean;
  enable: boolean;
  dataClientUid: string;
  addressUid: string | null;
  createdAt: string;
  updatedAt: string;
  clientProfile: ClientProfileType;
  address: AddressType;
  owner?: {
    profile: {
      name: string;
    };
  };
  ownerUid?: string;
  step?: {
    uid: string;
    name: string;
  };
  clientTags?: {
    uid: string;
    clientUid: string;
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
};

export type ClientsResponse = {
  data: ClientType[];
  total: number;
  success: boolean;
  page: number;
  pageSize: number;
  totalPages: number;
  msg: string;
};

export const { useCreateClientMutation, useGetClientsQuery, useUpdateClientMutation, useClientChangeOwnerMutation } = ClientsApi;
