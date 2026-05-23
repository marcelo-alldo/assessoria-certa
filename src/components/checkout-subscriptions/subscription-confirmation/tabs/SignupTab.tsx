import { Controller, FieldErrors, Control, FieldValues } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Box, Typography, useTheme } from '@mui/material';
import { IMaskInput } from 'react-imask';
import type { ElementType } from 'react';

interface SignupTabProps {
  control: Control<FieldValues>;
  errors: FieldErrors<FieldValues>;
}

export function SignupTab({ control, errors }: SignupTabProps) {
  const theme = useTheme();

  return (
    <Box className=" flex w-full flex-col justify-center">
      <Box className="text-center mt-2 mb-6">
        <Typography variant="h5" className="font-bold mb-2">
          Cadastre-se
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Preencha seus dados para criar <strong>sua conta</strong>
        </Typography>
      </Box>

      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            className="mb-6"
            label="Nome da empresa"
            autoFocus
            type="text"
            error={!!errors.name}
            helperText={(errors?.name?.message as string) || ''}
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
            helperText={(errors?.email?.message as string) || ''}
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
              inputComponent: IMaskInput as unknown as ElementType,
              inputProps: {
                mask: ['(00) 0000-0000', '(00) 00000-0000'],
                overwrite: true,
              },
            }}
            className="mb-6"
            label="Telefone"
            error={!!errors.phone}
            helperText={(errors?.phone?.message as string) || ''}
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
            helperText={(errors?.password?.message as string) || ''}
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
            helperText={(errors?.passwordConfirm?.message as string) || ''}
            variant="outlined"
            required
            fullWidth
          />
        )}
      />

      <Controller
        name="acceptTermsConditions"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Checkbox color="secondary" {...field} />}
            label={
              <Box component="span">
                Eu li e concordo com os{' '}
                <Box
                  component="span"
                  sx={{
                    color: theme.palette.secondary.main,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Termos de uso
                </Box>
              </Box>
            }
          />
        )}
      />
    </Box>
  );
}
