import { LinearProgress, styled, Tab, Tabs } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { useParams } from 'react-router';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { SyntheticEvent, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import BasicInfosTab from './tabs/BasicInfosTab';
import { useGetCollaboratorsQuery } from '../collaboratorsApi';
import CollaboratorHeader from './CollaboratorHeader';

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
  email: z.string().email('E-mail inválido'),
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
  enable: z.boolean().optional(),
});

const defaultValues = {
  uid: '',
  name: '',
  phone: '',
  email: '',
  cpf: '',
  birthDate: '',
  enable: false,
};

type FormType = z.infer<typeof schema>;

/**
 * The collaborator.
 */

function Collaborator() {
  const { uid } = useParams();
  const {
    data: collaboratorData,
    isLoading: isLoadingCollaborator,
    refetch: refetchCollaborator,
  } = useGetCollaboratorsQuery(`uid=${uid}`, { refetchOnMountOrArgChange: true });

  const [tabValue, setTabValue] = useState<string>('basic-info');

  const [localLoading, setLocalLoading] = useState(false);

  let collaborator = undefined;

  if (Array.isArray(collaboratorData?.data)) {
    collaborator = collaboratorData.data.find((l) => String(l.uid) === String(uid));
  } else if (collaboratorData?.data && typeof collaboratorData.data === 'object') {
    collaborator = collaboratorData.data;
  }

  const methods = useForm<FormType>({
    mode: 'all',
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { reset } = methods;

  useEffect(() => {
    if (collaborator) {
      reset({
        uid: collaborator.uid || '',
        name: collaborator.user.profile.name || '',
        phone: collaborator.user.profile.phone || '',
        email: collaborator.user.profile.email || '',
        cpf: collaborator.user.profile.cpf || '',
        enable: collaborator.enable,
        birthDate: collaborator.user.profile.birthDate || '',
      });
    }
  }, [collaborator, reset]);

  function handleTabChange(event: SyntheticEvent, value: string) {
    setTabValue(value);
  }

  return (
    <FormProvider {...methods}>
      <Root
        header={
          <>
            {(isLoadingCollaborator || localLoading) && (
              <div className="w-full">
                <LinearProgress color="secondary" />
              </div>
            )}

            {!isLoadingCollaborator && <CollaboratorHeader setLoading={setLocalLoading} refetch={refetchCollaborator} />}
          </>
        }
        content={
          <div className="flex flex-1 flex-col overflow-x-auto overflow-y-hidden h-full">
            {!isLoadingCollaborator && (
              <div
                className="flex flex-1 flex-col overflow-x-auto overflow-y-hidden h-full w-full gap-6"
                style={{ backgroundColor: '#f4f4f4', padding: '20px' }}
              >
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example">
                  <Tab value="basic-info" label="Informações" />
                </Tabs>
                <div className="w-full h-full">
                  <div className={tabValue !== 'basic-info' ? 'hidden' : ''}>
                    <BasicInfosTab />
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

export default Collaborator;
