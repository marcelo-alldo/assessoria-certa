import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, Fade, Chip, Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { CalendarToday, FilterList, Clear } from '@mui/icons-material';
import { motion } from 'motion/react';

export type DateFilterType = 'all' | 'last15Days' | 'last30Days' | 'custom';

export interface DateFilterState {
  filterType: DateFilterType;
  startDate: Date | null;
  endDate: Date | null;
}

interface DateFilterWidgetProps {
  onFilterChange: (filter: DateFilterState) => void;
  currentFilter: DateFilterState;
}

const DateFilterWidget: React.FC<DateFilterWidgetProps> = ({ onFilterChange, currentFilter }) => {
  const [localFilter, setLocalFilter] = useState<DateFilterState>(currentFilter);

  const handleFilterTypeChange = (filterType: DateFilterType) => {
    let newFilter: DateFilterState = {
      filterType,
      startDate: null,
      endDate: null,
    };

    if (filterType === 'last15Days') {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 15);
      newFilter = {
        filterType,
        startDate,
        endDate,
      };
    } else if (filterType === 'last30Days') {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      newFilter = {
        filterType,
        startDate,
        endDate,
      };
    }

    setLocalFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleCustomDateChange = (field: 'startDate' | 'endDate', date: Date | null) => {
    const newFilter: DateFilterState = {
      ...localFilter,
      filterType: 'custom',
      [field]: date,
    };

    setLocalFilter(newFilter);

    // Só aplicar o filtro se ambas as datas estiverem preenchidas ou se for para limpar
    if ((newFilter.startDate && newFilter.endDate) || (!newFilter.startDate && !newFilter.endDate)) {
      onFilterChange(newFilter);
    }
  };

  const handleClearFilter = () => {
    const newFilter: DateFilterState = {
      filterType: 'all',
      startDate: null,
      endDate: null,
    };
    setLocalFilter(newFilter);
    onFilterChange(newFilter);
  };

  const getFilterLabel = () => {
    switch (localFilter.filterType) {
      case 'last15Days':
        return 'Últimos 15 dias';
      case 'last30Days':
        return 'Últimos 30 dias';
      case 'custom':
        if (localFilter.startDate && localFilter.endDate) {
          return `${localFilter.startDate.toLocaleDateString('pt-BR')} - ${localFilter.endDate.toLocaleDateString('pt-BR')}`;
        }
        return 'Período personalizado';
      default:
        return 'Todos os períodos';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card
          sx={{
            mb: 4,
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <CalendarToday sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="600" color="text.primary">
                Filtro por Período
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              {localFilter.filterType !== 'all' && (
                <Button size="small" startIcon={<Clear />} onClick={handleClearFilter} sx={{ color: 'text.secondary' }}>
                  Limpar
                </Button>
              )}
            </Box>

            <Stack spacing={3}>
              {/* Filtros Rápidos */}
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Períodos Predefinidos
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant={localFilter.filterType === 'all' ? 'contained' : 'outlined'}
                    onClick={() => handleFilterTypeChange('all')}
                    size="small"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                    }}
                  >
                    Todos
                  </Button>
                  <Button
                    variant={localFilter.filterType === 'last15Days' ? 'contained' : 'outlined'}
                    onClick={() => handleFilterTypeChange('last15Days')}
                    size="small"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                    }}
                  >
                    Últimos 15 dias
                  </Button>
                  <Button
                    variant={localFilter.filterType === 'last30Days' ? 'contained' : 'outlined'}
                    onClick={() => handleFilterTypeChange('last30Days')}
                    size="small"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                    }}
                  >
                    Últimos 30 dias
                  </Button>
                  <Button
                    variant={localFilter.filterType === 'custom' ? 'contained' : 'outlined'}
                    onClick={() => handleFilterTypeChange('custom')}
                    size="small"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                    }}
                  >
                    Personalizado
                  </Button>
                </Box>
              </Box>

              {/* Filtro Personalizado */}
              <Fade in={localFilter.filterType === 'custom'}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Período Personalizado
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="Data Inicial"
                        value={localFilter.startDate}
                        onChange={(date) => handleCustomDateChange('startDate', date)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                          },
                        }}
                        maxDate={localFilter.endDate || new Date()}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="Data Final"
                        value={localFilter.endDate}
                        onChange={(date) => handleCustomDateChange('endDate', date)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                          },
                        }}
                        minDate={localFilter.startDate}
                        maxDate={new Date()}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Fade>

              {/* Indicador do Filtro Atual */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterList sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  Filtro ativo:
                </Typography>
                <Chip
                  label={getFilterLabel()}
                  size="small"
                  color={localFilter.filterType !== 'all' ? 'primary' : 'default'}
                  variant={localFilter.filterType !== 'all' ? 'filled' : 'outlined'}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </motion.div>
    </LocalizationProvider>
  );
};

export default DateFilterWidget;
