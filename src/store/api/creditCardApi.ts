import { apiService as api } from 'src/store/apiService';

export const addTagTypes = ['get', 'update', 'create', 'delete'] as const;

const CreditCardApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getCreditCards: build.query<GetCreditCardsApiResponse, GetCreditCardsApiArg>({
        query: () => ({
          url: `/credit-card`,
          method: 'GET',
        }),
        providesTags: ['get'],
      }),
      tokenizeCreditCard: build.mutation<PostTokenizeCreditCardResponse, PostTokenizeCreditCardArg & { ip?: string }>({
        query: ({ ...body }) => ({
          url: `/credit-card/tokenize`,
          method: 'POST',
          body,
        }),
        invalidatesTags: ['create'],
      }),
      deleteCreditCard: build.mutation<DeleteCreditCardResponse, DeleteCreditCardArg>({
        query: (uid) => ({
          url: `/credit-card/${uid}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['get'],
      }),
      setDefaultCreditCard: build.mutation<SetDefaultCreditCardResponse, SetDefaultCreditCardArg>({
        query: (uid) => ({
          url: `/credit-card/${uid}/default`,
          method: 'PUT',
        }),
        invalidatesTags: ['get'],
      }),
    }),
    overrideExisting: false,
  });

export default CreditCardApi;

export type CreditCardApiType = {
  [CreditCardApi.reducerPath]: ReturnType<typeof CreditCardApi.reducer>;
};

export type GetCreditCardsApiResponse = GetCreditCardsResponse;
export type GetCreditCardsApiArg = void;

export type PostTokenizeCreditCardResponse = TokenizeCreditCardResponse;
export type PostTokenizeCreditCardArg = PostTokenizeCreditCardType;

export type DeleteCreditCardResponse = {
  success: boolean;
  msg: string;
};
export type DeleteCreditCardArg = string;

export type SetDefaultCreditCardResponse = {
  success: boolean;
  msg: string;
};
export type SetDefaultCreditCardArg = string;

export type PostTokenizeCreditCardType = {
  ip: string;
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
  name: string;
  email: string;
  cpfCnpj: string;
  phone: string;
  postalCode: string;
  addressNumber: string;
  addressComplement: string;
  cardName: string;
};

export type CreditCardType = {
  creditCardBrand: string;
  creditCardNumber: string;
  uid: string;
  cardName: string;
  isActive: boolean;
};

export type GetCreditCardsResponse = {
  data: CreditCardType[];
  success: boolean;
  msg: string;
};

export type TokenizeCreditCardResponse = {
  success: boolean;
  msg: string;
};

export const { useGetCreditCardsQuery, useTokenizeCreditCardMutation, useDeleteCreditCardMutation, useSetDefaultCreditCardMutation } = CreditCardApi;
