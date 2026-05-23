import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { z } from 'zod';
import _ from 'lodash';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { CircularProgress } from '@mui/material';
import { useAppDispatch } from '@/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAuthRecoveryPasswordMutation } from '@/store/api/authApi';
import { useNavigate, useParams } from 'react-router';

/**
 * Form Validation Schema
 */
const schema = z
  .object({
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
    confirmPassword: z.string().min(6, 'Confirme a senha.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

type FormType = z.infer<typeof schema>;

const defaultValues: FormType = {
  password: '',
  confirmPassword: '',
};

function RecoveryPasswordTab() {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const { control, formState, handleSubmit, setValue } = useForm<FormType>({
    mode: 'onChange',
    defaultValues,
    resolver: zodResolver(schema),
  });
  const { isValid, dirtyFields, errors } = formState;

  const [recoveryPassword] = useAuthRecoveryPasswordMutation();

  function onSubmit(formData: FormType) {
    setIsLoading(true);
    recoveryPassword({
      password: formData.password,
      token,
    })
      .unwrap()
      .then((response) => {
        setIsLoading(false);
        dispatch(
          showMessage({
            message: response?.msg,
            autoHideDuration: 3000,
            variant: 'success',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
        setValue('password', '');
        setValue('confirmPassword', '');

        setTimeout(() => {
          navigate('/sign-in');
        }, 2000);
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(
          showMessage({
            message: error?.data?.msg,
            autoHideDuration: 3000,
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
      });
  }

  return (
    <form name="recoveryPasswordForm" noValidate className="mt-8 flex w-full flex-col justify-center" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            className="mb-6"
            label="Nova senha"
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
        name="confirmPassword"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            className="mb-6"
            label="Confirmar nova senha"
            type="password"
            error={!!errors.confirmPassword}
            helperText={errors?.confirmPassword?.message}
            variant="outlined"
            required
            fullWidth
          />
        )}
      />
      <Button
        variant="contained"
        color="secondary"
        className="mt-4 w-full"
        aria-label="Redefinir senha"
        disabled={_.isEmpty(dirtyFields) || !isValid || isLoading}
        type="submit"
        size="large"
      >
        {isLoading ? <CircularProgress size={24} /> : 'Redefinir senha'}
      </Button>
    </form>
  );
}

export default RecoveryPasswordTab;
