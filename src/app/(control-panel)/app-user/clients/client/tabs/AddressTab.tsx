import { TextField, Autocomplete } from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { useLocation, useParams } from 'react-router';
import { useEffect, useState, useRef } from 'react';
import { useGetCitiesQuery, useGetStatesQuery, useGetViacepQuery, ViacepResponse } from '@/store/api/locationApi';

interface AddressTabProps {
  setLoading: (loading: boolean) => void;
}

function AddressTab({ setLoading }: AddressTabProps) {
  const { register, formState, control, setValue, setError, clearErrors, watch } = useFormContext();
  const getHelperText = (field) => (typeof field?.message === 'string' ? field.message : undefined);
  const { state } = useLocation();
  const { uid } = useParams();

  // Estado para controlar o CEP digitado e se já foi feita a busca
  const [cep, setCep] = useState('');
  const [shouldFetch, setShouldFetch] = useState(false);

  // Estado para controlar o stateUid selecionado
  const stateUid = watch('stateUid');

  // Busca no viacep só quando shouldFetch for true e cep válido
  const numericCep = cep.replace(/\D/g, '');
  const { data: viacepData, isFetching } = useGetViacepQuery(shouldFetch && numericCep.length === 8 ? numericCep : '', {
    skip: !shouldFetch || numericCep.length !== 8,
  }) as { data: ViacepResponse; isFetching: boolean };

  const { data: statesData, isFetching: isFetchingStates } = useGetStatesQuery();
  const { data: citiesData, isSuccess: isSuccessCities, isFetching: isFetchingCities } = useGetCitiesQuery(stateUid, { skip: !stateUid });

  useEffect(() => {
    setLoading(isFetchingStates);
  }, [isFetchingStates]);

  useEffect(() => {
    setLoading(isFetching);
  }, [isFetching]);

  useEffect(() => {
    setLoading(isFetchingCities);
  }, [isFetchingCities]);

  // Ref para controlar se já preencheu a cidade após ViaCEP
  const filledCityRef = useRef<string | null>(null);

  // Preenche os campos do formulário quando viacepData chega (CEP válido)
  useEffect(() => {
    if (viacepData && viacepData?.cep) {
      setValue('address', viacepData?.logradouro || '', { shouldDirty: true });
      setValue('neighborhood', viacepData?.bairro || '', { shouldDirty: true });
      setValue('complement', viacepData?.complemento || '', { shouldDirty: true });
      clearErrors('zipCode'); // Limpa erro se CEP válido

      // Buscar o uid do estado pela sigla
      if (statesData?.data && viacepData?.estado) {
        const estadosArr = Array.isArray(statesData?.data) ? statesData?.data : [statesData?.data];
        const estadoObj = estadosArr.find((s) => s.name === viacepData?.estado);

        if (estadoObj) {
          setValue('stateUid', estadoObj.uid, { shouldDirty: true });
          filledCityRef.current = viacepData.localidade || null; // Marca que precisa preencher cidade
        }
      }

      if (isSuccessCities && citiesData && uid !== 'new') {
        const cityFiltered = citiesData?.data.find((city) => city?.name === viacepData?.localidade);
        setValue('cityUid', cityFiltered?.uid || '', { shouldDirty: true });
      }
    }
  }, [viacepData, setValue, clearErrors, statesData, citiesData]);

  useEffect(() => {
    if (isSuccessCities && citiesData && uid === 'new') {
      const cityFiltered = citiesData?.data.find((city) => city?.name === viacepData?.localidade);
      setValue('cityUid', cityFiltered?.uid || '', { shouldDirty: true });
    }
  }, [isFetchingCities, citiesData]);

  // Seta erro no campo zipCode se ViaCEP retornar erro
  useEffect(() => {
    if (viacepData && (viacepData?.erro || !viacepData?.cep)) {
      setValue('address', '', { shouldDirty: true });
      setValue('neighborhood', '', { shouldDirty: true });
      setValue('cityUid', '', { shouldDirty: true });
      setValue('complement', '', { shouldDirty: true });
      setValue('stateUid', '', { shouldDirty: true });
      setError('zipCode', { type: 'manual', message: 'CEP não encontrado ou inválido' });
    }
  }, [viacepData, setValue, setError]);

  useEffect(() => {
    const zipCodeValue = watch('zipCode');

    if (zipCodeValue !== cep) {
      setCep(zipCodeValue || '');
    }
  }, [watch('zipCode')]);

  // Determina se os campos de endereço devem estar habilitados
  const zipCodeValue = watch('zipCode');
  const hasZip = (zipCodeValue || '').replace(/\D/g, '').length === 8;
  const hasViacepError = !!(viacepData && (viacepData?.erro || !viacepData?.cep));
  const isAddressFieldsEnabled = hasZip && !state?.isView && !hasViacepError;

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <Controller
        name="zipCode"
        control={control}
        render={({ field }) => (
          <TextField
            label="CEP"
            error={!!formState.errors.zipCode}
            helperText={getHelperText(formState.errors.zipCode)}
            fullWidth
            disabled={state?.isView}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              inputComponent: IMaskInput,
              inputProps: {
                mask: '00000-000',
                overwrite: true,
              },
            }}
            {...field}
            value={cep}
            onChange={(e) => {
              const maskedValue = e.target.value;
              setCep(maskedValue);
              setShouldFetch(false);
              field.onChange(maskedValue);
              clearErrors('zipCode'); // Limpa erro ao digitar
              setValue('addressUpdate', true, { shouldDirty: false });
            }}
            onBlur={() => {
              // Remove máscara para buscar no ViaCEP
              const numericCep = cep.replace(/\D/g, '');

              if (numericCep.length === 8) setShouldFetch(true);
            }}
          />
        )}
      />
      <div className="flex gap-4">
        <Controller
          name="stateUid"
          control={control}
          render={({ field }) => (
            <Autocomplete
              options={Array.isArray(statesData?.data) ? statesData?.data : []}
              getOptionLabel={(option) => option?.name || ''}
              isOptionEqualToValue={(option, value) => option?.uid === value?.uid}
              value={Array.isArray(statesData?.data) && field?.value ? statesData?.data?.find((s) => s?.uid === field?.value) || null : null}
              onChange={(_, newValue) => {
                field.onChange(newValue ? newValue?.uid : '');
                setValue('stateUid', newValue ? newValue?.uid : '', { shouldDirty: true });
                setValue('city', '', { shouldDirty: true }); // Limpa cidade ao trocar estado
                setValue('cityUid', '', { shouldDirty: true });
                setValue('addressUpdate', true, { shouldDirty: false });
              }}
              fullWidth
              disabled={!isAddressFieldsEnabled}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Estado"
                  InputProps={{
                    ...params.InputProps,
                    sx: { paddingY: '0 !important' },
                  }}
                  error={!!formState.errors.state}
                  helperText={getHelperText(formState.errors.state)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              )}
            />
          )}
        />
        <Controller
          name="cityUid"
          control={control}
          render={({ field }) => {
            return (
              <Autocomplete
                options={Array.isArray(citiesData?.data) ? citiesData?.data : []}
                getOptionLabel={(option) => option?.name || ''}
                isOptionEqualToValue={(option, value) => option.uid === value?.uid}
                value={field?.value ? citiesData?.data?.find((c) => c?.uid === field?.value) || null : null}
                onChange={(_, newValue) => {
                  field.onChange(newValue ? newValue?.uid : '');
                  setValue('cityUid', newValue ? newValue?.uid : '', { shouldDirty: true });
                  setValue('addressUpdate', true, { shouldDirty: false });
                }}
                fullWidth
                disabled={!isAddressFieldsEnabled || !stateUid}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cidade"
                    InputProps={{
                      ...params.InputProps,
                      sx: { paddingY: '0 !important' },
                    }}
                    error={!!formState.errors.city}
                    helperText={getHelperText(formState.errors.city)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                )}
              />
            );
          }}
        />
      </div>
      <TextField
        label="Endereço"
        {...register('address', {
          onChange: () => setValue('addressUpdate', true, { shouldDirty: false }),
        })}
        error={!!formState.errors.address}
        helperText={getHelperText(formState.errors.address)}
        fullWidth
        disabled={!isAddressFieldsEnabled}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Bairro"
        {...register('neighborhood', {
          onChange: () => setValue('addressUpdate', true, { shouldDirty: false }),
        })}
        error={!!formState.errors.neighborhood}
        helperText={getHelperText(formState.errors.neighborhood)}
        fullWidth
        disabled={!isAddressFieldsEnabled}
        InputLabelProps={{ shrink: true }}
      />
      <div className="flex gap-4">
        <TextField
          label="Complemento"
          {...register('complement', {
            onChange: () => setValue('addressUpdate', true, { shouldDirty: false }),
          })}
          error={!!formState.errors.complement}
          helperText={getHelperText(formState.errors.complement)}
          fullWidth
          disabled={!isAddressFieldsEnabled}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Número"
          {...register('number', {
            onChange: () => setValue('addressUpdate', true, { shouldDirty: false }),
          })}
          error={!!formState.errors.number}
          helperText={getHelperText(formState.errors.number)}
          fullWidth
          disabled={!isAddressFieldsEnabled}
          InputLabelProps={{ shrink: true }}
        />
      </div>
    </div>
  );
}

export default AddressTab;
