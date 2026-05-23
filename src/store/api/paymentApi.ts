import { apiService as api } from 'src/store/apiService';

export const addTagTypes = ['get', 'update', 'create', 'delete'] as const;

const PaymentApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getPayments: build.query<GetPaymentsApiResponse, GetPaymentsApiArg>({
        query: (query) => ({
          url: `/payments?${query}`,
          method: 'GET',
        }),
        providesTags: ['get'],
      }),
      getPaymentByUid: build.query<GetPaymentByUidApiResponse, GetPaymentByUidApiArg>({
        query: (uid) => ({
          url: `/payments/${uid}`,
          method: 'GET',
        }),
        providesTags: ['get'],
      }),
      getPaymentsByUser: build.query<GetPaymentsByUserApiResponse, GetPaymentsByUserApiArg>({
        query: (userUid) => ({
          url: `/payments/user/${userUid}`,
          method: 'GET',
        }),
        providesTags: ['get'],
      }),
      getPaymentsBySubscription: build.query<GetPaymentsBySubscriptionApiResponse, GetPaymentsBySubscriptionApiArg>({
        query: (subscriptionUid) => ({
          url: `/payments/subscription/${subscriptionUid}`,
          method: 'GET',
        }),
        providesTags: ['get'],
      }),
      createPayment: build.mutation<CreatePaymentApiResponse, CreatePaymentApiArg>({
        query: (body) => ({
          url: `/payments`,
          method: 'POST',
          body,
        }),
        invalidatesTags: ['get', 'create'],
      }),
      updatePayment: build.mutation<UpdatePaymentApiResponse, UpdatePaymentApiArg>({
        query: ({ uid, ...body }) => ({
          url: `/payments/${uid}`,
          method: 'PUT',
          body,
        }),
        invalidatesTags: ['get', 'update'],
      }),
      updatePaymentStatus: build.mutation<UpdatePaymentStatusApiResponse, UpdatePaymentStatusApiArg>({
        query: ({ uid, status }) => ({
          url: `/payments/${uid}/status`,
          method: 'PATCH',
          body: { status },
        }),
        invalidatesTags: ['get', 'update'],
      }),
      deletePayment: build.mutation<DeletePaymentApiResponse, DeletePaymentApiArg>({
        query: (uid) => ({
          url: `/payments/${uid}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['get', 'delete'],
      }),
    }),
    overrideExisting: false,
  });

export default PaymentApi;

export type PaymentApiType = {
  [PaymentApi.reducerPath]: ReturnType<typeof PaymentApi.reducer>;
};

// Enums
export type StatusPayment =
  | 'PENDING'
  | 'RECEIVED'
  | 'CANCELED'
  | 'CONFIRMED'
  | 'OVERDUE'
  | 'REFUNDED'
  | 'REFUSED'
  | 'RECEIVED_IN_CASH'
  | 'REFUND_REQUESTED'
  | 'REFUND_IN_PROGRESS'
  | 'CHARGEBACK_REQUESTED'
  | 'CHARGEBACK_DISPUTE'
  | 'AWAITING_CHARGEBACK_REVERSAL'
  | 'DUNNING_REQUESTED'
  | 'DUNNING_RECEIVED'
  | 'AWAITING_RISK_ANALYSIS';

export type BillingType = 'BOLETO' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'TRANSFER' | 'DEPOSIT' | 'PIX';

export type TypeDiscount = 'PERCENTAGE' | 'FIXED';

export type TypeSource = 'DIRECT' | 'ASAAS' | 'IZIPAY';

// Response Types
export type GetPaymentsApiResponse = GetPaymentsResponse;
export type GetPaymentsApiArg = string;

export type GetPaymentByUidApiResponse = GetPaymentByUidResponse;
export type GetPaymentByUidApiArg = string;

export type GetPaymentsByUserApiResponse = GetPaymentsByUserResponse;
export type GetPaymentsByUserApiArg = string;

export type GetPaymentsBySubscriptionApiResponse = GetPaymentsBySubscriptionResponse;
export type GetPaymentsBySubscriptionApiArg = string;

export type CreatePaymentApiResponse = CreatePaymentResponse;
export type CreatePaymentApiArg = CreatePaymentType;

export type UpdatePaymentApiResponse = UpdatePaymentResponse;
export type UpdatePaymentApiArg = UpdatePaymentType;

export type UpdatePaymentStatusApiResponse = UpdatePaymentStatusResponse;
export type UpdatePaymentStatusApiArg = { uid: string; status: StatusPayment };

export type DeletePaymentApiResponse = DeletePaymentResponse;
export type DeletePaymentApiArg = string;

// Data Types
export type PaymentType = {
  uid: string;
  userUid: string;
  alldoPaymentUid?: string;
  status: StatusPayment;
  type: BillingType;
  value: string | number;
  description?: string;
  dueDate: string;
  discount?: number;
  discountType?: TypeDiscount;
  codePix?: string;
  source: TypeSource;
  userSubscriptionUid?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreatePaymentType = {
  userUid: string;
  alldoPaymentUid?: string;
  status?: StatusPayment;
  type: BillingType;
  value: number;
  description?: string;
  dueDate: string;
  discount?: number;
  discountType?: TypeDiscount;
  codePix?: string;
  source: TypeSource;
  userSubscriptionUid?: string;
  remoteIp: string;
};

export type UpdatePaymentType = {
  uid: string;
  alldoPaymentUid?: string;
  status?: StatusPayment;
  type?: BillingType;
  value?: number;
  description?: string;
  dueDate?: string;
  discount?: number;
  discountType?: TypeDiscount;
  codePix?: string;
  source?: TypeSource;
  userSubscriptionUid?: string;
};

// Response Structures
export type GetPaymentsResponse = {
  data: PaymentType[];
  total: number;
  success: boolean;
  page: number;
  pageSize: number;
  totalPages: number;
  msg: string;
};

export type GetPaymentByUidResponse = {
  data: PaymentType;
  success: boolean;
  msg: string;
};

export type GetPaymentsByUserResponse = {
  data: PaymentType[];
  total: number;
  success: boolean;
  msg: string;
};

export type GetPaymentsBySubscriptionResponse = {
  data: PaymentType[];
  total: number;
  success: boolean;
  msg: string;
};

export type CreatePaymentResponse = {
  data: PaymentType;
  success: boolean;
  msg: string;
};

export type UpdatePaymentResponse = {
  data: PaymentType;
  success: boolean;
  msg: string;
};

export type UpdatePaymentStatusResponse = {
  data: PaymentType;
  success: boolean;
  msg: string;
};

export type DeletePaymentResponse = {
  success: boolean;
  msg: string;
};

export const {
  useGetPaymentsQuery,
  useGetPaymentByUidQuery,
  useGetPaymentsByUserQuery,
  useGetPaymentsBySubscriptionQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useUpdatePaymentStatusMutation,
  useDeletePaymentMutation,
} = PaymentApi;
