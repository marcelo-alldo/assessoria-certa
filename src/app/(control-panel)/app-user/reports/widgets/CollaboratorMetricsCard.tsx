import { Card, CardContent, Typography, Box, Grid, Avatar } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { motion } from 'motion/react';
import PersonIcon from '@mui/icons-material/Person';
import CollaboratorPieChart from './CollaboratorPieChart';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease-in-out',
  margin: '0 auto',
  maxWidth: '400px',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.main,
  },
}));

const MetricBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

interface CollaboratorData {
  collaboratorName: string;
  collaboratorUid: string;
  currentAttendances: number;
  inProgressAttendances: number;
  finalizedAttendances: number;
  convertedAttendances: number;
}

interface CollaboratorMetricsCardProps {
  collaborator: CollaboratorData;
  index: number;
}

function CollaboratorMetricsCard({ collaborator, index }: CollaboratorMetricsCardProps) {
  const theme = useTheme();

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  // Usar a cor amarela do sistema para o gráfico de pizza
  const pieChartColor = theme.palette.secondary.main;

  const metrics = [
    {
      label: 'Total de Atendimentos',
      value: collaborator.currentAttendances || 0,
    },
    {
      label: 'Total em Progresso',
      value: collaborator.inProgressAttendances || 0,
    },
    {
      label: 'Total Finalizados',
      value: collaborator.finalizedAttendances || 0,
    },
    {
      label: 'Total Convertidos',
      value: collaborator.convertedAttendances || 0,
    },
  ];

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="show">
      <StyledCard>
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          {/* Header do Card com Nome do Colaborador */}
          <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
            <Avatar
              sx={{
                bgcolor: 'black',
                width: 48,
                height: 48,
                mr: 2,
              }}
            >
              <PersonIcon />
            </Avatar>
            <Box textAlign="left">
              <Typography variant="h6" component="h3" fontWeight="600" color="text.primary">
                {collaborator.collaboratorName}
              </Typography>
            </Box>
          </Box>

          {/* Gráfico de Pizza */}
          <Box mb={3} display="flex" justifyContent="center">
            <CollaboratorPieChart collaborator={collaborator} color={pieChartColor} />
          </Box>

          {/* Métricas */}
          <Grid container spacing={2} justifyContent="center" alignItems="center">
            {metrics.map((metric, metricIndex) => (
              <Grid item xs={12} key={metricIndex}>
                <MetricBox>
                  <Box flex={1} display="flex" flexDirection="column" alignItems="center" textAlign="center">
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                      {metric.label}
                    </Typography>
                    <Typography variant="h5" component="div" fontWeight="700" color="text.primary">
                      {metric.value.toLocaleString()}
                    </Typography>
                  </Box>
                </MetricBox>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </StyledCard>
    </motion.div>
  );
}

export default CollaboratorMetricsCard;
