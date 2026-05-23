import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { z } from 'zod';
import _ from 'lodash';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@fuse/core/Link';
import Button from '@mui/material/Button';
import useJwtAuth from '../useJwtAuth';
import { FetchApiError } from '@/utils/apiFetch';
import { CircularProgress } from '@mui/material';
import { useAppDispatch } from '@/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';

/**
 * Form Validation Schema
 */
const schema = z.object({
  email: z.string().nonempty('O e-mail é obrigatório.').email('Digite um e-mail válido.'),
  password: z.string().nonempty('A senha é obrigatória.').min(4, 'A senha deve ter pelo menos 4 caracteres.'),
  remember: z.boolean().optional(),
});

type FormType = z.infer<typeof schema>;

const defaultValues: FormType = {
  email: '',
  password: '',
  remember: false,
};

function JwtSignInForm() {
  const { signIn } = useJwtAuth();
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useAppDispatch();

  const { control, formState, handleSubmit, setValue, setError } = useForm<FormType>({
    mode: 'onChange',
    defaultValues,
    resolver: zodResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;

  function onSubmit(formData: FormType) {
    const { email, password, remember } = formData;
    setIsLoading(true);

    signIn({
      email,
      password,
      remember,
    })
      .then((response) => {
        setIsLoading(false);
        dispatch(
          showMessage({
            message: 'Login realizado com sucesso!',
            autoHideDuration: 3000,
            variant: 'success',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
      })
      .catch((error: FetchApiError) => {
        const errorData = error.data as {
          type: 'email' | 'password' | 'remember' | `root.${string}` | 'root';
          msg: string;
        }[];
        setIsLoading(false);
        dispatch(
          showMessage({
            message: (error?.data as { msg: string })?.msg,
            autoHideDuration: 3000,
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
        errorData?.forEach?.((err) => {
          setError(err.type, {
            type: 'manual',
            message: err.msg,
          });
        });
      });
  }

  return (
    <form name="loginForm" noValidate className="mt-8 flex w-full flex-col justify-center" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            className="mb-6"
            label="E-mail"
            autoFocus
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

      <div className="flex flex-col items-center justify-center sm:flex-row sm:justify-between">
        <Controller
          name="remember"
          control={control}
          render={({ field }) => (
            <FormControl>
              <FormControlLabel label="Manter conectado" control={<Checkbox size="small" {...field} />} />
            </FormControl>
          )}
        />

        <Link className="text-md font-medium" to="/forgot-password">
          Esqueceu sua senha?
        </Link>
      </div>

      <Button
        variant="contained"
        color="secondary"
        className=" mt-4 w-full"
        aria-label="Sign in"
        disabled={_.isEmpty(dirtyFields) || !isValid || isLoading}
        type="submit"
        size="large"
      >
        {isLoading ? <CircularProgress size={24} /> : 'Entrar'}
      </Button>
    </form>
  );
}

export default JwtSignInForm;
