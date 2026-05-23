import { Container, Grid, LinearProgress, styled } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import SubscriptionsHeader from './SubscriptionsHeader';
import SinglePricingCard from './components/SinglePricingCard';
import { useGetUserSubscriptionsQuery } from '@/store/api/userApi';
import { format } from 'date-fns';

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
 * The Subscriptions.
 */

function Subscriptions() {
  const {
    data: subscriptionsData,
    isLoading: isLoadingSubscriptions,
    refetch: refetchSubscriptions,
  } = useGetUserSubscriptionsQuery('', { refetchOnMountOrArgChange: true });

  const traduceStatusMap = {
    ACTIVE: 'Ativa',
    CANCELED: 'Cancelada',
    EXPIRED: 'Expirada',
    TRIAL: 'Teste',
    PAYMENT_PENDING: 'Pagamento Pendente',
  };

  const iconStatusMap = {
    ACTIVE: 'material-solid:check_circle',
    CANCELED: 'material-solid:cancel',
    EXPIRED: 'material-solid:hourglass_empty',
    TRIAL: 'material-solid:hourglass_top',
    PAYMENT_PENDING: 'material-solid:pending_actions',
  };

  return (
    <>
      <Root
        scroll="content"
        header={
          <>
            {isLoadingSubscriptions && (
              <div className="w-full">
                <LinearProgress color="secondary" />
              </div>
            )}
            {!isLoadingSubscriptions && <SubscriptionsHeader />}
          </>
        }
        content={
          !isLoadingSubscriptions && (
            <div className="flex flex-1 flex-col h-full">
              <Container maxWidth="xl">
                <Grid container spacing={2} className="mb-6">
                  {subscriptionsData?.data?.map((subscription, index) => (
                    <Grid size={{ xs: 12 }} key={subscription.uid}>
                      <SinglePricingCard
                        activedSubscription={
                          subscription?.status === 'ACTIVE' || (subscriptionsData?.data?.length === 1 && subscription?.status === 'TRIAL')
                        }
                        description={subscription?.subscription?.description}
                        details={[
                          { icon: 'material-solid:edit_calendar', text: `Criado em: ${format(subscription?.createdAt, 'dd/MM/yyyy')}` },
                          { icon: iconStatusMap[subscription?.status], text: `Status: ${traduceStatusMap[subscription?.status]}` },
                          { icon: 'material-solid:event_available', text: `Inicado em: ${format(subscription?.startDate, 'dd/MM/yyyy')}` },
                          { icon: 'material-solid:event_busy', text: `Finaliza em: ${format(subscription?.endDate, 'dd/MM/yyyy')}` },
                        ]}
                        price={subscription?.subscription?.price}
                        title={subscription?.subscription?.name}
                        isTrialTier={subscription?.subscriptionUid === import.meta.env.VITE_APP_FREE_TRIAL_UID}
                        subscriptionStatus={subscription?.status}
                        subscriptionUid={subscription?.subscriptionUid}
                        isLastItem={index === 0}
                        onRefetchSubscriptions={refetchSubscriptions}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Container>
            </div>
          )
        }
      />
    </>
  );
}

export default Subscriptions;
