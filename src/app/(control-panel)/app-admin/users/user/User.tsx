import { LinearProgress, styled, Tab, Tabs } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { useParams } from 'react-router';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { SyntheticEvent, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import BasicInfosTab from './tabs/BasicInfosTab';
import UserHeader from './UserHeader';
import { useGetUniqueUserQuery } from '@/store/api/userApi';
import SubscriptionInfosTab from './tabs/SubscriptionInfosTab';
import ConfigsTab from './tabs/ConfigsTab';
import ConfigsSystemTab from './tabs/ConfigsSystemTab';

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
  enable: z.boolean(),
  profileUid: z.string(),
  partnerUid: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  profile: z.object({
    uid: z.string(),
    name: z.string().min(1, 'Nome obrigatório'),
    email: z.string().email('E-mail inválido').optional().or(z.literal('')),
    phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido'),
    cpf: z.string().max(14, { message: 'Digite um CPF válido' }).optional(),
    cnpj: z.string().nullable(),
    fantasyName: z.string().nullable(),
    birthDate: z.string().nullable(),
    avatar: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    addressUid: z.string().nullable(),
  }),
  subscriptions: z.array(
    z.object({
      uid: z.string(),
      userUid: z.string(),
      subscriptionUid: z.string(),
      paymentUid: z.string().nullable(),
      status: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
  ),
  _count: z.object({
    collaborators: z.number(),
    leads: z.number(),
    clients: z.number(),
  }),
  configs: z.array(
    z.object({
      uid: z.string(),
      userUid: z.string(),
      name: z.string(),
      key: z.string(),
      value: z.string(),
      data: z.string().nullable(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
  ),
});

const defaultValues = {
  uid: '',
  enable: false,
  profileUid: '',
  partnerUid: null,
  createdAt: '',
  updatedAt: '',
  profile: {
    uid: '',
    name: '',
    email: '',
    phone: '',
    cpf: '',
    cnpj: null,
    fantasyName: null,
    birthDate: null,
    avatar: null,
    createdAt: '',
    updatedAt: '',
    addressUid: null,
  },
  subscriptions: [],
  _count: {
    collaborators: 0,
    leads: 0,
    clients: 0,
  },
  configs: [],
};

type FormType = z.infer<typeof schema>;

/**
 * The User.
 */

function User() {
  const { uid } = useParams();
  const { data: userResp, isLoading: isLoadingUser, refetch: refetchUser } = useGetUniqueUserQuery(uid, { refetchOnMountOrArgChange: true });
  const [localLoading, setLocalLoading] = useState(false);

  const [tabValue, setTabValue] = useState<string>('basic-info');

  const methods = useForm<FormType>({
    mode: 'all',
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { reset } = methods;

  // Atualiza o form quando lead mudar
  useEffect(() => {
    if (userResp?.data) {
      reset({
        uid: userResp.data.uid || '',
        enable: userResp.data.enable ?? false,
        profileUid: userResp.data.profileUid || '',
        partnerUid: userResp.data.partnerUid ?? null,
        profile: {
          uid: userResp.data.profile?.uid || '',
          name: userResp.data.profile?.name || '',
          email: userResp.data.profile?.email || '',
          phone: userResp.data.profile?.phone || '',
          cpf: userResp.data.profile?.cpf || '',
          cnpj: userResp.data.profile?.cnpj ?? null,
          fantasyName: userResp.data.profile?.fantasyName ?? null,
          birthDate: userResp.data.profile?.birthDate ?? null,
          avatar: userResp.data.profile?.avatar ?? null,
          addressUid: userResp.data.profile?.addressUid ?? null,
        },
        subscriptions: userResp.data.subscriptions || [],
        _count: userResp.data._count || { collaborators: 0, leads: 0, clients: 0 },
        configs: userResp?.data?.configs || [],
      });
    }
  }, [userResp, reset]);

  function handleTabChange(event: SyntheticEvent, value: string) {
    setTabValue(value);
  }

  return (
    <FormProvider {...methods}>
      <Root
        scroll="content"
        header={
          <>
            {(isLoadingUser || localLoading) && (
              <div className="w-full">
                <LinearProgress color="secondary" />
              </div>
            )}
            {!isLoadingUser && <UserHeader setLoading={setLocalLoading} refetch={refetchUser} />}
          </>
        }
        content={
          <div className="flex flex-1 flex-col overflow-x-auto overflow-y-hidden h-full">
            {!isLoadingUser && (
              <div
                className="flex flex-1 flex-col overflow-x-auto overflow-y-hidden h-full w-full gap-6"
                style={{ backgroundColor: '#f4f4f4', padding: '20px' }}
              >
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example">
                  <Tab value="basic-info" label="Informações" />
                  <Tab value="subscription-info" label="Assinaturas" />
                  <Tab value="configs" label="Configurações" />
                  <Tab value="configs-system" label="Configurações do Sistema" />
                </Tabs>
                <div className="w-full h-full">
                  <div className={tabValue !== 'basic-info' ? 'hidden' : ''}>
                    <BasicInfosTab />
                  </div>
                  <div className={tabValue !== 'subscription-info' ? 'hidden' : ''}>
                    <SubscriptionInfosTab />
                  </div>
                  <div className={tabValue !== 'configs' ? 'hidden' : ''}>
                    <ConfigsTab />
                  </div>
                  <div className={tabValue !== 'configs-system' ? 'hidden' : ''}>
                    <ConfigsSystemTab />
                  </div>
                  {/* Adicione outros conteúdos de abas aqui */}
                </div>
              </div>
            )}
          </div>
        }
      />
    </FormProvider>
  );
}

export default User;
