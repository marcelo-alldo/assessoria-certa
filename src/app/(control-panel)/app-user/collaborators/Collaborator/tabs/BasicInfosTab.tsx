import { TextField } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { useFormContext, Controller } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { useLocation } from 'react-router';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';

function BasicInfosTab() {
  const { register, formState, control } = useFormContext();
  // Helper para garantir que só string vai para helperText
  const getHelperText = (field) => (typeof field?.message === 'string' ? field.message : undefined);
  const { state } = useLocation();

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <TextField
        label="Nome"
        {...register('name')}
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
                dispatch: function (appended, dynamicMasked) {
                  const value = (dynamicMasked.value + appended).replace(/\D/g, '');

                  if (value.length > 10) {
                    return dynamicMasked.compiledMasks[1]; // 9 dígitos
                  }

                  return dynamicMasked.compiledMasks[0]; // 8 dígitos
                },
                lazy: false,
                overwrite: true,
              },
            }}
            {...field}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={(e) => {
              // Força a máscara correta ao sair do campo
              const onlyDigits = e.target.value.replace(/\D/g, '');

              if (onlyDigits.length === 11) {
                // Garante que o valor não será truncado
                const ddd = onlyDigits.slice(0, 2);
                const part1 = onlyDigits.slice(2, 7);
                const part2 = onlyDigits.slice(7);
                const formatted = `(${ddd}) ${part1}-${part2}`;
                field.onChange(formatted);
              } else if (onlyDigits.length === 10) {
                const ddd = onlyDigits.slice(0, 2);
                const part1 = onlyDigits.slice(2, 6);
                const part2 = onlyDigits.slice(6);
                const formatted = `(${ddd}) ${part1}-${part2}`;
                field.onChange(formatted);
              } else {
                field.onChange(e.target.value);
              }

              if (field.onBlur) field.onBlur();
            }}
          />
        )}
      />
      <TextField
        label="E-mail"
        {...register('email')}
        error={!!formState.errors.email}
        disabled={state?.isView}
        required
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
              disabled={state?.isView}
            />
          </LocalizationProvider>
        )}
      />
    </div>
  );
}

export default BasicInfosTab;
