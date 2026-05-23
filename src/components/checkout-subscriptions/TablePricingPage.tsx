import { useState, useEffect, useRef } from 'react';
import { darken } from '@mui/material/styles';
import Box from '@mui/material/Box';
import clsx from 'clsx';
import { motion } from 'motion/react';
import TablePricingTable, { TableDataItemType } from './TablePricingTable';
import SubscriptionConfirmation from './subscription-confirmation/SubscriptionConfirmation';
import type { SubscriptionConfirmationFormData } from './subscription-confirmation/SubscriptionConfirmation';
import useUser from '@auth/useUser';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch } from '@/store/hooks';
import UseJwtAuth from '@auth/services/jwt/useJwtAuth';
import { JwtSignUpPayload } from '@auth/services/jwt/JwtAuthProvider';
import { useNavigate } from 'react-router';

/**
 * The table pricing page.
 */
interface TablePricingPageProps {
  onPlanSelect?: (period: 'month' | 'year', planTitle: string, price: string) => void;
  onProcessComplete?: () => void;
  onRefetchSubscription?: () => void;
  selectedPlanData?: {
    period: 'month' | 'year';
    title: string;
    price: string;
    priceYearly: string;
    uid: string;
  };
  currentUserSubscription?: {
    subscriptionName?: string;
    status?: string;
    price?: string;
    startDate?: string;
    endDate?: string;
    uid?: string;
  };
  tableData: TableDataItemType[];
  mode: 'DEFAULT' | 'OPTICO' | 'ASSESSOR';
}

function TablePricingPage({
  onPlanSelect,
  onProcessComplete,
  onRefetchSubscription,
  currentUserSubscription,
  selectedPlanData,
  tableData,
  mode,
}: TablePricingPageProps) {
  const [period, setPeriod] = useState<'month' | 'year'>('month');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    title: string;
    monthlyPrice: string;
    yearlyPrice: string;
    totalYearlyPrice: string;
    uid: string;
  } | null>(null);
  const [isLoadingCreateSubscription, setIsLoading] = useState(false);
  const resetFormRef = useRef<(() => void) | null>(null);
  const resetForm = () => resetFormRef.current?.();
  const navigate = useNavigate();

  const { signUp } = UseJwtAuth();
  const dispatch = useAppDispatch();
  const { data: user } = useUser();

  const handlePlanSelect = (planTitle: string, price: string, planData?: TableDataItemType) => {
    setSelectedPlan({
      title: planTitle,
      monthlyPrice: planData?.monthlyPrice || price,
      yearlyPrice: planData?.yearlyPrice || price,
      totalYearlyPrice: planData?.yearlyPrice || price,
      uid: '',
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

  const handleConfirm = async (formData: SubscriptionConfirmationFormData) => {
    if (selectedPlan) {
      setIsLoading(true);

      const price = period === 'month' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice;

      try {
        const ip = await fetch('https://api.ipify.org?format=json')
          .then((res) => res.json())
          .then((data) => data.ip);

        const billingTypeByMethod = {
          credit_card: 'CREDIT_CARD',
          pix: 'PIX',
          boleto: 'BOLETO',
          trial: 'TRIAL',
        } as const;

        // const { password, name, role, email, phone, cnpj, subscription, mode } =

        const payload: JwtSignUpPayload = {
          mode: mode,
          email: formData.email || user?.data?.email || '',
          password: formData.password || '',
          name: formData.fullName || '',
          phone: formData.phone || '',
          value: Number(price.replace('R$ ', '').replace('.', '').replace(',', '.')),
          description: `Assinatura ${selectedPlan.title}`,
          billingType: billingTypeByMethod[formData.selectedPaymentMethod],
          userUid: user?.uid || '',
          cycle: period === 'month' ? 'MONTHLY' : 'YEARLY',
          remoteIp: ip,
          subscription: formData.subscriptionUid,
          creditCardInfo:
            formData.selectedPaymentMethod === 'credit_card'
              ? {
                  holderName: formData.holderName,
                  number: formData.number,
                  expiryMonth: formData.expiryMonth,
                  expiryYear: formData.expiryYear,
                  ccv: formData.ccv,
                  cpfCnpj: formData.cpfCnpj || '',
                  fullName: formData.fullName,
                  postalCode: formData.postalCode,
                  addressNumber: formData.addressNumber,
                  addressComplement: formData.addressComplement,
                  cardAlias: formData.cardAlias,
                }
              : undefined,
        };

        signUp(payload)
          .then((response) => {
            setIsLoading(false);
            dispatch(
              showMessage({
                message: 'Cadastro realizado com sucesso. Confirme seu e-mail para ativar a conta.',
                autoHideDuration: 6000,
                variant: 'success',
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'right',
                },
              }),
            );
            resetForm();
            setTimeout(() => {
              navigate('/sign-in');
            }, 2000);
          })
          .catch((error: FetchApiError) => {
            const errorData = error.data as {
              type: 'email' | 'password' | `root.${string}` | 'root';
              message: string;
            }[];
            console.log('Signup Error:', { error, errorData });
            dispatch(
              showMessage({
                message: errorData?.msg || 'Ocorreu um erro durante o cadastro. Por favor, tente novamente.',
                autoHideDuration: 3000,
                variant: 'error',
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'right',
                },
              }),
            );
            setIsLoading(false);
            errorData?.forEach?.(({ message, type }) => {
              setError(type, { type: 'manual', message });
            });
          });

        // Resetar estado após sucesso
        setShowConfirmation(false);
        setSelectedPlan(null);

        // Chamar callback para refetch da assinatura se existir
        onRefetchSubscription?.();

        // Chamar callback para fechar modal se existir
        onProcessComplete?.();

        // Chamar callback original se existir
        onPlanSelect?.(period, selectedPlan.title, price);
      } catch (error: unknown) {
        const errorMessage =
          typeof error === 'object' && error !== null && 'data' in error ? (error as { data?: { msg?: string } }).data?.msg : undefined;

        dispatch(
          showMessage({
            message: errorMessage || 'Erro ao processar assinatura',
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

  useEffect(() => {
    if (selectedPlanData) {
      setShowConfirmation(true);
      setSelectedPlan({
        title: selectedPlanData.title,
        monthlyPrice: selectedPlanData.price,
        yearlyPrice: selectedPlanData.priceYearly,
        totalYearlyPrice: selectedPlanData.priceYearly,
        uid: selectedPlanData.uid,
      });
      onPlanSelect?.(selectedPlanData.period, selectedPlanData.title, selectedPlanData.price);
    }
  }, [selectedPlanData, onPlanSelect]);

  return (
    <div className="relative flex min-w-0 flex-auto flex-col overflow-hidden">
      {showConfirmation && selectedPlan ? (
        <SubscriptionConfirmation
          planTitle={selectedPlan.title}
          monthlyPrice={selectedPlan.monthlyPrice}
          yearlyPrice={selectedPlan.yearlyPrice}
          totalYearlyPrice={selectedPlan.totalYearlyPrice}
          uid={selectedPlan.uid}
          onPeriodSelect={handlePeriodSelect}
          selectedPeriod={period}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
          isLoading={isLoadingCreateSubscription}
          onFormReady={(fn) => {
            resetFormRef.current = fn;
          }}
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
            tableData={tableData}
          />
        </div>
      )}
    </div>
  );
}

export default TablePricingPage;
