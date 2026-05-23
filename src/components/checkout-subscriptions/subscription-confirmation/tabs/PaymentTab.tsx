import { Box, Typography, Card, CardContent, Radio, RadioGroup, FormControlLabel, FormControl, Chip, TextField, Grid, Button } from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Controller, Control, FieldErrors, UseFormWatch } from 'react-hook-form';
import Cards from 'react-credit-cards';
import 'react-credit-cards/es/styles-compiled.css';
import { IMaskInput } from 'react-imask';
import React, { useState } from 'react';

interface PaymentTabProps {
  selectedPaymentMethod: 'credit_card' | 'pix' | 'boleto' | 'trial';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: FieldErrors<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watch: UseFormWatch<any>;
}

export function PaymentTab({ selectedPaymentMethod, control, errors, watch }: PaymentTabProps) {
  const [focus, setFocus] = React.useState('');
  const [activeTab, setActiveTab] = useState<'card' | 'payer'>('card');
  const cardValues = watch(['holderName', 'number', 'expiryMonth', 'expiryYear', 'ccv']);
  return (
    <Box className="flex flex-col p-4">
      <Box className="text-center mb-4">
        <Typography variant="h5" className="font-bold mb-2">
          Escolha a forma de pagamento
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Selecione como deseja pagar <strong>sua assinatura</strong>
        </Typography>
      </Box>

      <FormControl component="fieldset" fullWidth>
        <Controller
          name="selectedPaymentMethod"
          control={control}
          render={({ field }) => (
            <RadioGroup {...field}>
              {/* Cartão de Crédito */}
              <Card className="mb-4" variant="outlined">
                <CardContent className="p-4">
                  <FormControlLabel
                    value="credit_card"
                    control={<Radio color="secondary" />}
                    label={
                      <Box className="flex justify-between items-center w-full ml-2">
                        <Box className="flex items-center gap-3">
                          <CreditCardIcon className="text-secondary" />
                          <Box>
                            <Typography variant="body1" className="font-medium">
                              Cartão de Crédito
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Parcelado em 1x
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Acesso imediato
                        </Typography>
                      </Box>
                    }
                    className="m-0 w-full"
                  />
                </CardContent>
              </Card>

              {selectedPaymentMethod === 'credit_card' && (
                <Card className="mb-4" variant="outlined" sx={{ p: 0, boxShadow: 1, borderRadius: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    {/* Stepper */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => setActiveTab('card')}>
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            backgroundColor: activeTab === 'card' ? 'text.primary' : 'grey.400',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', lineHeight: 1 }}>
                            1
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: activeTab === 'card' ? 'bold' : 'normal' }}>
                          Dados do cartão
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, height: '1px', backgroundColor: 'divider', mx: 2 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => setActiveTab('payer')}>
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            backgroundColor: activeTab === 'payer' ? 'text.primary' : 'grey.400',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', lineHeight: 1 }}>
                            2
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: activeTab === 'payer' ? 'bold' : 'normal',
                            color: activeTab === 'payer' ? 'text.primary' : 'text.secondary',
                          }}
                        >
                          Dados do pagador
                        </Typography>
                      </Box>
                    </Box>

                    {/* Step 1: Dados do cartão */}
                    {activeTab === 'card' && (
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start', gap: 3 }}>
                        <Box sx={{ flex: '0 0 auto' }}>
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
                            <Controller
                              name="holderName"
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  label="Nome impresso no cartão"
                                  fullWidth
                                  size="small"
                                  error={!!errors.holderName}
                                  helperText={(errors.holderName?.message as string) || ''}
                                  onFocus={() => setFocus('name')}
                                />
                              )}
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <Controller
                              name="number"
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  label="Número do cartão"
                                  fullWidth
                                  size="small"
                                  InputLabelProps={{ shrink: true }}
                                  InputProps={{
                                    notched: true,
                                    inputComponent: IMaskInput,
                                    inputProps: {
                                      mask: [
                                        '0000 000000 00000',
                                        '0000 000000 0000',
                                        '0000 0000 0000 0000[ 000]',
                                        '0000 0000 0000 0000',
                                        '0000 0000 0000 0000 0000',
                                      ],
                                      dispatch: function (appended: string, dynamicMasked) {
                                        const value = (dynamicMasked.value + appended).replace(/\D/g, '');

                                        if (/^3[47]/.test(value)) return dynamicMasked.compiledMasks[0];

                                        if (/^3(6|8|9)/.test(value)) return dynamicMasked.compiledMasks[1];

                                        if (/^(4011|4389|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6521|6522|606282|3841)/.test(value))
                                          return dynamicMasked.compiledMasks[4];

                                        if (/^4/.test(value))
                                          return value.length > 16 ? dynamicMasked.compiledMasks[2] : dynamicMasked.compiledMasks[3];

                                        if (/^5[1-5]/.test(value))
                                          return value.length > 16 ? dynamicMasked.compiledMasks[2] : dynamicMasked.compiledMasks[3];

                                        if (/^6/.test(value))
                                          return value.length > 16 ? dynamicMasked.compiledMasks[2] : dynamicMasked.compiledMasks[3];

                                        return dynamicMasked.compiledMasks[3];
                                      },
                                      overwrite: true,
                                      lazy: false,
                                      prepare: (str: string) => str.replace(/[^\d ]/g, ''),
                                    },
                                  }}
                                  error={!!errors.number}
                                  helperText={(errors.number?.message as string) || ''}
                                  onFocus={() => setFocus('number')}
                                />
                              )}
                            />
                          </Grid>
                          <Grid size={{ xs: 3 }}>
                            <Controller
                              name="expiryMonth"
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  select
                                  {...field}
                                  label="Mês"
                                  fullWidth
                                  size="small"
                                  InputLabelProps={{ shrink: true }}
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
                              )}
                            />
                          </Grid>
                          <Grid size={{ xs: 5 }}>
                            <Controller
                              name="expiryYear"
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  select
                                  {...field}
                                  label="Ano"
                                  fullWidth
                                  size="small"
                                  InputLabelProps={{ shrink: true }}
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
                              )}
                            />
                          </Grid>
                          <Grid size={{ xs: 4 }}>
                            <Controller
                              name="ccv"
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  label="CCV"
                                  fullWidth
                                  size="small"
                                  InputLabelProps={{ shrink: true }}
                                  InputProps={{
                                    notched: true,
                                    inputComponent: IMaskInput,
                                    inputProps: { mask: '000[0]', overwrite: true },
                                  }}
                                  error={!!errors.ccv}
                                  helperText={(errors.ccv?.message as string) || ''}
                                  onFocus={() => setFocus('cvc')}
                                />
                              )}
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                            <Button variant="contained" color="secondary" onClick={() => setActiveTab('payer')}>
                              Próximo
                            </Button>
                          </Grid>
                        </Grid>
                      </Box>
                    )}

                    {/* Step 2: Dados do pagador */}
                    {activeTab === 'payer' && (
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                          <Button variant="text" color="secondary" onClick={() => setActiveTab('card')}>
                            ← Voltar para dados do cartão
                          </Button>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Controller
                            name="cpfCnpj"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="CPF ou CNPJ"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                  notched: true,
                                  inputComponent: IMaskInput,
                                  inputProps: {
                                    mask: ['000.000.000-00', '00.000.000/0000-00'],
                                    overwrite: true,
                                  },
                                }}
                                error={!!errors.cpfCnpj}
                                helperText={(errors.cpfCnpj?.message as string) || ''}
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Telefone"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                  notched: true,
                                  inputComponent: IMaskInput,
                                  inputProps: {
                                    mask: ['(00) 0000-0000', '(00) 00000-0000'],
                                    overwrite: true,
                                  },
                                }}
                                error={!!errors.phone}
                                helperText={(errors.phone?.message as string) || ''}
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Controller
                            name="fullName"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Nome completo"
                                fullWidth
                                error={!!errors.fullName}
                                helperText={(errors.fullName?.message as string) || ''}
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Controller
                            name="postalCode"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="CEP"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                  notched: true,
                                  inputComponent: IMaskInput,
                                  inputProps: {
                                    mask: '00000-000',
                                    overwrite: true,
                                  },
                                }}
                                error={!!errors.postalCode}
                                helperText={(errors.postalCode?.message as string) || ''}
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Controller
                            name="addressNumber"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Número da residência"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                  notched: true,
                                  inputComponent: IMaskInput,
                                  inputProps: {
                                    mask: '000000',
                                    overwrite: true,
                                  },
                                }}
                                error={!!errors.addressNumber}
                                helperText={(errors.addressNumber?.message as string) || ''}
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Controller
                            name="addressComplement"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Complemento"
                                fullWidth
                                error={!!errors.addressComplement}
                                helperText={(errors.addressComplement?.message as string) || ''}
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Controller
                            name="cardAlias"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Apelido para o cartão"
                                fullWidth
                                error={!!errors.cardAlias}
                                helperText={(errors.cardAlias?.message as string) || ''}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* PIX */}
              <Card className="mb-4" variant="outlined" sx={{ opacity: 0.6 }}>
                <CardContent className="p-4">
                  <FormControlLabel
                    value="pix"
                    disabled
                    control={<Radio color="secondary" />}
                    label={
                      <Box className="flex justify-between items-center w-full ml-2">
                        <Box className="flex items-center gap-3">
                          <QrCode2Icon sx={{ color: '#bdbdbd' }} />
                          <Box>
                            <Typography variant="body1" className="font-medium" sx={{ color: '#999' }}>
                              PIX
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Transferência instantânea
                            </Typography>
                          </Box>
                        </Box>
                        <Chip label="Em breve" size="small" variant="outlined" sx={{ borderColor: '#bdbdbd', color: '#bdbdbd' }} />
                      </Box>
                    }
                    className="m-0 w-full"
                  />
                </CardContent>
              </Card>

              {/* Boleto */}
              <Card className="mb-4" variant="outlined" sx={{ opacity: 0.6 }}>
                <CardContent className="p-4">
                  <FormControlLabel
                    value="boleto"
                    disabled
                    control={<Radio color="secondary" />}
                    label={
                      <Box className="flex justify-between items-center w-full ml-2">
                        <Box className="flex items-center gap-3">
                          <ReceiptIcon sx={{ color: '#bdbdbd' }} />
                          <Box>
                            <Typography variant="body1" className="font-medium" sx={{ color: '#999' }}>
                              Boleto
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Vencimento em 3 dias úteis
                            </Typography>
                          </Box>
                        </Box>
                        <Chip label="Em breve" size="small" variant="outlined" sx={{ borderColor: '#bdbdbd', color: '#bdbdbd' }} />
                      </Box>
                    }
                    className="m-0 w-full"
                  />
                </CardContent>
              </Card>

              {/* Teste Grátis - Mais sutil */}
              <Card className="mb-4" variant="outlined" sx={{ backgroundColor: '#fafafa', borderColor: '#e0e0e0' }}>
                <CardContent className="p-3">
                  <FormControlLabel
                    value="trial"
                    control={<Radio color="default" />}
                    label={
                      <Box className="flex justify-between items-center w-full ml-2">
                        <Box className="flex items-center gap-2">
                          <CheckCircleIcon sx={{ fontSize: 20, color: '#999' }} />
                          <Box>
                            <Typography variant="body2" className="font-medium" sx={{ color: '#666' }}>
                              Teste grátis por 7 dias
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#999' }}>
                              Cancele quando quiser
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    }
                    className="m-0 w-full"
                  />
                </CardContent>
              </Card>
            </RadioGroup>
          )}
        />
      </FormControl>

      <Box className="bg-blue-50 p-3 rounded-lg border border-blue-100">
        <Typography variant="body2" color="text.secondary" className="text-center">
          💳 Seus dados de pagamento estão seguros e criptografados
        </Typography>
      </Box>
    </Box>
  );
}
