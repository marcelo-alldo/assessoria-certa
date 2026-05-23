import { Box, Typography, Button, Card, CardContent, Divider, Radio, RadioGroup, FormControlLabel, FormControl } from '@mui/material';
import { format, addMonths, addYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { number } from 'zod';

interface SubscriptionConfirmationProps {
  planTitle: string;
  monthlyPrice: string;
  yearlyPrice: string;
  totalYearlyPrice: string;
  onPeriodSelect: (period: 'month' | 'year') => void;
  selectedPeriod: 'month' | 'year';
  onCancel: () => void;
  onConfirm?: () => void;
  isLoading?: boolean;
}

function SubscriptionConfirmation({
  planTitle,
  monthlyPrice,
  yearlyPrice,
  totalYearlyPrice,
  onPeriodSelect,
  selectedPeriod,
  onCancel,
  onConfirm,
  isLoading = false,
}: SubscriptionConfirmationProps) {
  const nextDueDate = selectedPeriod === 'month' ? addMonths(new Date(), 1) : addYears(new Date(), 1);

  const formatPrice = (price: string | number) => {
    return `R$ ${price}`;
  };

  const calculateYearlyDiscount = () => {
    const monthlyTotal = parseFloat(monthlyPrice.replace('R$ ', '').replace('.', '').replace(',', '.')) * 12;
    const yearlyTotal = parseFloat(yearlyPrice.replace('R$ ', '').replace('.', '').replace(',', '.')) * 12;
    const discount = ((monthlyTotal - yearlyTotal) / monthlyTotal) * 100;
    return Math.round(discount);
  };

  return (
    <Box className="flex flex-col gap-6 p-4">
      <Box className="text-center">
        <Typography variant="h5" className="font-bold mb-2">
          Confirme sua assinatura
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Plano selecionado: <strong>{planTitle}</strong>
        </Typography>
      </Box>

      <FormControl component="fieldset">
        <RadioGroup value={selectedPeriod} onChange={(e) => onPeriodSelect(e.target.value as 'month' | 'year')}>
          <Card className="mb-3" variant="outlined">
            <CardContent className="p-4">
              <FormControlLabel
                value="month"
                control={<Radio color="secondary" />}
                label={
                  <Box className="flex justify-between items-center w-full ml-2">
                    <Box>
                      <Typography variant="body1" className="font-medium">
                        Plano Mensal
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Cobrança mensal
                      </Typography>
                    </Box>
                    <Typography variant="h6" className="font-bold">
                      {formatPrice(monthlyPrice)}/mês
                    </Typography>
                  </Box>
                }
                className="m-0 w-full"
              />
            </CardContent>
          </Card>

          <Card variant="outlined" className="border-2 border-secondary-main">
            <CardContent className="p-4">
              <FormControlLabel
                value="year"
                control={<Radio color="secondary" />}
                label={
                  <Box className="flex justify-between items-center w-full ml-2">
                    <Box>
                      <Typography variant="body1" className="font-medium">
                        Plano Anual
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Economize {calculateYearlyDiscount()}% pagando anualmente
                      </Typography>
                    </Box>
                    <Box className="text-right">
                      <Typography variant="h6" className="font-bold">
                        {formatPrice(yearlyPrice.replace('R$ ', '').replace('.', '').replace(',', '.'))}/mês
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatPrice((parseFloat(yearlyPrice.replace('R$ ', '').replace('.', '').replace(',', '.')) * 12).toFixed(2)).replace(
                          '.',
                          ',',
                        )}{' '}
                        por ano
                      </Typography>
                    </Box>
                  </Box>
                }
                className="m-0 w-full"
              />
            </CardContent>
          </Card>
        </RadioGroup>
      </FormControl>

      <Divider />

      <Box className="bg-gray-50 p-4 rounded-lg">
        <Box className="flex justify-between items-center mb-2">
          <Typography variant="body1" className="font-medium">
            Valor total:
          </Typography>
          <Typography variant="h6" className="font-bold">
            {selectedPeriod === 'month'
              ? formatPrice(parseFloat(monthlyPrice.replace('R$ ', '').replace('.', '').replace(',', '.')).toFixed(2)).replace('.', ',')
              : formatPrice((parseFloat(yearlyPrice.replace('R$ ', '').replace('.', '').replace(',', '.')) * 12).toFixed(2)).replace('.', ',')}
          </Typography>
        </Box>

        <Box className="flex justify-between items-center">
          <Typography variant="body2" color="text.secondary">
            Próximo vencimento:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {format(nextDueDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </Typography>
        </Box>
      </Box>

      <Box className="flex gap-3 mt-4">
        <Button variant="outlined" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button variant="contained" color="secondary" onClick={onConfirm} className="flex-1" disabled={isLoading}>
          {isLoading ? 'Processando...' : 'Confirmar Assinatura'}
        </Button>
      </Box>
    </Box>
  );
}

export default SubscriptionConfirmation;
