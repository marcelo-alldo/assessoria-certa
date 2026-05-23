import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import { TableDataItemType } from './TablePricingTable';

interface TablePricingTableHeadProps {
  data: TableDataItemType;
  period: 'month' | 'year';
  onPlanSelect?: (planTitle: string, price: string, planData: TableDataItemType) => void;
  selectedPlanData?: { period?: 'month' | 'year'; planTitle?: string; price?: string };
  showConfirmation?: boolean;
  onConfirmationChange?: (show: boolean) => void;
  currentUserSubscription?: {
    subscriptionName?: string;
    status?: string;
    price?: string;
    startDate?: string;
    endDate?: string;
  };
}

/**
 * The table pricing table head component.
 */
function TablePricingTableHead({
  data,
  period = 'month',
  onPlanSelect,
  showConfirmation = false,
  onConfirmationChange,
  currentUserSubscription,
}: TablePricingTableHeadProps) {
  const { title, yearlyPrice, monthlyPrice, buttonTitle, isPopular, totalYearlyPrice } = data;

  // Verificar se este é o plano atual do usuário
  const isCurrentPlan = currentUserSubscription?.subscriptionName === title;

  const handleClick = async () => {
    if (buttonTitle === 'Falar com especialista') {
      const contact1Formatted = import.meta.env.VITE_APP_CONTACT_1 ? '55' + import.meta.env.VITE_APP_CONTACT_1.replace(/\D/g, '') : '';
      const whatsappUrl = `https://wa.me/${contact1Formatted}?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre o Alldo CUSTOMIZADO.')}`;
      window.open(whatsappUrl, '_blank');
      return;
    }

    const price = period === 'month' ? data.monthlyPrice : data.yearlyPrice;
    onPlanSelect?.(data.title, price, data);
    onConfirmationChange?.(true);
  };

  return (
    <Box className="flex flex-col" sx={{ backgroundColor: 'background.paper' }}>
      <div className="flex flex-col justify-center p-4 pt-3 lg:py-8">
        <div className="flex items-center">
          <div className="text-xl font-medium lg:text-2xl">{title}</div>

          {isCurrentPlan && (
            <Chip
              label="PLANO ATUAL"
              color="primary"
              className="mx-3 h-6 rounded-full px-1 text-center text-sm font-semibold leading-none tracking-wide"
              size="small"
            />
          )}

          {isPopular && !isCurrentPlan && (
            <Chip
              label="POPULAR"
              color="secondary"
              className="mx-3 hidden h-6 rounded-full px-1 text-center text-sm font-semibold leading-none tracking-wide md:flex"
              size="small"
            />
          )}
        </div>

        <div className="flex items-baseline whitespace-nowrap lg:mt-4">
          <Typography className="text-lg" color="text.secondary">
            R$
          </Typography>
          <Typography className="text-2xl font-bold tracking-tight lg:mx-2 lg:text-4xl">
            {period === 'month' && monthlyPrice}
            {period === 'year' && yearlyPrice}
          </Typography>
          <Typography className="text-2xl" color="text.secondary">
            / mês
          </Typography>
        </div>
        <Typography className="mt-1 text-sm lg:mt-3 lg:text-base" color="text.secondary">
          <b>{totalYearlyPrice}</b> cobrado anualmente
        </Typography>

        <Button
          className="mt-8 w-full"
          size="large"
          variant={isCurrentPlan ? 'contained' : isPopular ? 'contained' : 'outlined'}
          color={isCurrentPlan ? 'primary' : isPopular ? 'secondary' : 'inherit'}
          onClick={handleClick}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan ? 'Plano Atual' : buttonTitle}
        </Button>
      </div>
    </Box>
  );
}

export default TablePricingTableHead;
