import { LinearProgress, styled, Tab, Tabs } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import ProfileHeader from './ProfileHeader';
import BasicInfosTab from './tabs/BasicInfosTab';
import { SyntheticEvent, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useUser from '@auth/useUser';
import { useGetUniqueUserQuery } from '@/store/api/userApi';
import PaymentInfosTab from './tabs/PaymentInfosTab';

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

/**
 * The Profile.
 */

const schema = z
  .object({
    uid: z.string(),
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
    cnpj: z.string().optional(),
    fantasyName: z.string().optional(),
    profileUpdate: z.boolean().optional(),
    paymentInfosUpdate: z.boolean().optional(),
    password: z.string().optional(),
    passwordConfirm: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Se qualquer campo de senha for preenchido, ambos são obrigatórios e devem ser iguais
    const senhaPreenchida = !!data.password && data.password.length > 0;
    const confirmPreenchida = !!data.passwordConfirm && data.passwordConfirm.length > 0;

    if (senhaPreenchida || confirmPreenchida) {
      if (!senhaPreenchida) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['password'],
          message: 'Por favor, crie uma senha.',
        });
      } else if (data.password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          path: ['password'],
          message: 'A senha deve ter no mínimo 8 caracteres.',
          minimum: 8,
          type: 'string',
          inclusive: true,
        });
      }

      if (!confirmPreenchida) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['passwordConfirm'],
          message: 'A confirmação de senha é obrigatória.',
        });
      }

      if (senhaPreenchida && confirmPreenchida && data.password !== data.passwordConfirm) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['passwordConfirm'],
          message: 'As senhas não coincidem.',
        });
      }
    }
  });

const defaultValues = {
  uid: '',
  name: '',
  phone: '',
  email: '',
  cpf: '',
  birthDate: '',
  cnpj: '',
  fantasyName: '',
  profileUpdate: false,
  paymentInfosUpdate: false,
  password: '',
  passwordConfirm: '',
};

type FormType = z.infer<typeof schema>;

function Profile() {
  const { data: user } = useUser();
  const [localLoading, setLocalLoading] = useState(false);

  const { data: userResponse, refetch: refetchUser, isLoading: isLoadingUser } = useGetUniqueUserQuery(user?.uid || '', { skip: !user?.uid });

  useEffect(() => {
    setLocalLoading(isLoadingUser);
  }, [isLoadingUser]);

  const methods = useForm<FormType>({
    mode: 'all',
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { reset } = methods;

  useEffect(() => {
    if (userResponse) {
      reset({
        uid: userResponse?.data.uid || '',
        name: userResponse?.data?.profile?.name || '',
        phone: userResponse?.data?.profile?.phone || '',
        email: userResponse?.data?.profile?.email || '',
        cpf: userResponse?.data?.profile?.cpf || '',
        birthDate: userResponse?.data?.profile?.birthDate || '',
        cnpj: userResponse?.data?.profile?.cnpj || '',
        fantasyName: userResponse?.data?.profile?.fantasyName || '',
        profileUpdate: false,
        paymentInfosUpdate: false,
        password: '',
        passwordConfirm: '',
      });
    }
  }, [userResponse, reset]);

  const [tabValue, setTabValue] = useState<string>('basic-info');

  function handleTabChange(event: SyntheticEvent, value: string) {
    setTabValue(value);
  }

  return (
    <FormProvider {...methods}>
      <Root
        header={
          <>
            {localLoading && (
              <div className="w-full">
                <LinearProgress color="secondary" />
              </div>
            )}
            {!isLoadingUser && <ProfileHeader refetch={refetchUser} setLoading={setLocalLoading} />}
          </>
        }
        content={
          <div className="flex flex-1 flex-col">
            {!isLoadingUser && (
              <div
                className="flex flex-1 flex-col overflow-x-auto overflow-y-hidden h-full w-full gap-6"
                style={{ backgroundColor: '#f4f4f4', padding: '20px' }}
              >
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example">
                  <Tab value="basic-info" label="Informações" />
                  {userResponse?.data?.collaborators.length === 0 && <Tab value="payment-info" label="Informações de pagamento" />}
                </Tabs>
                <div className="w-full h-full">
                  <div className={tabValue !== 'basic-info' ? 'hidden' : ''}>
                    <BasicInfosTab />
                  </div>
                  <div className={tabValue !== 'payment-info' ? 'hidden' : ''}>
                    <PaymentInfosTab />
                  </div>
                </div>
              </div>
            )}
          </div>
        }
        scroll={'content'}
      />
    </FormProvider>
  );
}

export default Profile;
