import { TextField, Switch, FormControlLabel } from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { useLocation } from 'react-router';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';

function BasicInfosTab() {
  const { register, formState, control, setValue, watch } = useFormContext();
  // Helper para garantir que só string vai para helperText
  const getHelperText = (field) => (typeof field?.message === 'string' ? field.message : undefined);
  const { state } = useLocation();

  // Observa os valores necessários
  const enterprise = watch('enterprise');

  // Sempre que qualquer campo for alterado, seta profileUpdate para true
  const handleFieldChange = (fieldOnChange) => (value) => {
    setValue('profileUpdate', true, { shouldDirty: false });
    fieldOnChange(value);
  };

  // Helper para converter string de data para Date sem timezone
  const parseDate = (dateString: string) => {
    if (!dateString) return null;

    // Remove timezone se existir e pега só a data
    const dateOnly = dateString.split('T')[0];
    const [year, month, day] = dateOnly.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Helper para converter Date para string yyyy-MM-dd
  const formatDate = (date: Date) => {
    if (!date || isNaN(date.getTime())) return '';

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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
        {...register('email', {
          onChange: () => setValue('profileUpdate', true, { shouldDirty: false }),
        })}
        error={!!formState.errors.email}
        disabled={state?.isView}
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
              value={parseDate(field.value)}
              onChange={(date) => handleFieldChange(field.onChange)(formatDate(date))}
              sx={{ bgcolor: 'white' }}
              maxDate={new Date()}
              disabled={state?.isView}
            />
          </LocalizationProvider>
        )}
      />

      <Controller
        name="lastPurchase"
        control={control}
        render={({ field }) => (
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <DatePicker
              label="Última Compra"
              value={parseDate(field.value)}
              onChange={(date) => field.onChange(formatDate(date))}
              sx={{ bgcolor: 'white' }}
              disabled={state?.isView}
            />
          </LocalizationProvider>
        )}
      />

      {/* Switch para ativar/desativar cliente empresarial */}
      <Controller
        name="enterprise"
        control={control}
        defaultValue={false}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Switch
                checked={field.value || false}
                onChange={(e) => {
                  field.onChange(e.target.checked);
                }}
                disabled={state?.isView}
                color="primary"
              />
            }
            label="Cliente Empresarial"
          />
        )}
      />

      {/* CNPJ - só aparece se enterprise for true */}
      {enterprise && (
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
      )}
      {/* Nome Fantasia - só aparece se enterprise for true */}
      {enterprise && (
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
      )}

      <TextField
        label="Resumo do Alldo"
        {...register('summary', {
          onChange: () => setValue('profileUpdate', true, { shouldDirty: false }),
        })}
        disabled
        error={!!formState.errors.summary}
        helperText={getHelperText(formState.errors.summary)}
        fullWidth
        InputLabelProps={{ shrink: true }}
        multiline
        minRows={3}
      />
      <TextField
        label="Observações"
        {...register('notes', {
          onChange: () => setValue('profileUpdate', true, { shouldDirty: false }),
        })}
        disabled={state?.isView}
        error={!!formState.errors.notes}
        helperText={getHelperText(formState.errors.notes)}
        fullWidth
        InputLabelProps={{ shrink: true }}
        multiline
        minRows={3}
      />
    </div>
  );
}

export default BasicInfosTab;
