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
import { useAuthForgotPasswordMutation } from '@/store/api/authApi';

/**
 * Form Validation Schema
 */
const schema = z.object({
  email: z.string().nonempty('O e-mail é obrigatório.').email('Digite um e-mail válido.'),
});

type FormType = z.infer<typeof schema>;

const defaultValues: FormType = {
  email: '',
};

function ForgotPasswordTab() {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const { control, formState, handleSubmit, setError, setValue } = useForm<FormType>({
    mode: 'onChange',
    defaultValues,
    resolver: zodResolver(schema),
  });
  const { isValid, dirtyFields, errors } = formState;

  const [forgotPassword] = useAuthForgotPasswordMutation();

  function onSubmit(formData: FormType) {
    setIsLoading(true);
    forgotPassword(formData.email)
      .then((response) => {
        setIsLoading(false);
        setValue('email', '');
        dispatch(
          showMessage({
            message: response?.data?.msg,
            autoHideDuration: 3000,
            variant: 'success',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
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
    <form name="forgotPasswordForm" noValidate className="mt-8 flex w-full flex-col justify-center" onSubmit={handleSubmit(onSubmit)}>
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
      <Button
        variant="contained"
        color="secondary"
        className="mt-4 w-full"
        aria-label="Enviar"
        disabled={_.isEmpty(dirtyFields) || !isValid || isLoading}
        type="submit"
        size="large"
      >
        {isLoading ? <CircularProgress size={24} /> : 'Enviar e-mail de recuperação'}
      </Button>
    </form>
  );
}

export default ForgotPasswordTab;
