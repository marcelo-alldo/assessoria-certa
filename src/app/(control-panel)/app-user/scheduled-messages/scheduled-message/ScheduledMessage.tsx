import { LinearProgress, styled, Tab, Tabs, Box } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { useParams } from 'react-router';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { SyntheticEvent, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import BasicInfosTab from './tabs/BasicInfosTab';
import { ScheduledMessagesResponse, useGetScheduledMessageQuery } from '../scheduledMessagesApi';
import RecipientsTab from './tabs/RecipientsTab';
import ScheduledMessageHeader from './ScheduledMessageHeader';
import ClientsTab from './tabs/ClientsTab';
import LeadsTab from './tabs/LeadsTab';
import { format } from 'date-fns';
import { useGetMessageTemplatesQuery } from '../../message-templates/messageTemplatesApi';

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
  uid: z.string(),
  enable: z.boolean().optional(),
  recipientsUpdate: z.boolean(),
  selectedsRecipients: z.array(
    z.object({
      remoteJid: z.string(),
      name: z.string(),
      clientUid: z.string().optional(),
      leadUid: z.string().optional(),
      alldo: z.boolean().default(true),
    }),
  ),
  removedRecipients: z.array(z.string()).optional(),
  newRecipients: z
    .array(
      z.object({
        remoteJid: z.string(),
        name: z.string(),
        clientUid: z.string().optional(),
        leadUid: z.string().optional(),
        alldo: z.boolean().default(true),
      }),
    )
    .optional(),
  selectedTemplate: z
    .object({
      uid: z.string(),
      name: z.string(),
      message: z.string(),
      category: z.string(),
    })
    .optional(),
  messageTemplateUid: z.string().optional(),
  title: z.string().min(1, 'Título obrigatório'),
  imageUrl: z.string().optional(),
  message: z.string().min(2, 'Mensagem obrigatório'),
  sentAt: z.string(),
  clientsRecipientsCount: z.number().optional(),
  leadsRecipientsCount: z.number().optional(),
  recipientsCount: z.number().optional(),
});

const defaultValues = {
  uid: '',
  enable: false,
  recipientsUpdate: false,
  selectedsRecipients: [],
  removedRecipients: [],
  newRecipients: [],
  selectedTemplate: null,
  messageTemplateUid: '',
  title: '',
  imageUrl: '',
  message: '',
  sentAt: '',
  clientsRecipientsCount: 0,
  leadsRecipientsCount: 0,
  recipientsCount: 0,
};

type FormType = z.infer<typeof schema>;

/**
 * The ScheduledMessage.
 */

function ScheduledMessage() {
  const { uid } = useParams();

  const {
    data: messageResponse,
    isLoading: isLoadingMessage,
    refetch: refetchMessage,
  } = useGetScheduledMessageQuery(`uid=${uid}`, { refetchOnMountOrArgChange: true, skip: uid === 'new' });

  // Buscar templates para carregar o template selecionado
  const { data: templatesResponse } = useGetMessageTemplatesQuery('enable=true&pageSize=1000');

  const [tabValue, setTabValue] = useState<string>('basic-info');
  const [localLoading, setLocalLoading] = useState(false);
  const [changeRecipients, setChangeRecipients] = useState(false);

  // Estados para as páginas de cada tab
  const [recipientsPage, setRecipientsPage] = useState(1);
  const [leadsPage, setLeadsPage] = useState(1);
  const [clientsPage, setClientsPage] = useState(1);

  const methods = useForm<FormType>({
    mode: 'all',
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { reset } = methods;

  let message = undefined;

  if (Array.isArray(messageResponse?.data)) {
    message = messageResponse.data.find((l) => String(l.uid) === String(uid));
  } else if (messageResponse?.data && typeof messageResponse.data === 'object') {
    message = messageResponse.data;
  }

  // Atualiza o form quando message mudar
  useEffect(() => {
    if (message) {
      // Buscar o template correspondente se existir messageTemplateUid
      let selectedTemplate = null;

      if (message.messageTemplateUid && templatesResponse?.data) {
        selectedTemplate = templatesResponse.data.find((template) => template.uid === message.messageTemplateUid);
      }

      reset({
        uid: message.uid || '',
        enable: message.enable,
        recipientsUpdate: false,
        selectedTemplate: selectedTemplate || null,
        messageTemplateUid: message.messageTemplateUid || '',
        title: message.title || '',
        imageUrl: message?.messageTemplate?.imageUrl || '',
        message: message.message || '',
        sentAt: message.sendAt ? format(new Date(message.sendAt), 'yyyy-MM-dd HH:mm:ss') : '',
        clientsRecipientsCount: (messageResponse as ScheduledMessagesResponse)?.clientsRecipientsCount || 0,
        leadsRecipientsCount: (messageResponse as ScheduledMessagesResponse)?.leadsRecipientsCount || 0,
        recipientsCount: (messageResponse as ScheduledMessagesResponse)?.recipientsCount || 0,
      });
    }
  }, [message, messageResponse, templatesResponse, reset]);

  function handleTabChange(event: SyntheticEvent, value: string) {
    setTabValue(value);
  }

  return (
    <FormProvider {...methods}>
      <Root
        scroll="content"
        header={
          <>
            {(isLoadingMessage || localLoading) && (
              <Box sx={{ width: '100%' }}>
                <LinearProgress color="secondary" />
              </Box>
            )}

            {!isLoadingMessage && (
              <ScheduledMessageHeader
                refetch={refetchMessage}
                setLoading={setLocalLoading}
                changeRecipients={changeRecipients}
                recipientsPage={recipientsPage}
                leadsPage={leadsPage}
                clientsPage={clientsPage}
              />
            )}
          </>
        }
        content={
          <Box
            sx={{
              display: 'flex',
              flex: 1,
              flexDirection: 'column',

              backgroundColor: 'background.default',
            }}
          >
            {!isLoadingMessage && (
              <Box
                sx={{
                  display: 'flex',
                  flex: 1,
                  flexDirection: 'column',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  height: '100%',
                  width: '100%',
                  gap: 3,
                  backgroundColor: 'background.paper',
                  padding: 2.5,
                }}
              >
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example">
                  <Tab value="basic-info" label="Informações" />
                  <Tab value="clients" label="Clientes" />
                  <Tab value="leads" label="Leads" />
                  <Tab value="recipients" label="Outros contatos" />
                </Tabs>
                <Box sx={{ width: '100%', height: '100%' }}>
                  <Box sx={{ display: tabValue !== 'basic-info' ? 'none' : 'block', width: '100%', height: '100%' }}>
                    <BasicInfosTab />
                  </Box>
                  <Box sx={{ display: tabValue !== 'clients' ? 'none' : 'block', width: '100%', height: '100%' }}>
                    <ClientsTab changeRecipients={setChangeRecipients} page={clientsPage} setPage={setClientsPage} />
                  </Box>
                  <Box sx={{ display: tabValue !== 'leads' ? 'none' : 'block', width: '100%', height: '100%' }}>
                    <LeadsTab changeRecipients={setChangeRecipients} page={leadsPage} setPage={setLeadsPage} />
                  </Box>
                  <Box sx={{ display: tabValue !== 'recipients' ? 'none' : 'block', width: '100%', height: '100%' }}>
                    <RecipientsTab changeRecipients={setChangeRecipients} page={recipientsPage} setPage={setRecipientsPage} />
                  </Box>
                  {/* Adicione outros conteúdos de abas aqui */}
                </Box>
              </Box>
            )}
          </Box>
        }
      />
    </FormProvider>
  );
}

export default ScheduledMessage;
