import { Box, Button, Tab, Tabs } from '@mui/material';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ConfirmationTab } from './tabs/ConfirmationTab';
import { PaymentTab } from './tabs/PaymentTab';
import { SignupTab } from './tabs/SignupTab';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Zod Schema de validação
const formSchema = z
  .object({
    subscriptionUid: z.string(),
    selectedPeriod: z.enum(['month', 'year']),
    name: z.string().min(1, 'Nome obrigatório'),
    email: z.string().email('E-mail inválido'),
    phone: z.string().min(1, 'Telefone obrigatório'),
    password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
    passwordConfirm: z.string().min(1, 'Confirmação de senha obrigatória'),
    acceptTermsConditions: z.boolean().refine((val) => val === true, 'Você deve aceitar os termos'),
    selectedPaymentMethod: z.enum(['credit_card', 'pix', 'boleto', 'trial']),
    holderName: z.string().optional(),
    number: z.string().optional(),
    expiryMonth: z.string().optional(),
    expiryYear: z.string().optional(),
    ccv: z.string().optional(),
    cpfCnpj: z
      .string()
      .optional()
      .refine(
        (value) => {
          if (!value) return true;

          const clean = value.replace(/\D/g, '');

          if (clean.length === 11) {
            if (/^(\d)\1{10}$/.test(clean)) return false;

            const cpfDigits = clean.split('').map(Number);
            const rest = (count: number) => ((cpfDigits.slice(0, count - 1).reduce((sum, el, idx) => sum + el * (count - idx), 0) * 10) % 11) % 10;

            return rest(10) === cpfDigits[9] && rest(11) === cpfDigits[10];
          }

          if (clean.length === 14) {
            if (/^(\d)\1{13}$/.test(clean)) return false;

            const cnpjDigits = clean.split('').map(Number);

            let sum = 0;
            let weight = 5;

            for (let i = 0; i < 12; i++) {
              sum += cnpjDigits[i] * weight;
              weight--;

              if (weight < 2) weight = 9;
            }

            const firstCheck = sum % 11 < 2 ? 0 : 11 - (sum % 11);

            if (firstCheck !== cnpjDigits[12]) return false;

            sum = 0;
            weight = 6;

            for (let i = 0; i < 13; i++) {
              sum += cnpjDigits[i] * weight;
              weight--;

              if (weight < 2) weight = 9;
            }

            const secondCheck = sum % 11 < 2 ? 0 : 11 - (sum % 11);

            return secondCheck === cnpjDigits[13];
          }

          return false;
        },
        { message: 'Digite um CPF ou CNPJ válido' },
      ),
    fullName: z.string().optional(),
    postalCode: z.string().optional(),
    addressNumber: z.string().optional(),
    addressComplement: z.string().optional(),
    cardAlias: z.string().optional(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'As senhas não correspondem',
    path: ['passwordConfirm'],
  })
  .superRefine((data, ctx) => {
    if (data.selectedPaymentMethod !== 'credit_card') return;

    if (!data.holderName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Nome impresso no cartão obrigatório', path: ['holderName'] });
    }

    if (!data.number) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Número do cartão obrigatório', path: ['number'] });
    }

    if (!data.expiryMonth) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Mês de vencimento obrigatório', path: ['expiryMonth'] });
    }

    if (!data.expiryYear) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Ano de vencimento obrigatório', path: ['expiryYear'] });
    }

    if (!data.ccv) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'CCV obrigatório', path: ['ccv'] });
    }

    if (!data.cpfCnpj) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'CPF ou CNPJ obrigatório', path: ['cpfCnpj'] });
    }

    if (!data.postalCode) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'CEP obrigatório', path: ['postalCode'] });
    }

    if (!data.addressNumber) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Número da residência obrigatório', path: ['addressNumber'] });
    }
  });

type FormSchemaType = z.infer<typeof formSchema>;
export type SubscriptionConfirmationFormData = FormSchemaType;

interface SubscriptionConfirmationProps {
  planTitle: string;
  monthlyPrice: string;
  yearlyPrice: string;
  totalYearlyPrice?: string;
  uid?: string;
  onPeriodSelect: (period: 'month' | 'year') => void;
  selectedPeriod: 'month' | 'year';
  onCancel: () => void;
  onConfirm?: (data: SubscriptionConfirmationFormData) => void | Promise<void>;
  isLoading?: boolean;
  onFormReady?: (resetFn: () => void) => void;
}

function SubscriptionConfirmation({
  planTitle,
  monthlyPrice,
  yearlyPrice,
  totalYearlyPrice: _totalYearlyPrice,
  uid: _uid,
  onPeriodSelect,
  selectedPeriod,
  onCancel,
  onConfirm,
  isLoading = false,
  onFormReady,
}: SubscriptionConfirmationProps) {
  const [tabValue, setTabValue] = useState(0);

  const {
    control,
    watch,
    reset,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      subscriptionUid: _uid || '',
      selectedPeriod,
      selectedPaymentMethod: 'credit_card',
      name: '',
      email: '',
      phone: '',
      password: '',
      passwordConfirm: '',
      acceptTermsConditions: false,
      holderName: '',
      number: '',
      expiryMonth: '',
      expiryYear: '',
      ccv: '',
      cpfCnpj: '',
      fullName: '',
      postalCode: '',
      addressNumber: '',
      addressComplement: '',
      cardAlias: '',
    },
  });

  useEffect(() => {
    onFormReady?.(() => reset());
  }, [onFormReady, reset]);

  const watchedValues = watch();
  const selectedPaymentMethod = watch('selectedPaymentMethod');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Verificar se cada aba está completa
  const isConfirmationComplete = !!watchedValues.selectedPeriod;
  const isSignupComplete =
    !!watchedValues.name &&
    !!watchedValues.email &&
    !!watchedValues.phone &&
    !!watchedValues.password &&
    !!watchedValues.passwordConfirm &&
    !!watchedValues.acceptTermsConditions &&
    !errors.passwordConfirm;

  const isPaymentComplete =
    selectedPaymentMethod !== 'credit_card' ||
    (!!watchedValues.holderName &&
      !!watchedValues.number &&
      !!watchedValues.expiryMonth &&
      !!watchedValues.expiryYear &&
      !!watchedValues.ccv &&
      !!watchedValues.cpfCnpj &&
      !!watchedValues.postalCode &&
      !!watchedValues.addressNumber);

  const onSubmit = (data: FormSchemaType) => {
    onConfirm?.(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box className="flex flex-col p-4">
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="subscription tabs">
          <Tab
            label={
              <Box className="flex items-center gap-2">
                {isConfirmationComplete ? (
                  <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
                ) : (
                  <RadioButtonUncheckedIcon sx={{ fontSize: 18 }} />
                )}
                <span>1. Confirmação</span>
              </Box>
            }
            id="tab-confirmation"
            aria-controls="tabpanel-confirmation"
          />
          <Tab
            label={
              <Box className="flex items-center gap-2">
                {isSignupComplete ? (
                  <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
                ) : (
                  <RadioButtonUncheckedIcon sx={{ fontSize: 18 }} />
                )}
                <span>2. Cadastro</span>
              </Box>
            }
            id="tab-signup"
            aria-controls="tabpanel-signup"
          />
          <Tab
            label={
              <Box className="flex items-center gap-2">
                {isPaymentComplete ? (
                  <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
                ) : (
                  <RadioButtonUncheckedIcon sx={{ fontSize: 18 }} />
                )}
                <span>3. Pagamento</span>
              </Box>
            }
            id="tab-payment"
            aria-controls="tabpanel-payment"
          />
        </Tabs>

        <Box role="tabpanel" id="tabpanel-confirmation" aria-labelledby="tab-confirmation">
          {tabValue === 0 && (
            <ConfirmationTab
              planTitle={planTitle}
              monthlyPrice={monthlyPrice}
              yearlyPrice={yearlyPrice}
              onPeriodSelect={(period) => {
                onPeriodSelect(period);
              }}
              selectedPeriod={watchedValues.selectedPeriod || selectedPeriod}
              control={control}
            />
          )}
        </Box>

        <Box role="tabpanel" id="tabpanel-signup" aria-labelledby="tab-signup">
          {tabValue === 1 && <SignupTab control={control} errors={errors} />}
        </Box>

        <Box role="tabpanel" id="tabpanel-payment" aria-labelledby="tab-payment">
          {tabValue === 2 && <PaymentTab selectedPaymentMethod={selectedPaymentMethod} control={control} errors={errors} watch={watch} />}
        </Box>

        <Box className="flex gap-3 mt-4">
          <Button variant="outlined" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            className="flex-1"
            disabled={isLoading || !isValid || !isConfirmationComplete || !isSignupComplete || !isPaymentComplete}
          >
            {isLoading ? 'Processando...' : 'Confirmar Assinatura'}
          </Button>
        </Box>
      </Box>
    </form>
  );
}

export default SubscriptionConfirmation;
