import { Box, Container, FormControlLabel, LinearProgress, styled, Switch, TextField, Typography } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import TestingHeader from './TestingHeader';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAppDispatch } from '../../../../../store/hooks';
import { IMaskInput } from 'react-imask';
import { useGetConfigsQuery } from '@/store/api/configsApi';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .container': {
    maxWidth: '100%!important',
  },
  '& .FusePageSimple-header': {
    backgroundColor: theme.vars.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.vars.palette.divider,
  },
}));

/**
 * The Origins.
 */

const schema = z.object({
  actived: z.object({
    uid: z.string(),
    value: z.string(),
    name: z.string(),
    key: z.string(),
  }),
  testingNumber: z.object({
    uid: z.string(),
    value: z.string().refine((val) => val === '' || /^\(\d{2}\) \d{4,5}-\d{4}$/.test(val), 'Telefone inválido'),
    name: z.string(),
    key: z.string(),
  }),
});

type FormType = z.infer<typeof schema>;

const defaultValues: FormType = {
  actived: { uid: '', value: 'false', name: 'Sistema em teste', key: 'TESTING' },
  testingNumber: { uid: '', value: '', name: 'Número de teste', key: 'TESTING_NUMBER' },
};

function Testing() {
  const {
    data: configs,
    isLoading: isLoadingConfigs,
    refetch: refetchConfigs,
  } = useGetConfigsQuery('key=TESTING,TESTING_NUMBER', { refetchOnMountOrArgChange: true });
  const dispatch = useAppDispatch();
  const [hasChanges, setHasChanges] = useState(false);
  const [, setLocalLoading] = useState(false);

  const getHelperText = (field) => (typeof field?.message === 'string' ? field.message : undefined);

  const methods = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  });
  const { control, formState, watch } = methods;
  const { errors, isValid } = formState;

  const watchedActived = watch('actived');
  const watchedTestingNumber = watch('testingNumber');

  useEffect(() => {
    // Se o switch está ativado, precisa ter telefone válido
    if (watchedActived?.value === 'true') {
      const isFormFilled = Boolean(watchedTestingNumber?.value?.trim());
      setHasChanges(isFormFilled && isValid);
    } else {
      // Se o switch está desativado, pode salvar sem telefone
      setHasChanges(true);
    }
  }, [watchedActived, watchedTestingNumber, isValid]);

  useEffect(() => {
    if (configs?.data) {
      const activedConfig = configs.data.find((config) => config.key === 'TESTING');
      const testingNumberConfig = configs.data.find((config) => config.key === 'TESTING_NUMBER');

      const parseNumberConfig =
        testingNumberConfig?.value.substring(0, 2) === '55'
          ? `(${testingNumberConfig.value.substring(2, 4)}) ${testingNumberConfig.value.substring(4, testingNumberConfig.value.length - 4)}-${testingNumberConfig.value.substring(testingNumberConfig.value.length - 4)}`
          : testingNumberConfig?.value;

      methods.reset({
        actived: {
          uid: activedConfig?.uid || '',
          value: activedConfig?.value || 'false',
          name: 'Sistema em teste',
          key: 'TESTING',
        },
        testingNumber: {
          uid: testingNumberConfig?.uid || '',
          value: parseNumberConfig || '',
          name: 'Número de teste',
          key: 'TESTING_NUMBER',
        },
      });
    }
  }, [configs]);

  return (
    <FormProvider {...methods}>
      <Root
        scroll="content"
        header={
          <>
            {isLoadingConfigs && (
              <div className="w-full">
                <LinearProgress color="secondary" />
              </div>
            )}
            {!isLoadingConfigs && (
              <TestingHeader setLoading={setLocalLoading} refetch={refetchConfigs} hasChanges={hasChanges} setHasChanges={setHasChanges} />
            )}
          </>
        }
        content={
          <div className="flex flex-1 flex-col">
            <Container maxWidth="xl">
              {!isLoadingConfigs && (
                <>
                  <Box className="flex flex-col pl-6 pb-6 mt-4">
                    <Typography variant="subtitle1" color="text.secondary">
                      Quando o modo de teste estiver ativo, o Agente Inteligente responderá apenas ao número cadastrado para testes.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <br />
                      Ao desativar o teste, o agente passa a responder todos os leads e clientes normalmente, conforme o seu plano.
                    </Typography>
                  </Box>

                  <Box className="flex flex-col pl-6 pb-4 mt-2 max-w-2xl">
                    <Controller
                      name={`actived`}
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              color="primary"
                              checked={field.value?.value === 'true'}
                              onChange={(e) => {
                                field.onChange({
                                  ...field.value,
                                  value: e.target.checked ? 'true' : 'false',
                                });
                              }}
                            />
                          }
                          label={field.value?.value === 'true' ? 'Desativar modo de teste' : 'Ativar modo de teste'}
                          className="mb-4"
                        />
                      )}
                    />

                    <Controller
                      name="testingNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          label="Telefone para teste"
                          error={!!formState.errors.testingNumber?.value}
                          required
                          helperText={getHelperText(formState.errors.testingNumber?.value)}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            inputComponent: IMaskInput,
                            inputProps: {
                              mask: ['(00) 0000-0000', '(00) 00000-0000'],
                              dispatch: function (appended, dynamicMasked) {
                                const value = (dynamicMasked.value + appended).replace(/\D/g, '');

                                if (value.length > 10) {
                                  return dynamicMasked.compiledMasks[1]; // 9 dígitos
                                }

                                return dynamicMasked.compiledMasks[0]; // 8 dígitos
                              },
                              lazy: false,
                              overwrite: true,
                            },
                          }}
                          value={field.value?.value || ''}
                          onChange={(e) => {
                            field.onChange({
                              ...field.value,
                              value: e.target.value,
                            });
                          }}
                          onBlur={(e) => {
                            // Força a máscara correta ao sair do campo
                            const onlyDigits = e.target.value.replace(/\D/g, '');

                            let formattedValue = e.target.value;

                            if (onlyDigits.length === 11) {
                              // Garante que o valor não será truncado
                              const ddd = onlyDigits.slice(0, 2);
                              const part1 = onlyDigits.slice(2, 7);
                              const part2 = onlyDigits.slice(7);
                              formattedValue = `(${ddd}) ${part1}-${part2}`;
                            } else if (onlyDigits.length === 10) {
                              const ddd = onlyDigits.slice(0, 2);
                              const part1 = onlyDigits.slice(2, 6);
                              const part2 = onlyDigits.slice(6);
                              formattedValue = `(${ddd}) ${part1}-${part2}`;
                            }

                            field.onChange({
                              ...field.value,
                              value: formattedValue,
                            });

                            if (field.onBlur) field.onBlur();
                          }}
                        />
                      )}
                    />
                  </Box>
                </>
              )}
            </Container>
          </div>
        }
      />
    </FormProvider>
  );
}

export default Testing;
