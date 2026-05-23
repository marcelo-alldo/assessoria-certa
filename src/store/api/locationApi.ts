import { apiService as api } from 'src/store/apiService';

export const addTagTypes = ['get_viacep', 'get_states', 'get_cities'] as const;

const LocationApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getViacep: build.query<GetViacepApiResponse, GetViacepApiArg>({
        query: (cep) => ({
          url: `https://viacep.com.br/ws/${cep}/json/`,
          method: 'GET',
        }),
        providesTags: ['get_viacep'],
      }),
      getStates: build.query<GetStatesApiResponse, GetStatesApiArg>({
        query: () => ({
          url: `/locations/states`,
          method: 'GET',
        }),
        providesTags: ['get_states'],
      }),
      getCities: build.query<GetCitiesApiResponse, GetCitiesApiArg>({
        query: (stateUid) => ({
          url: `/locations/cities/${stateUid}`,
          method: 'GET',
        }),
        providesTags: ['get_cities'],
      }),
    }),
    overrideExisting: false,
  });

export default LocationApi;

export type LocationApiType = {
  [LocationApi.reducerPath]: ReturnType<typeof LocationApi.reducer>;
};

export type GetViacepApiResponse = ViacepResponse;
export type GetViacepApiArg = string;

export type GetStatesApiResponse = StatesResponse;
export type GetStatesApiArg = void;

export type GetCitiesApiResponse = CitiesResponse;
export type GetCitiesApiArg = string;

export type ViacepResponse = {
  bairro: string;
  cep: string;
  complemento: string;
  ddd: string;
  estado: string;
  gia: string;
  ibge: string;
  localidade: string;
  logradouro: string;
  regiao: string;
  siafi: string;
  uf: string;
  unidade: string;
  erro?: boolean;
};
export type StatesResponse = {
  data: {
    uid: string;
    name: string;
    codeIbge: number;
    countryUid: string;
    createdAt: string;
    updatedAt: string;
  }[];
  msg: string;
  success: boolean;
};

export type CitiesResponse = {
  data: {
    uid: string;
    name: string;
    codeIbge: number;
    stateUid: string;
    createdAt: string;
    updatedAt: string;
  }[];
  msg: string;
  success: boolean;
};

export const { useGetViacepQuery, useGetCitiesQuery, useGetStatesQuery } = LocationApi;
