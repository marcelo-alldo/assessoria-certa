import { styled, Typography, TextField, LinearProgress } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import PautaHeader from './PautaHeader';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useGetConfigsQuery } from '../../../../../store/api/configsApi';

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

const schema = z.object({
  pauta: z.string().min(10, 'O campo Pauta deve ser mais detalhado.').max(2000, 'O campo Pauta deve ter no máximo 2000 caracteres.'),
});

type FormType = z.infer<typeof schema>;

const defaultValues: FormType = {
  pauta: '',
};
/**
 * The Pauta.
 */

function Pauta() {
  const [localLoading, setLocalLoading] = useState(false);

  const {
    data: configs,
    isLoading: isLoadingConfigs,
    refetch: refetchConfigs,
  } = useGetConfigsQuery('key=PAUTA', { refetchOnMountOrArgChange: true });

  const methods = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'all',
  });

  const { reset, control, formState, watch } = methods;
  const { errors } = formState;
  const pautaValue = watch('pauta') || '';

  useEffect(() => {
    if (configs) {
      reset({
        pauta: configs?.data?.value || '',
      });
    }
  }, [configs, reset]);

  return (
    <FormProvider {...methods}>
      <Root
        scroll="content"
        header={<PautaHeader setLoading={setLocalLoading} refetch={refetchConfigs} uid={configs?.data?.uid} />}
        content={
          <div className="flex flex-1 flex-col h-full">
            {(isLoadingConfigs || localLoading) && (
              <div className="w-full">
                <LinearProgress color="secondary" />
              </div>
            )}
            {!isLoadingConfigs && (
              <div className="flex flex-1 flex-col h-full p-8 max-w-2xl">
                <Typography variant="body1" className="mb-4">
                  Este texto será utilizado pela inteligência artificial para responder dúvidas dos eleitores automaticamente. Seja claro, detalhado e
                  inclua informações relevantes sobre sua campanha, propostas, diferenciais e missão.
                </Typography>
                <Controller
                  name="pauta"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      multiline
                      minRows={8}
                      maxRows={16}
                      fullWidth
                      variant="outlined"
                      className="mb-4"
                      placeholder="Descreva aqui sobre sua campanha..."
                      error={!!errors.pauta}
                      helperText={errors.pauta?.message || `${pautaValue.length}/2000 caracteres`}
                      inputProps={{
                        maxLength: 2000,
                      }}
                    />
                  )}
                />
              </div>
            )}
          </div>
        }
      />
    </FormProvider>
  );
}

export default Pauta;
