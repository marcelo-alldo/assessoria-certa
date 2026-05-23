import { Button, ButtonBase, Container, LinearProgress, styled, Tooltip, useTheme } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { useParams } from 'react-router';
import { useState } from 'react';
import SubscriptionHeader from './SubscriptionHeader';
import { useGetUniqueSubscriptionQuery } from '@/store/api/userApi';
import { format } from 'date-fns';
import { Grid, Paper, Typography, Box } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import DefaultTable from '@/components/DefaultTable';
import { useAppDispatch } from '@/store/hooks';
import { setPage } from '@/store/slices/paginationSlice';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DefaultConfirmModal from '@/components/DefaultConfirmModal';
import TablePricingPage from '@/app/(control-panel)/app-user/subscriptions/components/pricing-table/TablePricingPage';
import { useDeleteSubscriptionMutation } from '@/store/api/subscriptionApi';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .container': {
    maxWidth: '100%!important',
  },
  '& .FusePageSimple-header': {
    backgroundColor: theme.vars.palette.background.default,
    borderStyle: 'solid',
    borderColor: theme.vars.palette.divider,
  },
}));

/**
 * The Subscription.
 */

function Subscription() {
  const { subscriptionUid } = useParams();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [openPricingModal, setOpenPricingModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    confirmText: '',
  });

  const {
    data: subscriptionData,
    isLoading: isLoadingSubscription,
    refetch: refetchSubscription,
  } = useGetUniqueSubscriptionQuery(subscriptionUid, {
    refetchOnMountOrArgChange: true,
  });

  const [deleteSubscription] = useDeleteSubscriptionMutation();

  const [localLoading] = useState(false);

  const isActive = subscriptionData?.data?.status === 'ACTIVE';

  const handleCancelSubscription = (subscriptionUid: string) => {
    deleteSubscription(subscriptionUid)
      .unwrap()
      .then((response) => {
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
        setOpenCancelModal(false);
        // Refetch subscription data after cancellation
        refetchSubscription();
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
        setOpenCancelModal(false);
      });
  };

  const handleOpenCancelModal = () => {
    setOpenCancelModal(true);
  };

  const handleCloseCancelModal = () => {
    setOpenCancelModal(false);
  };

  const handleConfirmCancelSubscription = () => {
    handleCancelSubscription(subscriptionUid);
  };

  const handleChangeSubscription = () => {
    setModalConfig({
      title: 'Alterar Assinatura',
      confirmText: 'Alterar',
    });
    setOpenModal(true);
  };

  const handleClosePricingModal = () => {
    setOpenPricingModal(false);
    // Refetch subscription data when pricing modal closes (after potential subscription change)
    refetchSubscription();
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    // Refetch subscription data when modal closes (after potential subscription change)
    refetchSubscription();
  };

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

  const statusChipProps = (status) => {
    switch (status) {
      case 'RECEIVED':
      case 'CONFIRMED':
        return {
          color: theme.palette.success.light,
          textColor: theme.palette.success.contrastText,
          icon: <CheckCircleOutlineIcon fontSize="small" sx={{ ml: 0.5 }} />,
          label: traduceStatusPaymentMap[status] || status,
        };
      case 'PENDING':
        return {
          color: theme.palette.warning.light,
          textColor: theme.palette.warning.contrastText,
          icon: <HourglassEmptyIcon fontSize="small" sx={{ ml: 0.5 }} />,
          label: traduceStatusPaymentMap[status] || status,
        };
      case 'CANCELED':
      case 'REFUSED':
      case 'OVERDUE':
        return {
          color: theme.palette.error.main,
          textColor: theme.palette.warning.contrastText,
          icon: <CancelOutlinedIcon fontSize="small" sx={{ ml: 0.5 }} />,
          label: traduceStatusPaymentMap[status] || status,
        };
      default:
        return {
          color: theme.palette.grey[300],
          textColor: theme.palette.text.primary,
          icon: <ErrorOutlineIcon fontSize="small" sx={{ ml: 0.5 }} />,
          label: traduceStatusPaymentMap[status] || status,
        };
    }
  };

  const columns = [
    {
      id: 'type',
      accessorKey: 'type',
      header: 'Método de pagamento',
      accessorFn: (row) => traduceBillingTypeMap[row.type] || row.type,
    },
    {
      id: 'value',
      accessorKey: 'value',
      header: 'Valor',
      accessorFn: (row) => <Typography>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row?.value)}</Typography>,
    },
    {
      id: 'discount',
      accessorKey: 'discount',
      header: 'Desconto',
      accessorFn: (row) => {
        if (row.discount) {
          return (
            <Box>
              <Typography variant="body2" fontWeight={500} color="success.main">
                {row.discountType === 'PERCENTAGE'
                  ? `${row.discount}%`
                  : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.discount)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.discountType === 'PERCENTAGE' ? 'Percentual' : 'Valor Fixo'}
              </Typography>
            </Box>
          );
        }

        return (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        );
      },
    },
    {
      id: 'finalValue',
      accessorKey: 'finalValue',
      header: 'Valor Final',
      accessorFn: (row) => {
        let valorFinal = parseFloat(row.value);

        if (row.discount && row.discountType) {
          if (row.discountType === 'PERCENTAGE') {
            valorFinal = valorFinal - valorFinal * (row.discount / 100);
          } else if (row.discountType === 'FIXED') {
            valorFinal = valorFinal - row.discount;
          }
        }

        return (
          <Typography fontWeight={700} color="success.main">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorFinal)}
          </Typography>
        );
      },
    },
    {
      id: 'description',
      accessorKey: 'description',
      header: 'Descrição',
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',

      accessorFn: (row) => {
        const chipProps = statusChipProps(row.status);
        return (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 16,
              px: 1.5,
              py: 0.5,
              bgcolor: chipProps.color,
              color: chipProps.textColor,
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            {chipProps.label}
            {chipProps.icon}
          </Box>
        );
      },
    },
    {
      id: 'action',
      accessorKey: 'action',
      header: 'Ações',
      size: 60,
      accessorFn: () => (
        <Box display="flex" justifyContent="space-between" width="70px">
          <ButtonBase sx={{ color: 'primary.main', padding: '5px', borderRadius: '5px' }} onClick={() => {}}>
            <Tooltip title="Visualizar">
              <VisibilityOutlinedIcon fontSize="medium" color="primary" />
            </Tooltip>
          </ButtonBase>
        </Box>
      ),
    },
  ];

  return (
    <Root
      header={
        <>
          {(isLoadingSubscription || localLoading) && (
            <div className="w-full">
              <LinearProgress color="secondary" />
            </div>
          )}
          {!isLoadingSubscription && <SubscriptionHeader subscriptionName={subscriptionData?.data?.subscription?.name} />}
        </>
      }
      content={
        <>
          <Container maxWidth="xl">
            <Grid container spacing={2} justifyContent="center" alignItems="center">
              <Grid size={{ xs: 12 }}>
                {!isLoadingSubscription && subscriptionData?.data && (
                  <Paper elevation={3} className="flex w-full flex-col overflow-hidden lg:flex-row shadow-lg">
                    <Grid container spacing={3} padding={4} className="flex-1">
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
                          {subscriptionData.data.subscription?.name}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                          {subscriptionData.data.subscription?.description}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <FuseSvgIcon size={20} color="primary">
                            material-outline:calendar_today
                          </FuseSvgIcon>
                          <Typography variant="body2" color="text.secondary">
                            Criado em: {format(subscriptionData.data.createdAt, 'dd/MM/yyyy')}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <FuseSvgIcon size={20} color="primary">
                            material-outline:verified
                          </FuseSvgIcon>
                          <Typography variant="body2" color="text.secondary">
                            Status: {traduceStatusMap[subscriptionData.data.status]}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <FuseSvgIcon size={20} color="primary">
                            material-outline:event
                          </FuseSvgIcon>
                          <Typography variant="body2" color="text.secondary">
                            Iniciado em: {format(subscriptionData.data.startDate, 'dd/MM/yyyy')}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <FuseSvgIcon size={20} color="primary">
                            material-outline:event_busy
                          </FuseSvgIcon>
                          <Typography variant="body2" color="text.secondary">
                            Finaliza em: {format(subscriptionData.data.endDate, 'dd/MM/yyyy')}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 4 }}>
                        <Box display="flex" flexDirection="column" alignItems="start">
                          <Typography variant="h3" fontWeight={800} color="primary.main">
                            {subscriptionData.data.subscription?.price ? `R$ ${subscriptionData.data.subscription.price}` : 'Gratuito'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    <Box
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                      }}
                      className="flex flex-col w-96 items-center p-2 lg:px-10 lg:py-12 self-stretch justify-center lg:ml-auto"
                    >
                      <Box className="flex flex-col w-full gap-4">
                        <Button variant="text" onClick={handleOpenCancelModal} className="whitespace-nowrap" color="secondary">
                          <FuseSvgIcon size={20}>heroicons-outline:x-circle</FuseSvgIcon>
                          <span className="hidden sm:flex mx-2">Cancelar assinatura</span>
                        </Button>

                        {isActive && (
                          <Button
                            key="change"
                            variant="contained"
                            color="secondary"
                            className="mt-8 w-full lg:mt-auto"
                            onClick={() => handleChangeSubscription()}
                          >
                            Alterar Assinatura
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                )}
              </Grid>
              {subscriptionData?.data?.payments.length > 0 && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h4" fontWeight={700}>
                      Pagamentos
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }} />
                </>
              )}
            </Grid>
          </Container>
          {subscriptionData?.data?.payments.length > 0 && (
            <DefaultTable
              data={subscriptionData?.data?.payments}
              columns={columns}
              page={1}
              totalPages={1}
              onPageChange={(newPage) => dispatch(setPage(newPage))}
              globalFilter={search}
              onGlobalFilterChange={setSearch}
            />
          )}
          <DefaultConfirmModal
            open={openModal}
            title={modalConfig.title}
            message={
              <TablePricingPage
                onProcessComplete={handleCloseModal}
                onRefetchSubscription={refetchSubscription}
                currentUserSubscription={
                  subscriptionData?.data
                    ? {
                        subscriptionName: subscriptionData.data.subscription?.name,
                        status: subscriptionData.data.status,
                        price: subscriptionData.data.subscription?.price,
                        startDate: subscriptionData.data.startDate,
                        endDate: subscriptionData.data.endDate,
                      }
                    : undefined
                }
              />
            }
            cancelText="Cancelar"
            onCancel={handleCloseModal}
            confirmColor="primary"
            maxWidth="lg"
            removeConfirm
          />

          <DefaultConfirmModal
            open={openCancelModal}
            title="Cancelar Assinatura"
            message={`Tem certeza que deseja cancelar sua assinatura? Esta ação não pode ser desfeita. Sua assinatura ficará vigente até ${subscriptionData?.data?.endDate ? format(subscriptionData.data.endDate, 'dd/MM/yyyy') : 'a data de vencimento'}.`}
            cancelText="Não, manter assinatura"
            confirmText="Sim, cancelar assinatura"
            onConfirm={handleConfirmCancelSubscription}
            onCancel={handleCloseCancelModal}
            confirmColor="error"
            maxWidth="sm"
          />

          <DefaultConfirmModal
            open={openPricingModal}
            title="Escolha seu novo plano"
            message={
              <TablePricingPage
                onPlanSelect={handleClosePricingModal}
                onProcessComplete={handleClosePricingModal}
                onRefetchSubscription={refetchSubscription}
              />
            }
            cancelText="Cancelar"
            onCancel={handleClosePricingModal}
            maxWidth="lg"
            removeConfirm
          />
        </>
      }
    />
  );
}

export default Subscription;
