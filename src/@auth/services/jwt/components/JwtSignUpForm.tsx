import { Controller, useForm } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FetchApiError } from '@/utils/apiFetch';
import useJwtAuth from '../useJwtAuth';
import { useEffect, useState } from 'react';
import { CircularProgress, useTheme } from '@mui/material';
import { IMaskInput } from 'react-imask';
import { useAppDispatch } from '@/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useNavigate, useSearchParams } from 'react-router';
import { Box } from '@mui/system';
import { TermsDefaultModal } from '@/components/TermsDefaultModal';
import _ from 'lodash';
/**
 * Form Validation Schema
 */

const schema = z
  .object({
    name: z.string().nonempty('Por favor, insira seu nome completo.'),
    email: z.string().email('Insira um e-mail válido.').nonempty('O campo de e-mail é obrigatório.'),
    phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido'),
    mode: z.enum(['DEFAULT', 'OPTICO', 'ASSESSOR'] as const, {
      errorMap: () => ({ message: 'Modo de cadastro inválido.' }),
    }),
    subscription: z.string().optional(),
    // cpf: z
    //   .string()
    //   .nonempty({ message: 'Por favor, insira seu CPF.' })
    //   .max(14, { message: 'CPF inválido. Verifique o formato.' })
    //   .refine((cpf: string) => {
    //     if (typeof cpf !== 'string') return false;

    //     cpf = cpf.replace(/[^\d]+/g, '');

    //     if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;

    //     const cpfDigits = cpf.split('').map((el) => +el);
    //     const rest = (count: number): number => {
    //       return ((cpfDigits.slice(0, count - 12).reduce((soma, el, index) => soma + el * (count - index), 0) * 10) % 11) % 10;
    //     };
    //     return rest(10) === cpfDigits[9] && rest(11) === cpfDigits[10];
    //   }, 'CPF inválido. Verifique os números digitados.'),
    password: z.string().nonempty('Por favor, crie uma senha.').min(8, 'A senha deve ter no mínimo 8 caracteres.'),
    passwordConfirm: z.string().nonempty('A confirmação de senha é obrigatória.'),
    acceptTermsConditions: z.boolean().refine((val) => val === true, 'Você deve aceitar os termos e condições.'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'As senhas não coincidem.',
    path: ['passwordConfirm'],
  });

type FormType = z.infer<typeof schema>;

const defaultValues = {
  name: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirm: '',
  mode: 'DEFAULT' as const,
  subscription: '',
  acceptTermsConditions: false,
};

function JwtSignUpForm() {
  const { signUp } = useJwtAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const [searchParams] = useSearchParams();

  const { control, formState, handleSubmit, setError, reset, register, setValue } = useForm<FormType>({
    mode: 'onChange',
    defaultValues,
    resolver: zodResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;

  function onSubmit(formData: FormType) {
    const { name, email, password, phone, mode, subscription } = formData;
    setIsLoading(true);
    signUp({
      name,
      password,
      email,
      phone,
      mode,
      subscription: subscription,
    })
      .then((response) => {
        setIsLoading(false);
        dispatch(
          showMessage({
            message: 'Cadastro realizado com sucesso. Confirme seu e-mail para ativar a conta.',
            autoHideDuration: 6000,
            variant: 'success',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
        reset(defaultValues);
        setTimeout(() => {
          navigate('/sign-in');
        }, 2000);
      })
      .catch((error: FetchApiError) => {
        const errorData = error.data as {
          type: 'email' | 'password' | `root.${string}` | 'root';
          message: string;
        }[];
        console.log('Signup Error:', { error, errorData });
        dispatch(
          showMessage({
            message: errorData?.msg || 'Ocorreu um erro durante o cadastro. Por favor, tente novamente.',
            autoHideDuration: 3000,
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
        setIsLoading(false);
        errorData?.forEach?.(({ message, type }) => {
          setError(type, { type: 'manual', message });
        });
      });
  }

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  useEffect(() => {
    if (searchParams.get('mode')) {
      const mode = searchParams.get('mode') as 'DEFAULT' | 'OPTICO' | 'ASSESSOR';
      const subscriptionUid = searchParams.get('subscription');
      setValue('mode', mode, { shouldDirty: true });

      if (subscriptionUid) {
        setValue('subscription', subscriptionUid, { shouldDirty: true });
      }
    }
  }, [searchParams, setValue]);

  return (
    <form name="registerForm" noValidate className="mt-8 flex w-full flex-col justify-center" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            className="mb-6"
            label="Nome da empresa"
            autoFocus
            type="name"
            error={!!errors.name}
            helperText={errors?.name?.message}
            variant="outlined"
            required
            fullWidth
          />
        )}
      />

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            className="mb-6"
            label="E-mail"
            type="email"
            error={!!errors.email}
            helperText={errors?.email?.message}
            variant="outlined"
            required
            fullWidth
          />
        )}
      />

      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            InputProps={{
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              inputComponent: IMaskInput as any,
              inputProps: {
                mask: ['(00) 0000-0000', '(00) 00000-0000'],
                overwrite: true,
              },
            }}
            className="mb-6"
            label="Telefone"
            error={!!errors.phone}
            helperText={errors?.phone?.message}
            variant="outlined"
            required
            fullWidth
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            className="mb-6"
            label="Senha"
            type="password"
            error={!!errors.password}
            helperText={errors?.password?.message}
            variant="outlined"
            required
            fullWidth
          />
        )}
      />

      <Controller
        name="passwordConfirm"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            className="mb-6"
            label="Senha (Confirmar)"
            type="password"
            error={!!errors.passwordConfirm}
            helperText={errors?.passwordConfirm?.message}
            variant="outlined"
            required
            fullWidth
          />
        )}
      />

      <FormControlLabel
        control={<Checkbox {...register('acceptTermsConditions')} color="secondary" />}
        label={
          <Box component="span">
            Eu li e concordo com os{' '}
            <Box
              component="span"
              color={theme.palette.secondary.main}
              sx={{ textDecoration: 'underline', cursor: 'pointer' }}
              onClick={(event) => {
                event.preventDefault(); // Evita o comportamento padrão
                event.stopPropagation(); // Impede a propagação do clique para o checkbox
                handleOpen(); // Abre o modal de termos de uso
              }}
            >
              termos de uso
            </Box>
          </Box>
        }
      />

      <Button
        variant="contained"
        color="secondary"
        className="mt-6 w-full"
        aria-label="Register"
        disabled={_.isEmpty(dirtyFields) || !isValid || isLoading}
        type="submit"
        size="large"
      >
        {isLoading ? <CircularProgress size={24} /> : 'Criar Conta'}
      </Button>
      <TermsDefaultModal open={open} setOpen={setOpen} />
    </form>
  );
}

export default JwtSignUpForm;
