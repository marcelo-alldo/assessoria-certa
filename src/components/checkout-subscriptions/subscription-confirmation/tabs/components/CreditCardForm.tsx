import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Grid, TextField } from '@mui/material';
import { IMaskInput } from 'react-imask';
import Cards from 'react-credit-cards';
import 'react-credit-cards/es/styles-compiled.css';
import React from 'react';

const schema = z.object({
  holderName: z.string().min(1, 'Nome impresso no cartão obrigatório'),
  number: z
    .string()
    .min(14, 'Número do cartão inválido')
    .max(23, 'Número do cartão inválido')
    .refine((val) => {
      const digits = val.replace(/\D/g, '');

      if (/^3[47]/.test(digits)) return digits.length === 15;

      if (/^3(6|8|9)/.test(digits)) return digits.length === 14;

      if (/^(4011|4389|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6521|6522|606282|3841)/.test(digits)) {
        return digits.length >= 16 && digits.length <= 19;
      }

      if (/^4/.test(digits)) return [13, 16, 19].includes(digits.length);

      if (/^5[1-5]/.test(digits)) return digits.length === 16;

      if (/^6/.test(digits)) return [16, 19].includes(digits.length);

      return digits.length === 16;
    }, 'Número do cartão inválido'),
  expiryMonth: z.string().min(1, 'Mês de vencimento obrigatório'),
  expiryYear: z.string().min(1, 'Ano de vencimento obrigatório'),
  ccv: z.string().min(3, 'Código de segurança obrigatório').max(4, 'Código de segurança inválido'),
  name: z.string().min(1, 'Nome completo obrigatório'),
  email: z.string().email('E-mail inválido'),
  cpfCnpj: z
    .string()
    .min(1, 'CPF ou CNPJ obrigatório')
    .refine(
      (value) => {
        if (!value) return false;

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
  phone: z.string().min(1, 'Telefone obrigatório'),
  postalCode: z.string().min(1, 'CEP obrigatório').max(10, 'CEP inválido'),
  addressNumber: z.string().min(1, 'Número da residência obrigatório').max(6, 'Número da residência inválido'),
  addressComplement: z.string().optional(),
  cardName: z.string().optional(),
});

export const defaultValues = {
  holderName: '',
  number: '',
  expiryMonth: '',
  expiryYear: '',
  ccv: '',
  name: '',
  email: '',
  cpfCnpj: '',
  phone: '',
  postalCode: '',
  addressNumber: '',
  addressComplement: '',
  cardName: '',
};

interface CreditCardFormProps {
  onSubmit?: (data: any) => void;
}

export function CreditCardForm({ onSubmit }: CreditCardFormProps) {
  const [focus, setFocus] = React.useState('');

  const {
    register,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'all',
  });

  const cardValues = watch(['holderName', 'number', 'expiryMonth', 'expiryYear', 'ccv']);

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start', mb: 3, gap: 3 }}>
      <Box sx={{ flex: '0 0 auto', mr: { md: 2 }, mb: { xs: 2, md: 0 } }}>
        <Cards
          number={cardValues[1] || ''}
          name={cardValues[0] || ''}
          expiry={cardValues[2] && cardValues[3] ? `${cardValues[2]}${cardValues[3].slice(-2)}` : ''}
          cvc={cardValues[4] || ''}
          focused={focus}
        />
      </Box>

      <Grid container spacing={2} sx={{ flex: 1 }}>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Nome impresso no cartão"
            fullWidth
            size="small"
            required
            InputLabelProps={{ shrink: true }}
            {...register('holderName')}
            error={!!errors.holderName}
            helperText={errors.holderName?.message}
            autoComplete="off"
            onFocus={() => setFocus('name')}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Número do cartão"
            fullWidth
            size="small"
            required
            InputLabelProps={{ shrink: true }}
            InputProps={{
              notched: true,
              inputComponent: IMaskInput,
              inputProps: {
                mask: ['0000 000000 00000', '0000 000000 0000', '0000 0000 0000 0000[ 000]', '0000 0000 0000 0000', '0000 0000 0000 0000 0000'],
                dispatch: function (appended, dynamicMasked) {
                  const value = (dynamicMasked.value + appended).replace(/\D/g, '');

                  if (/^3[47]/.test(value)) {
                    return dynamicMasked.compiledMasks[0];
                  }

                  if (/^3(6|8|9)/.test(value)) {
                    return dynamicMasked.compiledMasks[1];
                  }

                  if (/^(4011|4389|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6521|6522|606282|3841)/.test(value)) {
                    return dynamicMasked.compiledMasks[4];
                  }

                  if (/^4/.test(value)) {
                    if (value.length > 16) return dynamicMasked.compiledMasks[2];

                    return dynamicMasked.compiledMasks[3];
                  }

                  if (/^5[1-5]/.test(value)) {
                    if (value.length > 16) return dynamicMasked.compiledMasks[2];

                    return dynamicMasked.compiledMasks[3];
                  }

                  if (/^6/.test(value)) {
                    if (value.length > 16) return dynamicMasked.compiledMasks[2];

                    return dynamicMasked.compiledMasks[3];
                  }

                  return dynamicMasked.compiledMasks[3];
                },
                overwrite: true,
                lazy: false,
                prepare: (str) => str.replace(/[^\d ]/g, ''),
              },
            }}
            {...register('number')}
            error={!!errors.number}
            helperText={errors.number?.message}
            autoComplete="off"
            onFocus={() => setFocus('number')}
          />
        </Grid>
        <Grid size={{ xs: 3 }}>
          <TextField
            select
            label="Mês de vencimento"
            fullWidth
            size="small"
            required
            InputLabelProps={{ shrink: true }}
            {...register('expiryMonth')}
            error={!!errors.expiryMonth}
            helperText={errors.expiryMonth?.message}
            autoComplete="off"
            SelectProps={{ native: true }}
            onFocus={() => setFocus('expiry')}
          >
            <option value="">Selecionar</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                {String(i + 1).padStart(2, '0')}
              </option>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 5 }}>
          <TextField
            select
            label="Ano de vencimento"
            fullWidth
            size="small"
            required
            InputLabelProps={{ shrink: true }}
            {...register('expiryYear')}
            error={!!errors.expiryYear}
            helperText={errors.expiryYear?.message}
            autoComplete="off"
            SelectProps={{ native: true }}
            onFocus={() => setFocus('expiry')}
          >
            <option value="">Selecionar</option>
            {Array.from({ length: 20 }, (_, i) => {
              const year = new Date().getFullYear() + i;
              return (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              );
            })}
          </TextField>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <TextField
            label="Código de segurança (CCV)"
            fullWidth
            size="small"
            required
            InputLabelProps={{ shrink: true }}
            {...register('ccv')}
            InputProps={{
              notched: true,
              inputComponent: IMaskInput,
              inputProps: {
                mask: '000[0]',
                overwrite: true,
              },
            }}
            error={!!errors.ccv}
            helperText={errors.ccv?.message}
            autoComplete="off"
            onFocus={() => setFocus('cvc')}
          />
        </Grid>

        <Grid size={{ xs: 6 }}>
          <TextField
            label="CPF ou CNPJ"
            fullWidth
            size="small"
            required
            InputLabelProps={{ shrink: true }}
            InputProps={{
              notched: true,
              inputComponent: IMaskInput,
              inputProps: {
                mask: ['000.000.000-00', '00.000.000/0000-00'],
                overwrite: true,
              },
            }}
            {...register('cpfCnpj')}
            error={!!errors.cpfCnpj}
            helperText={errors.cpfCnpj?.message}
            autoComplete="off"
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            label="Telefone"
            fullWidth
            size="small"
            required
            InputLabelProps={{ shrink: true }}
            InputProps={{
              notched: true,
              inputComponent: IMaskInput,
              inputProps: {
                mask: ['(00) 0000-0000', '(00) 00000-0000'],
                overwrite: true,
              },
            }}
            {...register('phone')}
            error={!!errors.phone}
            helperText={errors.phone?.message}
            autoComplete="off"
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            label="Nome completo"
            fullWidth
            size="small"
            required
            InputLabelProps={{ shrink: true }}
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
            autoComplete="off"
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            label="E-mail"
            fullWidth
            size="small"
            required
            InputLabelProps={{ shrink: true }}
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            autoComplete="off"
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            label="CEP"
            fullWidth
            size="small"
            required
            InputLabelProps={{ shrink: true }}
            InputProps={{
              notched: true,
              inputComponent: IMaskInput,
              inputProps: {
                mask: '00000-000',
                overwrite: true,
              },
            }}
            {...register('postalCode')}
            error={!!errors.postalCode}
            helperText={errors.postalCode?.message}
            autoComplete="off"
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            label="Número da residência"
            fullWidth
            size="small"
            required
            InputLabelProps={{ shrink: true }}
            InputProps={{
              notched: true,
              inputComponent: IMaskInput,
              inputProps: {
                mask: '000000',
                overwrite: true,
              },
            }}
            {...register('addressNumber')}
            error={!!errors.addressNumber}
            helperText={errors.addressNumber?.message}
            autoComplete="off"
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            label="Complemento"
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            {...register('addressComplement')}
            error={!!errors.addressComplement}
            helperText={errors.addressComplement?.message}
            autoComplete="off"
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            label="Apelido para o cartão"
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            {...register('cardName')}
            error={!!errors.cardName}
            helperText={errors.cardName?.message}
            autoComplete="off"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
