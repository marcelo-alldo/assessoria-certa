import { LinearProgress, styled, Tab, Tabs, TextField } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import LeadHeader from './LeadHeader';
import { useGetLeadsQuery } from '@/store/api/leadsApi';
import { useParams } from 'react-router';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { SyntheticEvent, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import BasicInfosTab from './tabs/BasicInfosTab';
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
  name: z.string().min(1, 'Nome obrigatório'),
  phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  archived: z.boolean().optional(),
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
  summary: z.string().optional(),
  notes: z.string().optional(),
  stepUid: z.string().optional(),
});

const defaultValues = {
  uid: '',
  name: '',
  phone: '',
  email: '',
  archived: false,
  cpf: '',
  summary: '',
  notes: '',
  stepUid: '',
};

type FormType = z.infer<typeof schema>;

/**
 * The leads.
 */

function Lead() {
  const { uid } = useParams();
  const { data: leadResp, isLoading: isLoadingLead, refetch: refetchLead } = useGetLeadsQuery(`uid=${uid}`, { refetchOnMountOrArgChange: true });
  const [localLoading, setLocalLoading] = useState(false);

  const [tabValue, setTabValue] = useState<string>('basic-info');

  // Garante que lead é sempre um objeto único
  let lead = undefined;

  if (Array.isArray(leadResp?.data)) {
    lead = leadResp.data.find((l) => String(l.uid) === String(uid));
  } else if (leadResp?.data && typeof leadResp.data === 'object') {
    lead = leadResp.data;
  }

  const methods = useForm<FormType>({
    mode: 'all',
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { reset } = methods;

  // Atualiza o form quando lead mudar
  useEffect(() => {
    if (lead) {
      reset({
        uid: lead.uid || '',
        name: lead.name || '',
        phone: lead.phone || '',
        email: lead.email || '',
        archived: !!lead.archived,
        cpf: lead.cpf || '',
        summary: lead.summary || '',
        notes: lead.notes || '',
        stepUid: lead.stepUid || '',
      });
    }
  }, [lead, reset]);

  function handleTabChange(event: SyntheticEvent, value: string) {
    setTabValue(value);
  }

  return (
    <FormProvider {...methods}>
      <Root
        scroll="content"
        header={
          <>
            {(isLoadingLead || localLoading) && (
              <div className="w-full">
                <LinearProgress color="secondary" />
              </div>
            )}
            {!isLoadingLead && <LeadHeader setLoading={setLocalLoading} refetch={refetchLead} />}
          </>
        }
        content={
          <div className="flex flex-1 flex-col">
            {!isLoadingLead && (
              <div className="flex flex-1 flex-col h-full w-full gap-6" style={{ backgroundColor: '#f4f4f4', padding: '20px' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example">
                  <Tab value="basic-info" label="Informações" />
                  <Tab value="history-notes" label="Histórico e Anotações" />
                </Tabs>

                <div className="w-full h-full">
                  <div className={tabValue !== 'basic-info' ? 'hidden' : ''}>
                    <div className="flex max-w-xl pb-4">
                      <TextField label="Etapa Atual" value={lead.step.name} disabled fullWidth InputLabelProps={{ shrink: true }} />
                    </div>
                    <BasicInfosTab />
                  </div>
                  <div className={tabValue !== 'history-notes' ? 'hidden' : ''}>
                    <HistoryNotesTab historyNotes={lead.historyNotes} />
                  </div>
                </div>
              </div>
            )}
          </div>
        }
      />
    </FormProvider>
  );
}

export default Lead;
