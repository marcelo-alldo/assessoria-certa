import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import DefaultConfirmModal from '@/components/DefaultConfirmModal';
import TablePricingPage from '@/app/(control-panel)/app-user/subscriptions/components/pricing-table/TablePricingPage';

/**
 * The single pricing card component.
 */

interface SinglePricingCardProps {
  activedSubscription?: boolean;
  title: string;
  description: string;
  price: string;
  subscriptionUid?: string;
  details: { icon: string; text: string }[];
  isTrialTier?: boolean;
  subscriptionStatus?: string;
  isLastItem?: boolean;
  onRefetchSubscriptions?: () => void;
}

function SinglePricingCard({
  activedSubscription = false,
  title,
  description,
  price,
  details,
  isTrialTier = false,
  subscriptionUid,
  subscriptionStatus,
  isLastItem = false,
  onRefetchSubscriptions,
}: SinglePricingCardProps) {
  const theme = useTheme();
  const navigate = useNavigate();

  const [openModal, setOpenModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    confirmText: '',
  });

  const [selectedPlanData, setSelectedPlanData] = useState<{
    period: 'month' | 'year';
    planTitle?: string;
    price?: string;
  }>({ period: 'month' });

  const isCanceled = subscriptionStatus === 'CANCELED';
  const isExpired = subscriptionStatus === 'EXPIRED';

  const handleSubscribe = async () => {
    setModalConfig({
      title: 'Escolha seu Plano',
      confirmText: 'Assinar',
    });
    setOpenModal(true);
  };

  const handleRenewSubscription = () => {
    setModalConfig({
      title: 'Renovar Assinatura',
      confirmText: 'Renovar',
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    // Refetch subscriptions data after modal closes (potential subscription change)
    onRefetchSubscriptions?.();
  };

  return (
    <Paper className="flex w-full flex-col overflow-hidden lg:flex-row shadow-lg">
      <div className="p-6 sm:p-8 lg:p-10 flex-1 flex flex-col">
        <Typography className="text-3xl font-bold">{title}</Typography>

        <Typography className="mt-2 leading-[1.625]" color="text.secondary">
          {description}
        </Typography>

        <div className="mt-10 flex items-center">
          <Typography className="font-medium" color="text.secondary">
            Detalhes
          </Typography>
          <Divider className="ml-2 flex-auto" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-y-4 lg:grid-cols-2">
          {details.map((detail, idx) => (
            <div className="flex items-center" key={idx}>
              <FuseSvgIcon size={20} color={activedSubscription ? 'secondary' : 'disabled'}>
                {detail.icon}
              </FuseSvgIcon>
              <div className="ml-2">{detail.text}</div>
            </div>
          ))}
        </div>
      </div>
      <Box
        sx={{
          backgroundColor: activedSubscription ? theme.palette.secondary.main : theme.palette.grey[200],
          color: activedSubscription ? theme.palette.secondary.contrastText : theme.palette.text.disabled,
        }}
        className="flex flex-col w-96 items-center p-2 lg:px-10 lg:py-12 self-stretch justify-center"
      >
        <div className="flex items-center whitespace-nowrap">
          <Typography className="text-10xl font-extrabold tracking-tight" color={activedSubscription ? 'secondary.contrastText' : 'text.disabled'}>
            R$ {price}
          </Typography>
        </div>
        {!isTrialTier ? (
          <Typography className="text-center font-medium mb-6" color={activedSubscription ? 'secondary.contrastText' : 'text.disabled'}>
            Assinatura Mensal
          </Typography>
        ) : (
          <>
            <Typography className="text-center font-medium mb-6" color={activedSubscription ? 'secondary.contrastText' : 'text.disabled'}>
              Assinatura Teste
            </Typography>
            {isLastItem && (
              <Button key="change" variant="contained" color="secondary" className="mt-8 w-full lg:mt-auto" onClick={() => handleSubscribe()}>
                Assinar Agora
              </Button>
            )}
          </>
        )}
        {!isTrialTier && isLastItem && (
          <>
            {(isExpired || isCanceled) && (
              <Button key="renew" variant="contained" color="secondary" className="mt-8 w-full lg:mt-auto" onClick={() => handleRenewSubscription()}>
                Renovar Assinatura
              </Button>
            )}
            {!isCanceled && !isExpired && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/subscriptions/${subscriptionUid}`)}
                className="mt-8 w-full lg:mt-auto"
              >
                Mais Informações
              </Button>
            )}
          </>
        )}

        <DefaultConfirmModal
          open={openModal}
          title={modalConfig.title}
          message={
            <TablePricingPage
              onPlanSelect={(period, planTitle, price) => {
                setSelectedPlanData({ period, planTitle, price });
              }}
              onProcessComplete={handleCloseModal}
              onRefetchSubscription={onRefetchSubscriptions}
              currentUserSubscription={{
                subscriptionName: title,
                status: subscriptionStatus,
              }}
            />
          }
          cancelText="Cancelar"
          onCancel={handleCloseModal}
          confirmColor="primary"
          maxWidth="md"
          removeConfirm
          hideCancel
        />
      </Box>
    </Paper>
  );
}

export default SinglePricingCard;
