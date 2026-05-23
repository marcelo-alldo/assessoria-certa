import { apiService as api } from 'src/store/apiService';

export const addTagTypes = ['create_subscription', 'delete_subscription'] as const;

const SubscriptionApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      createSubscription: build.mutation<CreateSubscriptionApiResponse, CreateSubscriptionApiArg>({
        query: (body) => ({
          url: `/subscriptions`,
          method: 'POST',
          body,
        }),
        invalidatesTags: ['create_subscription'],
      }),
      getSubscriptions: build.query({
        query: (arg) => ({
          url: `/subscriptions?${arg}`,
          method: 'GET',
        }),
        providesTags: ['create_subscription', 'delete_subscription'],
      }),
      deleteSubscription: build.mutation<DeleteSubscriptionApiResponse, DeleteSubscriptionApiArg>({
        query: (uid) => ({
          url: `/subscriptions/${uid}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['delete_subscription'],
      }),
    }),
    overrideExisting: false,
  });

export default SubscriptionApi;

export type SubscriptionApiType = {
  [SubscriptionApi.reducerPath]: ReturnType<typeof SubscriptionApi.reducer>;
};

export type CreateSubscriptionApiResponse = CreateSubscriptionResponse;
export type CreateSubscriptionApiArg = CreateSubscriptionType;

export type DeleteSubscriptionApiResponse = DeleteSubscriptionResponse;
export type DeleteSubscriptionApiArg = string;

export type BillingType = 'BOLETO' | 'CREDIT_CARD' | 'PIX';
export type SubscriptionCycle = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY';

export type CreateSubscriptionType = {
  subscriptionName: string;
  cpfCnpj?: string;
  email?: string;
  value: number;
  dueDate: string;
  description: string;
  billingType: BillingType | string;
  userUid: string;
  percentualValue: number;
  cycle: SubscriptionCycle | string;
  creditCardToken?: string;
  remoteIp: string;
};

export type CreateSubscriptionResponse = {
  success: boolean;
  msg: string;
  data?: {
    uid: string;
  };
};

export type DeleteSubscriptionResponse = {
  success: boolean;
  msg: string;
};

export const { useCreateSubscriptionMutation, useDeleteSubscriptionMutation, useGetSubscriptionsQuery } = SubscriptionApi;
