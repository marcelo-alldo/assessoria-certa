import { LinearProgress, styled, Tab, Tabs, TextField } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { useParams } from 'react-router';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { SyntheticEvent, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import BasicInfosTab from './tabs/BasicInfosTab';
import { useGetClientsQuery } from '../../../../../store/api/clientsApi';
import ClientHeader from './ClientHeader';
import DocumentTab from './tabs/DocumentTab';
import AddressTab from './tabs/AddressTab';
import HistoryNotesTab from './tabs/HistoryNotesTab';

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
  archived: z.boolean().optional(),
  profileUpdate: z.boolean().optional(),
  name: z.string().min(1, 'Nome obrigatório'),
  phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  cpf: z
    .string()
    .max(14, { message: 'Digite um CPF válido' })
    .optional()
    .refine(
      (cpf) => {
        if (!cpf) return true;

        const cleanCpf = cpf.replace(/[^\d]+/g, '');

        if (cleanCpf.length === 0) return true;

        if (cleanCpf.length !== 11 || !!cleanCpf.match(/(\d)\1{10}/)) return false;

        const cpfDigits = cleanCpf.split('').map(Number);
        const rest = (count: number) => ((cpfDigits.slice(0, count - 1).reduce((sum, el, idx) => sum + el * (count - idx), 0) * 10) % 11) % 10;
        return rest(10) === cpfDigits[9] && rest(11) === cpfDigits[10];
      },
      { message: 'Digite um CPF válido' },
    ),
  birthDate: z.string().optional(),
  lastPurchase: z.string().optional(),
  notes: z.string().optional(),
  summary: z.string().optional(),
  cnpj: z
    .string()
    .optional()
    .refine((cnpj: string | undefined) => {
      if (!cnpj) return true;

      cnpj = cnpj.replace(/[^\d]+/g, '');

      if (cnpj.length === 0) return true;

      if (cnpj.length !== 14) return false;

      const cnpjDigits = cnpj.split('').map((el) => +el);
      const validate = (cnpj: number[]) => {
        const length = cnpj.length - 2;
        const numbers = cnpj.slice(0, length);
        const digits = cnpj.slice(length);
        const sum = (numbers: number[], weights: number[]) => numbers.reduce((acc, num, idx) => acc + num * weights[idx], 0);
        const calc = (sum: number) => (sum % 11 < 2 ? 0 : 11 - (sum % 11));
        const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const digit1 = calc(sum(numbers, weights1));
        const digit2 = calc(sum([...numbers, digit1], weights2));
        return digit1 === digits[0] && digit2 === digits[1];
      };
      return validate(cnpjDigits);
    }, 'Digite um CNPJ válido'),
  fantasyName: z.string().optional(),
  addressUpdate: z.boolean().optional(),
  address: z.string().optional(),
  complement: z.string().optional(),
  cityUid: z.string().optional(),
  stateUid: z.string().optional(),
  latitude: z.union([z.string(), z.number()]).optional(),
  longitude: z.union([z.string(), z.number()]).optional(),
  neighborhood: z.string().optional(),
  number: z.string().optional(),
  zipCode: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true;

        // Aceita 8 dígitos com ou sem hífen
        return /^\d{5}-?\d{3}$/.test(val);
      },
      { message: 'CEP inválido' },
    ),
  documentUpdate: z.boolean().optional(),
  enterprise: z.boolean().optional(),
});

const defaultValues = {
  uid: '',
  enable: true,
  archived: false,
  profileUpdate: false,
  name: '',
  phone: '',
  email: '',
  cpf: '',
  birthDate: '',
  lastPurchase: '',
  notes: '',
  summary: '',
  cnpj: '',
  fantasyName: '',
  addressUpdate: false,
  address: '',
  complement: '',
  cityUid: '',
  stateUid: '',
  latitude: '',
  longitude: '',
  neighborhood: '',
  number: '',
  zipCode: '',
  documentUpdate: false,
  enterprise: false,
};

type FormType = z.infer<typeof schema>;

/**
 * The Client.
 */

function Client() {
  const { uid } = useParams();
  const {
    data: clientResp,
    isLoading: isLoadingClient,
    refetch: refetchClient,
  } = useGetClientsQuery(`uid=${uid}`, { refetchOnMountOrArgChange: true, skip: uid === 'new' });

  const [tabValue, setTabValue] = useState<string>('basic-info');
  const [localLoading, setLocalLoading] = useState(false);

  // Garante que client é sempre um objeto único
  let client = undefined;

  if (Array.isArray(clientResp?.data)) {
    client = clientResp.data.find((l) => String(l.uid) === String(uid));
  } else if (clientResp?.data && typeof clientResp.data === 'object') {
    client = clientResp.data;
  }

  const methods = useForm<FormType>({
    mode: 'all',
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { reset } = methods;

  // Atualiza o form quando client mudar
  useEffect(() => {
    if (client) {
      reset({
        uid: client?.uid || '',
        enable: client?.enable || false,
        archived: !!client?.archived,
        profileUpdate: false,
        name: client?.clientProfile?.name || '',
        phone: client?.clientProfile?.phone || '',
        email: client?.clientProfile?.email || '',
        cpf: client?.clientProfile?.cpf || '',
        birthDate: client?.clientProfile?.birthDate || '',
        lastPurchase: client?.lastPurchase || '',
        cnpj: client?.clientProfile?.cnpj || '',
        summary: client?.clientProfile?.summary || '',
        notes: client?.clientProfile?.notes || '',
        fantasyName: client?.clientProfile?.fantasyName || '',
        addressUpdate: false,
        address: client?.address?.address || '',
        complement: client?.address?.complement || '',
        cityUid: client?.address?.cityUid || '',
        stateUid: client?.address?.city?.stateUid || '',
        latitude: client?.address?.latitude || '',
        longitude: client?.address?.longitude || '',
        neighborhood: client?.address?.neighborhood || '',
        number: client?.address?.number || '',
        zipCode: client?.address?.zipCode || '',
        documentUpdate: false,
        enterprise: client?.enterprise || false,
      });
    }
  }, [client, reset]);

  function handleTabChange(event: SyntheticEvent, value: string) {
    setTabValue(value);
  }

  return (
    <FormProvider {...methods}>
      <Root
        scroll="content"
        header={
          <>
            {(isLoadingClient || localLoading) && (
              <div className="w-full">
                <LinearProgress color="secondary" />
              </div>
            )}

            {!isLoadingClient && <ClientHeader refetch={refetchClient} setLoading={setLocalLoading} />}
          </>
        }
        content={
          <div className="flex flex-1 flex-col">
            {!isLoadingClient && (
              <div className="flex flex-1 flex-col h-full w-full gap-6" style={{ backgroundColor: '#f4f4f4', padding: '20px' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example">
                  <Tab value="basic-info" label="Informações" />
                  <Tab value="address" label="Endereço" />
                  <Tab value="history-notes" label="Histórico e Anotações" />
                  {/* <Tab value="documents" label="Documentos" /> */}
                </Tabs>
                <div className="w-full h-full">
                  <div className={tabValue !== 'basic-info' ? 'hidden' : ''}>
                    <div className="flex max-w-xl pb-4">
                      <TextField label="Etapa Atual" value={client?.step?.name || ''} disabled fullWidth InputLabelProps={{ shrink: true }} />
                    </div>
                    <BasicInfosTab />
                  </div>
                  <div className={tabValue !== 'address' ? 'hidden' : ''}>
                    <AddressTab setLoading={setLocalLoading} />
                  </div>
                  <div className={tabValue !== 'documents' ? 'hidden' : ''}>
                    <DocumentTab />
                  </div>
                  <div className={tabValue !== 'history-notes' ? 'hidden' : ''}>
                    <HistoryNotesTab historyNotes={client?.historyNotes} />
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

export default Client;
