import { apiService as api } from 'src/store/apiService';

export const addTagTypes = ['create_collaborator', 'get_collaborators', 'update_collaborator'] as const;

const CollaboratorsApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      createCollaborator: build.mutation<CreateCollaboratorApiResponse, CreateCollaboratorApiArg>({
        query: (member) => ({
          url: `/collaborators`,
          method: 'POST',
          body: member,
        }),
        invalidatesTags: ['create_collaborator'],
      }),
      getCollaborators: build.query<GetCollaboratorsApiResponse, GetCollaboratorsApiArg>({
        query: (query) => ({
          url: `/collaborators?${query}`,
        }),
        providesTags: ['get_collaborators'],
      }),
      updateCollaborator: build.mutation<UpdsateCollaboratorApiResponse, UpdateCollaboratorApiArg>({
        query: (collaborator) => ({
          url: `/collaborators/${collaborator.uid}`,
          method: 'PUT',
          body: collaborator,
        }),
        invalidatesTags: ['update_collaborator'],
      }),
    }),
    overrideExisting: false,
  });

export default CollaboratorsApi;

export type CollaboratorsApiType = {
  [CollaboratorsApi.reducerPath]: ReturnType<typeof CollaboratorsApi.reducer>;
};

export type CreateCollaboratorApiResponse = CollaborratorsResponse;
export type CreateCollaboratorApiArg = CreateCollaboratorType;

export type GetCollaboratorsApiResponse = CollaborratorsResponse;
export type GetCollaboratorsApiArg = string;

export type UpdsateCollaboratorApiResponse = CollaborratorsResponse;
export type UpdateCollaboratorApiArg = UpdateCollaboratorType;

export type CreateCollaboratorType = {
  email?: string;
  name: string;
  phone: string;
  cpf?: string;
  birthDate?: string;
};

export type UpdateCollaboratorType = {
  uid: string;
  email?: string;
  name?: string;
  phone?: string;
  enable?: boolean;
  cpf?: string;
  birthDate?: string;
};

export type CollaboratorType = {
  uid: string;
  createdAt: string;
  enable: boolean;
  parentUid: string;
  updatedAt: string;
  userUid: string;
  user: {
    uid: string;
    enable: boolean;
    profile: {
      uid: string;
      name: string;
      email: string;
      phone: string;
      cpf: string;
      cnpj: string | null;
      fantasyName: string | null;
      birthDate: string | null;
      avatar: string | null;
      createdAt: string;
      updatedAt: string;
      addressUid: string | null;
    };
  };
};

export type CollaborratorsResponse = {
  data: CollaboratorType[];
  total: number;
  success: boolean;
  page: number;
  pageSize: number;
  totalPages: number;
  msg: string;
};

export const { useCreateCollaboratorMutation, useGetCollaboratorsQuery, useUpdateCollaboratorMutation } = CollaboratorsApi;
