import { TextField, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { useFormContext, Controller } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';

function BasicInfosTab() {
  const { register, formState, control, watch } = useFormContext();
  // Helper para garantir que só string vai para helperText
  const getHelperText = (field) => (typeof field?.message === 'string' ? field.message : undefined);
  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <TextField
        label="Nome"
        {...register('profile.name')}
        required
        disabled
        error={!!formState.errors.name}
        helperText={getHelperText(formState.errors.name)}
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
      <Controller
        name="profile.phone"
        control={control}
        render={({ field }) => (
          <TextField
            label="Telefone"
            error={!!formState.errors.phone}
            required
            disabled
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
            onChange={(e) => field.onChange(e.target.value)}
          />
        )}
      />
      <TextField
        label="E-mail"
        {...register('profile.email')}
        error={!!formState.errors.email}
        disabled
        helperText={getHelperText(formState.errors.email)}
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
      <Controller
        name="profile.cpf"
        control={control}
        render={({ field }) => (
          <TextField
            label="CPF"
            error={!!formState.errors.cpf}
            helperText={getHelperText(formState.errors.cpf)}
            fullWidth
            disabled
            InputLabelProps={{ shrink: true }}
            InputProps={{
              inputComponent: IMaskInput,
              inputProps: {
                mask: '000.000.000-00',
                overwrite: true,
              },
            }}
            {...field}
            onChange={(e) => field.onChange(e.target.value)}
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
                field.onChange(str);
              }}
              sx={{ bgcolor: 'white' }}
              maxDate={new Date()}
              disabled
            />
          </LocalizationProvider>
        )}
      />

      <div className="flex flex-col justify-center gap-2">
        <Typography variant="subtitle1">Colaboradores: {watch('_count.collaborators')}</Typography>
        <Typography variant="subtitle1">Clientes: {watch('_count.clients')}</Typography>
        <Typography variant="subtitle1">Leads: {watch('_count.leads')}</Typography>
      </div>
    </div>
  );
}

export default BasicInfosTab;
