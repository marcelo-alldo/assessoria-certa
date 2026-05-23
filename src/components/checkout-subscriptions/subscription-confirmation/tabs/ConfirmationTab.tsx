import { Box, Typography, Card, CardContent, Divider, Radio, RadioGroup, FormControlLabel, FormControl } from '@mui/material';
import { format, addMonths, addYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Controller, Control } from 'react-hook-form';

interface FormData {
  selectedPeriod?: 'month' | 'year';
}

interface ConfirmationTabProps {
  planTitle: string;
  monthlyPrice: string;
  yearlyPrice: string;
  _totalYearlyPrice?: string;
  _uid?: string;
  onPeriodSelect: (period: 'month' | 'year') => void;
  selectedPeriod: 'month' | 'year';
  control: Control<FormData>;
}

export function ConfirmationTab({
  planTitle,
  monthlyPrice,
  yearlyPrice,
  _totalYearlyPrice,
  _uid,
  onPeriodSelect,
  selectedPeriod,
  control,
}: ConfirmationTabProps) {
  const nextDueDate = selectedPeriod === 'month' ? addMonths(new Date(), 1) : addYears(new Date(), 1);

  const formatPrice = (price: string | number) => {
    return `R$ ${price}`;
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
        <Controller
          name="selectedPeriod"
          control={control}
          render={({ field }) => (
            <RadioGroup
              {...field}
              onChange={(e) => {
                field.onChange(e.target.value);
                onPeriodSelect(e.target.value as 'month' | 'year');
              }}
            >
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
                            Economize 20% pagando anualmente
                          </Typography>
                        </Box>
                        <Box className="text-right">
                          <Typography variant="h6" className="font-bold">
                            R$ {Number(yearlyPrice) / 12}/mês
                          </Typography>
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

      <Divider />

      <Box className="bg-gray-50 p-4 rounded-lg">
        <Box className="flex justify-between items-center mb-2">
          <Typography variant="body1" className="font-medium">
            Valor total:
          </Typography>
          <Typography variant="h6" className="font-bold">
            {selectedPeriod === 'month' ? `R$ ${monthlyPrice}` : `R$ ${yearlyPrice}`}
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
    </Box>
  );
}
