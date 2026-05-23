import { styled, Typography, TextField, LinearProgress } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import AboutHeader from './AboutHeader';
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
  about: z.string().min(10, 'O campo Sobre deve ser mais detalhado.').max(2000, 'O campo Sobre deve ter no máximo 2000 caracteres.'),
});

type FormType = z.infer<typeof schema>;

const defaultValues: FormType = {
  about: '',
};
/**
 * The About.
 */

function About() {
  const [localLoading, setLocalLoading] = useState(false);

  const {
    data: configs,
    isLoading: isLoadingConfigs,
    refetch: refetchConfigs,
  } = useGetConfigsQuery('key=ABOUT', { refetchOnMountOrArgChange: true });

  const methods = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'all',
  });

  const { reset, control, formState, watch } = methods;
  const { errors } = formState;
  const aboutValue = watch('about') || '';

  useEffect(() => {
    if (configs) {
      reset({
        about: configs?.data?.value || '',
      });
    }
  }, [configs, reset]);

  return (
    <FormProvider {...methods}>
      <Root
        scroll="content"
        header={<AboutHeader setLoading={setLocalLoading} refetch={refetchConfigs} uid={configs?.data?.uid} />}
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
                  Este texto será utilizado pelo Alldo para responder dúvidas dos clientes automaticamente. Seja claro, detalhado e inclua informações
                  relevantes sobre sua empresa, serviços, diferenciais e missão.
                </Typography>
                <Controller
                  name="about"
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
                      placeholder="Descreva aqui sobre sua empresa..."
                      error={!!errors.about}
                      helperText={errors.about?.message || `${aboutValue.length}/2000 caracteres`}
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

export default About;
