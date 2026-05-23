import { useState } from 'react';
import { darken } from '@mui/material/styles';
import Box from '@mui/material/Box';
import clsx from 'clsx';
import { motion } from 'motion/react';
import TablePricingTable from './TablePricingTable';
import SubscriptionConfirmation from './SubscriptionConfirmation';
import useUser from '@auth/useUser';
import { useCreateSubscriptionMutation } from '@/store/api/subscriptionApi';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch } from '@/store/hooks';

/**
 * The table pricing page.
 */
interface TablePricingPageProps {
  onPlanSelect?: (period: 'month' | 'year', planTitle: string, price: string) => void;
  onProcessComplete?: () => void;
  onRefetchSubscription?: () => void;
  currentUserSubscription?: {
    subscriptionName?: string;
    status?: string;
    price?: string;
    startDate?: string;
    endDate?: string;
  };
}

function TablePricingPage({ onPlanSelect, onProcessComplete, onRefetchSubscription, currentUserSubscription }: TablePricingPageProps) {
  const [period, setPeriod] = useState<'month' | 'year'>('month');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    title: string;
    monthlyPrice: string;
    yearlyPrice: string;
    totalYearlyPrice: string;
  } | null>(null);

  const [createSubscription, { isLoading: isLoadingCreateSubscription }] = useCreateSubscriptionMutation();
  const dispatch = useAppDispatch();
  const { data: user } = useUser();

  const handlePlanSelect = (planTitle: string, price: string, planData: any) => {
    setSelectedPlan({
      title: planTitle,
      monthlyPrice: planData.monthlyPrice,
      yearlyPrice: planData.yearlyPrice,
      totalYearlyPrice: planData.totalYearlyPrice,
    });
    onPlanSelect?.(period, planTitle, price);
  };

  const handleConfirmationChange = (show: boolean) => {
    setShowConfirmation(show);
  };

  const handlePeriodSelect = (newPeriod: 'month' | 'year') => {
    setPeriod(newPeriod);
    if (selectedPlan) {
      const price = newPeriod === 'month' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice;
      onPlanSelect?.(newPeriod, selectedPlan.title, price);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setSelectedPlan(null);
  };

  const handleConfirm = async () => {
    if (selectedPlan) {
      const price = period === 'month' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice;

      try {
        const ip = await fetch('https://api.ipify.org?format=json')
          .then((res) => res.json())
          .then((data) => data.ip);

        const today = new Date().toISOString().split('T')[0];

        const payload = {
          name: selectedPlan.title,
          cpfCnpj: '',
          email: user?.data?.email || '',
          value: Number(price.replace('R$ ', '').replace('.', '').replace(',', '.')),
          dueDate: today,
          description: `Assinatura ${selectedPlan.title}`,
          billingType: 'CREDIT_CARD',
          userUid: user?.uid || '',
          percentualValue: 0,
          cycle: period === 'month' ? 'MONTHLY' : 'YEARLY',
          remoteIp: ip,
        };

        const response = await createSubscription(payload).unwrap();

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

        // Resetar estado após sucesso
        setShowConfirmation(false);
        setSelectedPlan(null);

        // Chamar callback para refetch da assinatura se existir
        onRefetchSubscription?.();

        // Chamar callback para fechar modal se existir
        onProcessComplete?.();

        // Chamar callback original se existir
        onPlanSelect?.(period, selectedPlan.title, price);
      } catch (error: any) {
        dispatch(
          showMessage({
            message: error?.data?.msg || 'Erro ao processar assinatura',
            autoHideDuration: 3000,
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
      }
    }
  };

  return (
    <div className="relative flex min-w-0 flex-auto flex-col overflow-hidden">
      {showConfirmation && selectedPlan ? (
        <SubscriptionConfirmation
          planTitle={selectedPlan.title}
          monthlyPrice={selectedPlan.monthlyPrice}
          yearlyPrice={selectedPlan.yearlyPrice}
          totalYearlyPrice={selectedPlan.totalYearlyPrice}
          onPeriodSelect={handlePeriodSelect}
          selectedPeriod={period}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
          isLoading={isLoadingCreateSubscription}
        />
      ) : (
        <div className="relative overflow-hidden">
          <svg
            className="pointer-events-none absolute inset-0 -z-1"
            viewBox="0 0 960 540"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMax slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <Box component="g" sx={{ color: 'divider' }} className="opacity-20" fill="none" stroke="currentColor" strokeWidth="100">
              <circle r="234" cx="196" cy="23" />
              <circle r="234" cx="790" cy="491" />
            </Box>
          </svg>

          <div className="flex flex-col items-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }}>
              <Box
                className="mt-8 flex items-center overflow-hidden rounded-full p-0.5 sm:mt-16"
                sx={{ backgroundColor: (theme) => darken(theme.palette.background.default, 0.05) }}
              >
                <Box
                  component="button"
                  className={clsx('h-9 cursor-pointer items-center rounded-full px-4 font-medium', period === 'year' && 'shadow-sm')}
                  onClick={() => setPeriod('year')}
                  sx={[
                    period === 'year'
                      ? {
                          backgroundColor: 'background.paper',
                        }
                      : {
                          backgroundColor: '',
                        },
                  ]}
                  type="button"
                >
                  Anual
                </Box>
                <Box
                  component="button"
                  className={clsx('h-9 cursor-pointer items-center rounded-full px-4 font-medium', period === 'month' && 'shadow-sm')}
                  onClick={() => setPeriod('month')}
                  sx={[
                    period === 'month'
                      ? {
                          backgroundColor: 'background.paper',
                        }
                      : {
                          backgroundColor: '',
                        },
                  ]}
                  type="button"
                >
                  Mensal
                </Box>
              </Box>
            </motion.div>
          </div>
          <TablePricingTable
            period={period}
            onPlanSelect={handlePlanSelect}
            showConfirmation={showConfirmation}
            onConfirmationChange={handleConfirmationChange}
            currentUserSubscription={currentUserSubscription}
          />
        </div>
      )}
    </div>
  );
}

export default TablePricingPage;
