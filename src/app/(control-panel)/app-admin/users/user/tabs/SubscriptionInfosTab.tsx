import { useFormContext } from 'react-hook-form';
import { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Divider,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { format } from 'date-fns';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PaymentIcon from '@mui/icons-material/Payment';
import AddIcon from '@mui/icons-material/Add';
import { useCreatePaymentMutation, useUpdatePaymentMutation, CreatePaymentType, UpdatePaymentType, PaymentType } from '@/store/api/paymentApi';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch } from '@/store/hooks';
import { EditOutlined } from '@mui/icons-material';
import PaymentModal from '@/components/PaymentModal';
import { useCreateSubscriptionMutation } from '@/store/api/subscriptionApi';
import { useParams } from 'react-router';

function SubscriptionInfosTab() {
  const { watch } = useFormContext();
  const subscriptions = watch('subscriptions');
  const { uid } = useParams<{ uid: string }>();
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentType | null>(null);
  const [openSubscriptionModal, setOpenSubscriptionModal] = useState(false);
  const [subscriptionPeriod, setSubscriptionPeriod] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [selectedNewPlanUid, setSelectedNewPlanUid] = useState<string | null>(null);
  const [createPayment, { isLoading: isCreatingPayment }] = useCreatePaymentMutation();
  const [updatePayment, { isLoading: isUpdatingPayment }] = useUpdatePaymentMutation();
  const [createSubscription, { isLoading: isCreatingSubscription }] = useCreateSubscriptionMutation();

  const handleOpenPaymentModal = (payment?: PaymentType) => {
    if (payment) {
      setSelectedPayment(payment);
    }

    setOpenPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setOpenPaymentModal(false);
    setSelectedPayment(null);
  };

  const handleCreatePayment = async (paymentData: CreatePaymentType | UpdatePaymentType) => {
    try {
      let response;

      if ('uid' in paymentData) {
        // É edição
        response = await updatePayment(paymentData).unwrap();
      } else {
        // É criação
        response = await createPayment(paymentData).unwrap();
      }

      dispatch(
        showMessage({
          message: response.msg || `Pagamento ${selectedPayment ? 'atualizado' : 'criado'} com sucesso!`,
          autoHideDuration: 3000,
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        }),
      );

      handleClosePaymentModal();
      // Aqui você pode adicionar um refetch se necessário
    } catch (error: unknown) {
      const err = error as { data?: { msg?: string } };
      dispatch(
        showMessage({
          message: err?.data?.msg || `Erro ao ${selectedPayment ? 'atualizar' : 'criar'} pagamento`,
          autoHideDuration: 3000,
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        }),
      );
    }
  };

  const handleOpenSubscriptionModal = () => {
    setOpenSubscriptionModal(true);
    setSubscriptionPeriod(subscriptions[0]?.type === 'YEARLY' ? 'YEARLY' : 'MONTHLY');
    setSelectedNewPlanUid(subscriptions[0]?.subscriptionUid || null);
  };

  const handleCloseSubscriptionModal = () => {
    setOpenSubscriptionModal(false);
    setSelectedNewPlanUid(null);
  };

  const handleModifySubscription = async () => {
    const selectedPlan = tableData.find((item) => item.uid === selectedNewPlanUid);

    if (!selectedPlan) {
      dispatch(
        showMessage({
          message: 'Selecione uma assinatura para continuar.',
          autoHideDuration: 3000,
          variant: 'warning',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        }),
      );
      return;
    }

    try {
      const ip = await fetch('https://api.ipify.org?format=json')
        .then((res) => res.json())
        .then((data) => data.ip);

      const rawPrice = subscriptionPeriod === 'MONTHLY' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice;
      const parsedPrice = Number(rawPrice.replace('R$ ', '').replace('.', '').replace(',', '.'));
      const today = new Date().toISOString().split('T')[0];

      const payload = {
        value: parsedPrice,
        dueDate: today,
        description: `Assinatura ${selectedPlan.title}`,
        billingType: 'CREDIT_CARD',
        userUid: uid || '',
        percentualValue: 0,
        cycle: subscriptionPeriod,
        subscriptionName: selectedPlan.title,
        remoteIp: ip,
      };

      const response = await createSubscription(payload).unwrap();

      dispatch(
        showMessage({
          message: response?.msg || 'Assinatura modificada com sucesso!',
          autoHideDuration: 3000,
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        }),
      );

      handleCloseSubscriptionModal();
    } catch (error: unknown) {
      const err = error as { data?: { msg?: string } };
      dispatch(
        showMessage({
          message: err?.data?.msg || 'Erro ao modificar assinatura',
          autoHideDuration: 3000,
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        }),
      );
    }
  };

  if (subscriptions.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="text.secondary" variant="h6">
          Nenhuma assinatura encontrada.
        </Typography>
      </Box>
    );
  }

  const tableData = [
    {
      title: 'Atendimento',
      uid: 'fe8098df-82a4-4a6e-a4a0-6b092e1a530b',
      monthlyPrice: '189',
      yearlyPrice: '149',
      totalYearlyPrice: subscriptions[0]?.type === 'MONTHLY' ? 'R$ 2.268' : 'R$ 1.788',
      buttonTitle: 'Assinar',
      isPopular: false,
      features: {
        leadsContacts: 'até 1000',
        flows: '0',
        ai: 'Sem',
        attendants: 'até 5',
        whatsapp: 'WhatsApp API Oficial',
        functions: 'Padrões',
      },
    },
    {
      title: 'Padrão',
      uid: '790421fd-9605-4f3a-be48-5460960ddfa9',
      monthlyPrice: '499',
      yearlyPrice: '399',
      totalYearlyPrice: subscriptions[0]?.type === 'MONTHLY' ? 'R$ 5.988' : 'R$ 4.788',
      buttonTitle: 'Assinar',
      isPopular: true,
      features: {
        leadsContacts: 'até 2.000',
        flows: '1',
        ai: 'Com',
        attendants: 'até 10',
        flowType: 'Fluxo padrão',
        calendar: 'Google Calendar',
        whatsapp: 'WhatsApp API Oficial',
        functions: 'Padrões',
      },
    },
    {
      title: 'Customizada',
      uid: '312fe9f5-0866-4b6d-be9c-d2e050f48933',
      monthlyPrice: '699',
      yearlyPrice: '559',
      totalYearlyPrice: subscriptions[0]?.type === 'MONTHLY' ? 'R$ 8.388' : 'R$ 6.708',
      buttonTitle: 'Falar com especialista',
      isPopular: false,
      features: {
        leadsContacts: 'até 5.000',
        flows: 'até 3',
        ai: 'Com',
        attendants: 'até 20',
        flowType: 'Fluxo personalizado',
        calendar: 'Google Calendar',
        whatsapp: 'WhatsApp API Oficial',
        functions: 'Avançadas',
      },
    },
  ];

  const subscriptionActive = subscriptions.find((sub) => sub.status === 'ACTIVE') || subscriptions[0];
  const subscription = tableData.filter((item) => item.uid === subscriptionActive?.subscriptionUid);

  const traduceStatusMap = {
    ACTIVE: 'Ativa',
    CANCELED: 'Cancelada',
    EXPIRED: 'Expirada',
    TRIAL: 'Teste',
    PAYMENT_PENDING: 'Pagamento Pendente',
  };

  const traduceStatusPaymentMap = {
    PENDING: 'Pendente',
    RECEIVED: 'Recebido',
    CANCELED: 'Cancelado',
    CONFIRMED: 'Confirmado',
    OVERDUE: 'Vencido',
    REFUNDED: 'Reembolsado',
    REFUSED: 'Recusado',
    RECEIVED_IN_CASH: 'Recebido em dinheiro',
    REFUND_REQUESTED: 'Reembolso solicitado',
    REFUND_IN_PROGRESS: 'Reembolso em andamento',
    CHARGEBACK_REQUESTED: 'Chargeback solicitado',
    CHARGEBACK_DISPUTE: 'Disputa de chargeback',
    AWAITING_CHARGEBACK_REVERSAL: 'Aguardando reversão de chargeback',
    DUNNING_REQUESTED: 'Cobrança solicitada',
    DUNNING_RECEIVED: 'Cobrança recebida',
    AWAITING_RISK_ANALYSIS: 'Aguardando análise de risco',
  };

  const traduceBillingTypeMap = {
    BOLETO: 'Boleto',
    CREDIT_CARD: 'Cartão de Crédito',
    DEBIT_CARD: 'Cartão de Débito',
    TRANSFER: 'Transferência',
    DEPOSIT: 'Depósito',
    PIX: 'Pix',
  };

  const getStatusChipProps = (status: string) => {
    switch (status) {
      case 'RECEIVED':
      case 'CONFIRMED':
        return {
          color: theme.palette.success.main,
          textColor: theme.palette.success.contrastText,
          icon: <CheckCircleOutlineIcon fontSize="small" />,
        };
      case 'PENDING':
        return {
          color: theme.palette.warning.main,
          textColor: theme.palette.warning.contrastText,
          icon: <HourglassEmptyIcon fontSize="small" />,
        };
      case 'CANCELED':
      case 'REFUSED':
      case 'OVERDUE':
        return {
          color: theme.palette.error.main,
          textColor: theme.palette.error.contrastText,
          icon: <CancelOutlinedIcon fontSize="small" />,
        };
      default:
        return {
          color: theme.palette.grey[300],
          textColor: theme.palette.text.primary,
          icon: <ErrorOutlineIcon fontSize="small" />,
        };
    }
  };

  const payments = subscriptionActive?.payments || [];

  return (
    <Box className="flex flex-col gap-6 w-full p-4">
      <Grid container spacing={3}>
        {/* Card de Informações da Assinatura */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent={'space-between'} gap={1} mb={3}>
                <Box display={'flex'} alignItems="center" gap={1}>
                  <PaymentIcon color="primary" />
                  <Typography variant="h5" fontWeight={600}>
                    Assinatura - {subscription[0]?.title}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h5" fontWeight={500}>
                    Status:
                  </Typography>
                  <Chip
                    size="medium"
                    label={traduceStatusMap[subscriptionActive?.status]}
                    color={subscriptionActive?.status === 'ACTIVE' ? 'success' : 'default'}
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <CalendarTodayIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Início:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {format(new Date(subscriptionActive?.startDate), 'dd/MM/yyyy')}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <EventIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Fim:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {format(new Date(subscriptionActive?.endDate), 'dd/MM/yyyy')}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Criada em:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {format(new Date(subscriptionActive?.createdAt), 'dd/MM/yyyy HH:mm')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Card de Resumo */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={2} sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>
            <CardContent>
              <Box display={'flex'} alignItems="center" justifyContent={'space-between'} gap={1}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Resumo
                </Typography>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  {subscriptionActive?.type === 'MONTHLY' ? 'Mensal' : 'Anual'}
                </Typography>
              </Box>
              <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
              <Box display="flex" justifyContent={'space-between'} gap={2}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Total de Pagamentos
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {payments.length}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Valor
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    R$ {subscriptionActive?.type === 'MONTHLY' ? subscription[0]?.monthlyPrice : subscription[0]?.yearlyPrice},00
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <Box height="100%" display="flex" alignItems="center" justifyContent="center" flexDirection={'column'} gap={2}>
            <Button variant="contained" color="secondary" size="large" fullWidth onClick={() => handleOpenPaymentModal()} startIcon={<AddIcon />}>
              Criar pagamento
            </Button>
            <Button variant="outlined" color="primary" size="large" fullWidth onClick={handleOpenSubscriptionModal}>
              Modificar assinatura
            </Button>
            <Button color="error" size="large" fullWidth>
              Cancelar assinatura
            </Button>
          </Box>
        </Grid>

        {/* Tabela de Pagamentos */}
        {payments.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  Histórico de Pagamentos
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                        <TableCell sx={{ fontWeight: 600 }}>Método</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Valor</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Desconto</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Valor Final</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Vencimento</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Descrição</TableCell>
                        <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payments.map((payment: PaymentType) => {
                        const statusProps = getStatusChipProps(payment.status);

                        // Calcula o valor final
                        let valorFinal = parseFloat(payment.value);

                        if (payment.discount && payment.discountType) {
                          if (payment.discountType === 'PERCENTAGE') {
                            valorFinal = valorFinal - valorFinal * (payment.discount / 100);
                          } else if (payment.discountType === 'FIXED') {
                            valorFinal = valorFinal - payment.discount;
                          }
                        }

                        return (
                          <TableRow key={payment.uid} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {traduceBillingTypeMap[payment.type] || payment.type}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600} color="primary">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payment.value)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {payment.discount ? (
                                <Box>
                                  <Typography variant="body2" fontWeight={500} color="success.main">
                                    {payment.discountType === 'PERCENTAGE'
                                      ? `${payment.discount}%`
                                      : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payment.discount)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {payment.discountType === 'PERCENTAGE' ? 'Percentual' : 'Valor Fixo'}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  -
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={700} color="success.main">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorFinal)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{format(new Date(payment.dueDate), 'dd/MM/yyyy')}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={
                                  <Box display="flex" alignItems="center" gap={0.5}>
                                    {traduceStatusPaymentMap[payment.status] || payment.status}
                                    {statusProps.icon}
                                  </Box>
                                }
                                sx={{
                                  backgroundColor: statusProps.color,
                                  color: statusProps.textColor,
                                  fontWeight: 500,
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {payment.description || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                startIcon={<EditOutlined />}
                                onClick={() => handleOpenPaymentModal(payment)}
                              >
                                Editar
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {payments.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
                  <Typography color="text.secondary" variant="body1">
                    Nenhum pagamento registrado para esta assinatura.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <Dialog open={openSubscriptionModal} onClose={handleCloseSubscriptionModal} fullWidth maxWidth="md">
        <DialogTitle>Modificar assinatura</DialogTitle>
        <DialogContent>
          <Box display="flex" gap={1} mb={3} mt={1}>
            <Button variant={subscriptionPeriod === 'MONTHLY' ? 'contained' : 'outlined'} onClick={() => setSubscriptionPeriod('MONTHLY')}>
              Mensal
            </Button>
            <Button variant={subscriptionPeriod === 'YEARLY' ? 'contained' : 'outlined'} onClick={() => setSubscriptionPeriod('YEARLY')}>
              Anual
            </Button>
          </Box>

          <Grid container spacing={2}>
            {tableData.map((plan) => {
              const isSelected = selectedNewPlanUid === plan.uid;
              const displayPrice = subscriptionPeriod === 'MONTHLY' ? plan.monthlyPrice : plan.yearlyPrice;

              return (
                <Grid key={plan.uid} size={{ xs: 12, md: 4 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      cursor: 'pointer',
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? theme.palette.primary.main : undefined,
                    }}
                    onClick={() => setSelectedNewPlanUid(plan.uid)}
                  >
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} mb={1}>
                        {plan.title}
                      </Typography>
                      <Typography variant="h4" color="primary" fontWeight={700} mb={1}>
                        R$ {displayPrice}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Cobrança {subscriptionPeriod === 'MONTHLY' ? 'mensal' : 'anual'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSubscriptionModal}>Cancelar</Button>
          <Button variant="contained" onClick={handleModifySubscription} disabled={!selectedNewPlanUid || isCreatingSubscription}>
            {isCreatingSubscription ? 'Salvando...' : 'Confirmar alteração'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Criar/Editar Pagamento */}
      <PaymentModal
        open={openPaymentModal}
        onClose={handleClosePaymentModal}
        onConfirm={handleCreatePayment}
        userUid={subscriptionActive?.userUid}
        subscriptionUid={subscriptionActive?.uid}
        loading={isCreatingPayment || isUpdatingPayment}
        defaultValue={parseFloat(subscriptionActive?.type === 'MONTHLY' ? subscriptionActive?.monthlyPrice : subscriptionActive?.yearlyPrice)}
        payment={selectedPayment || undefined}
      />
    </Box>
  );
}

export default SubscriptionInfosTab;
