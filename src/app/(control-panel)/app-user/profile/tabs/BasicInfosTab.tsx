import { TextField, Typography } from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { useLocation } from 'react-router';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';

function BasicInfosTab() {
  const { register, formState, control, setValue } = useFormContext();
  // Helper para garantir que só string vai para helperText
  const getHelperText = (field) => (typeof field?.message === 'string' ? field.message : undefined);
  const { state } = useLocation();

  // Sempre que qualquer campo for alterado, seta profileUpdate para true
  const handleFieldChange = (fieldOnChange) => (value) => {
    setValue('profileUpdate', true, { shouldDirty: false });
    fieldOnChange(value);
  };

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <TextField
        label="Nome"
        {...register('name', {
          onChange: () => setValue('profileUpdate', true, { shouldDirty: false }),
        })}
        required
        disabled={state?.isView}
        error={!!formState.errors.name}
        helperText={getHelperText(formState.errors.name)}
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <TextField
            label="Telefone"
            error={!!formState.errors.phone}
            required
            disabled={state?.isView}
            helperText={getHelperText(formState.errors.phone)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            InputProps={{
              inputComponent: IMaskInput,
              inputProps: {
                mask: ['(00) 0000-0000', '(00) 00000-0000'],
                overwrite: true,
              },
            }}
            {...field}
            onChange={(e) => handleFieldChange(field.onChange)(e.target.value)}
          />
        )}
      />
      <TextField
        label="E-mail"
        {...register('email', {
          onChange: () => setValue('profileUpdate', true, { shouldDirty: false }),
        })}
        error={!!formState.errors.email}
        disabled
        helperText={getHelperText(formState.errors.email)}
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
      <Controller
        name="cpf"
        control={control}
        render={({ field }) => (
          <TextField
            label="CPF"
            error={!!formState.errors.cpf}
            helperText={getHelperText(formState.errors.cpf)}
            fullWidth
            disabled={state?.isView}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              inputComponent: IMaskInput,
              inputProps: {
                mask: '000.000.000-00',
                overwrite: true,
              },
            }}
            {...field}
            onChange={(e) => handleFieldChange(field.onChange)(e.target.value)}
          />
        )}
      />
      <Controller
        name="birthDate"
        control={control}
        render={({ field }) => (
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <DatePicker
              label="Data de Nascimento"
              value={field.value ? (typeof field.value === 'string' ? (field.value ? new Date(field.value) : null) : field.value) : null}
              onChange={(date) => {
                // Converte para string yyyy-MM-dd ou ''
                const str = date instanceof Date && !isNaN(date.getTime()) ? format(date, 'yyyy-MM-dd') : '';
                handleFieldChange(field.onChange)(str);
              }}
              sx={{ bgcolor: 'white' }}
              maxDate={new Date()}
              disabled={state?.isView}
            />
          </LocalizationProvider>
        )}
      />
      <Controller
        name="cnpj"
        control={control}
        render={({ field }) => (
          <TextField
            label="CNPJ"
            error={!!formState.errors.cnpj}
            helperText={getHelperText(formState.errors.cnpj)}
            fullWidth
            disabled={state?.isView}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              inputComponent: IMaskInput,
              inputProps: {
                mask: '00.000.000/0000-00',
                overwrite: true,
              },
            }}
            {...field}
            onChange={(e) => handleFieldChange(field.onChange)(e.target.value)}
          />
        )}
      />
      <TextField
        label="Nome Fantasia"
        {...register('fantasyName', {
          onChange: () => setValue('profileUpdate', true, { shouldDirty: false }),
        })}
        error={!!formState.errors.fantasyName}
        helperText={getHelperText(formState.errors.fantasyName)}
        fullWidth
        disabled={state?.isView}
        InputLabelProps={{ shrink: true }}
      />

      <Typography>Alterar senha</Typography>
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Senha"
            type="password"
            error={!!formState?.errors.password}
            helperText={getHelperText(formState?.errors?.password)}
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
            label="Senha (Confirmar)"
            type="password"
            error={!!formState?.errors.passwordConfirm}
            helperText={getHelperText(formState?.errors?.passwordConfirm)}
            variant="outlined"
            required
            fullWidth
          />
        )}
      />
    </div>
  );
}

export default BasicInfosTab;
