import { apiService as api } from 'src/store/apiService';

export const addTagTypes = ['get', 'update'] as const;

const UserApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getUserSubscriptions: build.query<GetUserSubscriptionsApiResponse, GetUserSubscriptionsApiArg>({
        query: () => ({
          url: `/users/subscriptions`,
          method: 'GET',
        }),
        providesTags: ['get'],
      }),
      getUsers: build.query<GetUsersApiResponse, GetUsersApiArg>({
        query: (query) => ({
          url: `/users?${query}`,
          method: 'GET',
        }),
        providesTags: ['get'],
      }),
      getUniqueUser: build.query<GetUniqueUserResponse, GetUniqueUserApiArg>({
        query: (uid) => ({
          url: `/users?uid=${uid}`,
          method: 'GET',
        }),
        providesTags: ['get'],
      }),
      updateUserEnable: build.mutation<UpdateUserEnableApiResponse, UpdateUserEnableApiArg>({
        query: ({ uid, enable }) => ({
          url: `/users/${uid}`,
          method: 'PUT',
          body: { enable },
        }),
      }),
      updateUser: build.mutation<UpdateUserApiResponse, UpdateUserApiArg>({
        query: (body) => ({
          url: `/users/${body.uid}`,
          method: 'PUT',
          body,
        }),
      }),
      getUniqueSubscription: build.query<GetUniqueSubscriptionsApiResponse, GetUniqueSubscriptionsApiArg>({
        query: (uid) => ({
          url: `/users/subscriptions?uid=${uid}`,
          method: 'GET',
        }),
        providesTags: ['get'],
      }),
    }),
    overrideExisting: false,
  });

export default UserApi;

export type UserApiType = {
  [UserApi.reducerPath]: ReturnType<typeof UserApi.reducer>;
};

export type UpdateUserEnableApiResponse = UpdateUserResponse;
export type UpdateUserEnableApiArg = { uid: string; enable: boolean };

export type UpdateUserApiResponse = UpdateUserResponse;
export type UpdateUserApiArg = UpdateUserType;

export type GetUsersApiResponse = GetUsersResponse;
export type GetUsersApiArg = string;

export type GetUniqueUserApiResponse = GetUniqueUserResponse;
export type GetUniqueUserApiArg = string;

export type GetUserSubscriptionsApiResponse = GetUserSubscriptionResponse;
export type GetUserSubscriptionsApiArg = string;

export type GetUniqueSubscriptionsApiResponse = GetUniqueSubscriptionResponse;
export type GetUniqueSubscriptionsApiArg = string;

export type UpdateUserType = {
  uid: string;
  profileUpdate?: boolean;
  paymentInfosUpdate?: boolean;
  password?: string;
  name?: string;
  phone?: string;
  email?: string;
  cpf?: string;
  birthDate?: string;
  cnpj?: string;
  fantasyName?: string;
};

export type UpdateUserResponse = {
  success: boolean;
  msg: string;
};

export type UsersType = {
  uid: string;
  enable: boolean;
  profileUid: string;
  partnerUid: string;
  createdAt: string;
  updatedAt: string;
  profile: {
    uid: string;
    name: string;
    email: string;
    phone: string;
    cpf: string;
    cnpj: string;
    fantasyName: string;
    birthDate: string;
    avatar: string;
    createdAt: string;
    updatedAt: string;
    addressUid: string;
  };
  subscriptions: {
    uid: string;
    userUid: string;
    subscriptionUid: string;
    paymentUid: string;
    status: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
  }[];
  _count: {
    clients: number;
    collaborators: number;
    leads: number;
  };
  configs: {
    uid: '';
    userUid: '';
    name: '';
    key: '';
    value: '';
    data: '';
    createdAt: '';
    updatedAt: '';
  }[];
  collaborators: {
    uid: string;
    userUid: string;
    collaboratorUid: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }[];
};

export type GetUsersResponse = {
  data: UsersType[];
  total: number;
  success: boolean;
  page: number;
  pageSize: number;
  totalPages: number;
  msg: string;
};

export type GetUniqueUserResponse = {
  data: UsersType;
  success: boolean;
  msg: string;
};

export type UserSubscriptionType = {
  uid: string;
  userUid: string;
  subscriptionUid: string;
  paymentUid: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  subscription: {
    uid: string;
    name: string;
    description: string;
    price: string;
    enable: boolean;
    createdAt: string;
    updatedAt: string;
  };
  payments: {
    uid: string;
    userUid: string;
    alldoPaymentUid: string;
    subscriptionUid: string;
    status: string;
    type: string;
    value: string;
    description: string;
    dueDate: string;
    discount: string;
    discountType: string;
    codePix: string;
    source: string;
    createdAt: string;
    updatedAt: string;
  }[];
};

export type GetUserSubscriptionResponse = {
  msg: string;
  data: UserSubscriptionType[];
  success: boolean;
};

export type GetUniqueSubscriptionResponse = {
  msg: string;
  data: UserSubscriptionType;
  success: boolean;
};

export const {
  useGetUserSubscriptionsQuery,
  useGetUsersQuery,
  useGetUniqueUserQuery,
  useUpdateUserEnableMutation,
  useGetUniqueSubscriptionQuery,
  useUpdateUserMutation,
} = UserApi;
