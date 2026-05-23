/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiService as api } from 'src/store/apiService';

export const addTagTypes = ['get', 'update'] as const;

const AttendantHistoryApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      transferAttendant: build.mutation<TransferAttendantApiResponse, TransferAttendantApiArg>({
        query: ({ remoteJid, phone, query }) => ({
          url: `/attendant-histories/transfer?${query}`,
          method: 'POST',
          body: {
            remoteJid,
            phone,
          },
        }),
      }),
      getAttendants: build.query<any, any>({
        query: (query) => ({
          url: `/attendant-histories?${query}`,
        }),
        providesTags: ['get'],
      }),
    }),
    overrideExisting: false,
  });

export default AttendantHistoryApi;

export type AttendantHistoryApiType = {
  [AttendantHistoryApi.reducerPath]: ReturnType<typeof AttendantHistoryApi.reducer>;
};

export type TransferAttendantApiResponse = AttendantResponse;
export type TransferAttendantApiArg = { remoteJid: string; phone?: string; query?: string };

export type AttendantResponse = {
  success: boolean;
  msg: string;
};

export const { useTransferAttendantMutation, useGetAttendantsQuery } = AttendantHistoryApi;
