import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { LinearProgress, useTheme, Box } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import MessageTemplateForm from './MessageTemplateForm';
import MessageTemplateHeader from './MessageTemplateHeader';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .container': {
    maxWidth: '100%!important',
  },
  '& .FusePageSimple-header': {
    backgroundColor: theme.vars.palette.background.default,
    borderStyle: 'solid',
    borderColor: theme.vars.palette.divider,
  },
}));

const schema = z.object({
  uid: z.string().optional(),
  name: z.string().min(1, 'Nome é obrigatório'),
  category: z.enum(['MARKETING', 'UTILITY'], {
    required_error: 'Categoria é obrigatória',
  }),
  imageUrl: z.string().optional(),
  message: z.string().min(1, 'Mensagem é obrigatória'),
  enable: z.boolean().default(true),
});

const defaultValues = {
  uid: '',
  name: '',
  category: 'UTILITY' as const,
  message: '',
  enable: true,
  imageUrl: '',
};

type FormType = z.infer<typeof schema>;

function MessageTemplate() {
  const { uid } = useParams();
  const location = useLocation();
  const isView = location.state?.isView || false;
  const messageData = location.state?.message || null;
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const methods = useForm<FormType>({
    mode: 'all',
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { reset } = methods;

  useEffect(() => {
    if (messageData && uid !== 'new') {
      reset(messageData);
    }
  }, [uid, reset]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, []);

  return (
    <FormProvider {...methods}>
      <Root
        scroll="content"
        header={
          <>
            {loading && (
              <Box sx={{ width: '100%' }}>
                <LinearProgress color="secondary" />
              </Box>
            )}
            {!loading && <MessageTemplateHeader setLoading={setLoading} />}
          </>
        }
        content={
          <Box
            sx={{
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              height: '100%',
              backgroundColor: 'background.default',
            }}
          >
            {!loading && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,

                  height: '100%',
                  width: '100%',
                  gap: 3,
                  backgroundColor: theme.palette.background.default,
                  p: 2.5,
                }}
              >
                <MessageTemplateForm viewOnly={isView} />
              </Box>
            )}
          </Box>
        }
      />
    </FormProvider>
  );
}

export default MessageTemplate;
