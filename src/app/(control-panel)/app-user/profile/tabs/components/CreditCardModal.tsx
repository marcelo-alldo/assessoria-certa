import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { CircularProgress } from '@mui/material';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Grid, TextField } from '@mui/material';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Box from '@mui/material/Box';
import { z } from 'zod';
import { IMaskInput } from 'react-imask';
import Cards from 'react-credit-cards';
import 'react-credit-cards/es/styles-compiled.css';
import { useTokenizeCreditCardMutation } from '@/store/api/creditCardApi';
import { useAppDispatch } from '@/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import _ from 'lodash';

const Transition = React.forwardRef(function Transition(props: TransitionProps & { children: React.ReactElement }, ref: React.Ref<unknown>) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const schema = z.object({
  holderName: z.string().min(1, 'Nome impresso no cartão obrigatório'),
  number: z
    .string()
    .min(14, 'Número do cartão inválido')
    .max(23, 'Número do cartão inválido')
    .refine((val) => {
      // Remove espaços
      const digits = val.replace(/\D/g, '');
      // Amex: 15 dígitos, começa com 34 ou 37
      if (/^3[47]/.test(digits)) return digits.length === 15;
      // Diners: 14 dígitos, começa com 36, 38, 39
      if (/^3(6|8|9)/.test(digits)) return digits.length === 14;
      // Elo/Hipercard: 16 a 19 dígitos
      if (/^(4011|4389|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6521|6522|606282|3841)/.test(digits)) {
        return digits.length >= 16 && digits.length <= 19;
      }
      // Visa: começa com 4, 13, 16 ou 19 dígitos
      if (/^4/.test(digits)) return [13, 16, 19].includes(digits.length);
      // Mastercard: começa com 5, 16 dígitos
      if (/^5[1-5]/.test(digits)) return digits.length === 16;
      // Discover/JCB: começa com 6, 16 ou 19 dígitos
      if (/^6/.test(digits)) return [16, 19].includes(digits.length);
      // Default: 16 dígitos
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

        // CPF: 11 dígitos
        if (clean.length === 11) {
          if (/^(\d)\1{10}$/.test(clean)) return false;
          const cpfDigits = clean.split('').map(Number);
          const rest = (count: number) => ((cpfDigits.slice(0, count - 1).reduce((sum, el, idx) => sum + el * (count - idx), 0) * 10) % 11) % 10;
          return rest(10) === cpfDigits[9] && rest(11) === cpfDigits[10];
        }

        // CNPJ: 14 dígitos
        if (clean.length === 14) {
          if (/^(\d)\1{13}$/.test(clean)) return false;
          const cnpjDigits = clean.split('').map(Number);

          // Primeiro dígito verificador
          let sum = 0;
          let weight = 5;
          for (let i = 0; i < 12; i++) {
            sum += cnpjDigits[i] * weight;
            weight--;
            if (weight < 2) weight = 9;
          }
          const firstCheck = sum % 11 < 2 ? 0 : 11 - (sum % 11);
          if (firstCheck !== cnpjDigits[12]) return false;

          // Segundo dígito verificador
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

interface CreditCardModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  refetch: () => void;
}

function CreditCardModal({ open, setOpen, refetch }: CreditCardModalProps) {
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = ['Dados do cartão', 'Dados do pagador'];
  const dispatch = useAppDispatch();

  // Estado para controlar o foco do campo
  const [focus, setFocus] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields, isValid },
    reset,
    trigger,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'all',
  });

  const [tokenizeCreditCard, { isLoading: isLoadingTokenize }] = useTokenizeCreditCardMutation();

  // Observar os campos do cartão
  const cardValues = watch(['holderName', 'number', 'expiryMonth', 'expiryYear', 'ccv']);

  function handleClose() {
    reset();
    setActiveStep(0);
    setOpen(false);
  }

  async function handleNext() {
    // Valida apenas os campos do step 1
    const valid = await trigger(['holderName', 'number', 'expiryMonth', 'expiryYear', 'ccv']);

    if (valid) setActiveStep(1);
  }

  function handleBack() {
    setActiveStep(0);
  }

  async function onSubmit(data) {
    const ip = await fetch('https://api.ipify.org?format=json')
      .then((res) => res.json())
      .then((data) => data.ip);

    tokenizeCreditCard({ ip, ...data })
      .unwrap()
      .then((response) => {
        setOpen(false);
        reset();
        setActiveStep(0);
        refetch();
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
      })
      .catch((error) => {
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
    <Dialog open={open} maxWidth="sm" fullWidth TransitionComponent={Transition}>
      <DialogTitle>Cadastrar novo cartão</DialogTitle>
      <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mb: 2 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box>
            {activeStep === 0 && (
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start', mb: 2 }}>
                <Grid container spacing={2} sx={{ mt: 1, flex: 1 }}>
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ flex: '0 0 auto', mr: { md: 4 }, mb: { xs: 2, md: 0 } }}>
                      <Cards
                        number={cardValues[1] || ''}
                        name={cardValues[0] || ''}
                        expiry={cardValues[2] && cardValues[3] ? `${cardValues[2]}${cardValues[3].slice(-2)}` : ''}
                        cvc={cardValues[4] || ''}
                        focused={focus}
                      />
                    </Box>
                  </Grid>
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
                        inputComponent: IMaskInput,
                        inputProps: {
                          mask: [
                            // Amex: 4-6-5
                            '0000 000000 00000',
                            // Diners: 4-6-4
                            '0000 000000 0000',
                            // Visa/Mastercard/Discover/JCB: 4-4-4-4-3 (até 19 dígitos)
                            '0000 0000 0000 0000[ 000]',
                            // Visa/Mastercard/Discover/JCB: 4-4-4-4 (16 dígitos)
                            '0000 0000 0000 0000',
                            // Elo/Hipercard: 4-4-4-4-4 (19 dígitos)
                            '0000 0000 0000 0000 0000',
                          ],
                          dispatch: function (appended, dynamicMasked) {
                            const value = (dynamicMasked.value + appended).replace(/\D/g, '');

                            // Amex: começa com 34 ou 37, 15 dígitos
                            if (/^3[47]/.test(value)) {
                              return dynamicMasked.compiledMasks[0];
                            }

                            // Diners: começa com 36, 14 dígitos
                            if (/^3(6|8|9)/.test(value)) {
                              return dynamicMasked.compiledMasks[1];
                            }

                            // Elo/Hipercard: 19 dígitos
                            if (/^(4011|4389|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6521|6522|606282|3841)/.test(value)) {
                              return dynamicMasked.compiledMasks[4];
                            }

                            // Visa: começa com 4
                            if (/^4/.test(value)) {
                              if (value.length > 16) return dynamicMasked.compiledMasks[2];
                              return dynamicMasked.compiledMasks[3];
                            }

                            // Mastercard: começa com 5
                            if (/^5[1-5]/.test(value)) {
                              if (value.length > 16) return dynamicMasked.compiledMasks[2];
                              return dynamicMasked.compiledMasks[3];
                            }

                            // Discover/JCB: começa com 6
                            if (/^6/.test(value)) {
                              if (value.length > 16) return dynamicMasked.compiledMasks[2];
                              return dynamicMasked.compiledMasks[3];
                            }
                            // Default: 16 dígitos
                            return dynamicMasked.compiledMasks[3];
                          },
                          overwrite: true,
                          lazy: false,
                          // Permite apenas números e espaços
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
                </Grid>
              </Box>
            )}
            {activeStep === 1 && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="CPF ou CNPJ"
                    fullWidth
                    size="small"
                    required
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
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
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          {activeStep === 0 && (
            <>
              <Button onClick={handleClose} color="inherit" disabled={isLoadingTokenize} type="button">
                Cancelar
              </Button>
              <Button onClick={handleNext} color="secondary" variant="contained" disabled={isLoadingTokenize} autoFocus type="button">
                Próximo
              </Button>
            </>
          )}
          {activeStep === 1 && (
            <>
              <Button onClick={handleBack} color="inherit" disabled={isLoadingTokenize} type="button">
                Voltar
              </Button>
              <Button
                type="submit"
                color="secondary"
                variant="contained"
                disabled={_.isEmpty(dirtyFields) || !isValid || isLoadingTokenize}
                autoFocus
              >
                {isLoadingTokenize ? <CircularProgress size={24} /> : 'Cadastrar'}
              </Button>
            </>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default CreditCardModal;
