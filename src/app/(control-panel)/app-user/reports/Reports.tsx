import { styled } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import ReportsHeader from './ReportsHeader';
import { motion } from 'motion/react';
import { useGetAttendantsQuery } from 'src/store/api/attendantHistoryApi';
import CollaboratorPerformanceWidget from './widgets/CollaboratorPerformanceWidget';
import CollaboratorMetricsCard from './widgets/CollaboratorMetricsCard';
import DateFilterWidget, { DateFilterState } from './widgets/DateFilterWidget';
import { Grid, Typography, Box, Skeleton, Alert, Container, Fade, Divider, CircularProgress, Card, CardContent } from '@mui/material';
import { Assessment, TrendingUp } from '@mui/icons-material';
import { useState, useMemo, useEffect } from 'react';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .container': {
    maxWidth: '100%!important',
  },
  '& .FusePageSimple-header': {
    backgroundColor: theme.vars.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.vars.palette.divider,
  },
}));

const ContentContainer = styled(Container)(({ theme }) => ({
  maxWidth: '1400px !important',
  padding: theme.spacing(0, 3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0, 2),
  },
  marginTop: theme.spacing(4),
  marginBlock: theme.spacing(4),
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  borderRadius: theme.spacing(1.5),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  marginRight: theme.spacing(2),
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(8, 3),
  textAlign: 'center',
  minHeight: '400px',
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(8, 3),
  textAlign: 'center',
  minHeight: '400px',
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(2px)',
    zIndex: 1,
    borderRadius: theme.spacing(1),
  },
}));

const LoadingSpinner = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const SkeletonCard = styled(Card)(({ theme }) => ({
  height: '200px',
  display: 'flex',
  flexDirection: 'column',
}));

const SkeletonContent = styled(CardContent)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

/**
 * The Reports page.
 */

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

function Reports() {
  const [dateFilter, setDateFilter] = useState<DateFilterState>({
    filterType: 'all',
    startDate: null,
    endDate: null,
  });

  const renderSkeletonCards = () => (
    <Grid container spacing={3} sx={{ mb: 6 }}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Grid item xs={12} sm={6} lg={4} xl={3} key={`skeleton-${index}`}>
          <SkeletonCard>
            <SkeletonContent>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={20} />
              <Skeleton variant="rectangular" width="100%" height={60} sx={{ mt: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Skeleton variant="text" width="30%" height={16} />
                <Skeleton variant="text" width="25%" height={16} />
              </Box>
            </SkeletonContent>
          </SkeletonCard>
        </Grid>
      ))}
    </Grid>
  );

  const queryString = useMemo(() => {
    let query = 'getCollaboratorStats=true';

    switch (dateFilter.filterType) {
      case 'last15Days':
        query += '&last15Days=true';
        break;
      case 'last30Days':
        query += '&last30Days=true';
        break;
      case 'custom':
        if (dateFilter.startDate) {
          query += `&startDate=${dateFilter.startDate.toISOString()}`;
        }

        if (dateFilter.endDate) {
          query += `&endDate=${dateFilter.endDate.toISOString()}`;
        }

        break;
      default:
        break;
    }

    return query;
  }, [dateFilter]);

  const {
    data: collaboratorStatsData,
    isLoading: isLoadingCollaboratorStats,
    isFetching: isFetchingCollaboratorStats,
    error,
    refetch,
  } = useGetAttendantsQuery(queryString, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const handleFilterChange = async (newFilter: DateFilterState) => {
    setDateFilter(newFilter);
  };

  useEffect(() => {
    if (queryString && !isLoadingCollaboratorStats) {
      refetch();
    }
  }, [queryString, refetch]);

  const shouldShowLoading = isLoadingCollaboratorStats || isFetchingCollaboratorStats;

  const collaboratorStats = collaboratorStatsData?.data || [];

  if (shouldShowLoading) {
    return (
      <Root
        scroll="content"
        header={<ReportsHeader />}
        content={
          <ContentContainer>
            <LoadingContainer>
              <CircularProgress size={24} />
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                Carregando dados dos relatórios...
              </Typography>
            </LoadingContainer>
          </ContentContainer>
        }
      />
    );
  }

  if (error) {
    return (
      <Root
        scroll="content"
        header={<ReportsHeader />}
        content={
          <ContentContainer>
            <Box sx={{ py: 6 }}>
              <Alert
                severity="error"
                sx={{
                  borderRadius: 2,
                  '& .MuiAlert-message': {
                    width: '100%',
                  },
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Erro ao carregar dados
                </Typography>
                <Typography variant="body2">Não foi possível carregar as estatísticas dos assessores. Tente novamente mais tarde.</Typography>
              </Alert>
            </Box>
          </ContentContainer>
        }
      />
    );
  }

  if (!collaboratorStats.length) {
    return (
      <Root
        header={<ReportsHeader />}
        scroll="content"
        content={
          <ContentContainer>
            <EmptyState>
              <Assessment sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h5" color="text.primary" gutterBottom fontWeight="600">
                Nenhum dado encontrado
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
                Não há estatísticas de assessores disponíveis no momento. Verifique se há atendimentos registrados no sistema.
              </Typography>
            </EmptyState>
          </ContentContainer>
        }
      />
    );
  }

  return (
    <Root
      scroll="content"
      header={<ReportsHeader />}
      content={
        <ContentContainer>
          <motion.div variants={containerVariants} initial="hidden" animate="show">
            {/* Filtro de Datas */}
            <motion.div variants={itemVariants}>
              <DateFilterWidget currentFilter={dateFilter} onFilterChange={handleFilterChange} />
            </motion.div>

            {/* Seção de Métricas dos Colaboradores */}
            <motion.div variants={itemVariants}>
              <SectionHeader>
                <IconWrapper>
                  <Assessment />
                </IconWrapper>
                <Box>
                  <Typography variant="h4" component="h2" fontWeight="700" color="text.primary" sx={{ mb: 0.5 }}>
                    Métricas por assessor
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Acompanhe o desempenho individual de cada assessor em tempo real
                  </Typography>
                </Box>
              </SectionHeader>

              {/* Container com loading overlay */}
              <Box sx={{ position: 'relative' }}>
                {shouldShowLoading && (
                  <LoadingOverlay>
                    <LoadingSpinner>
                      <CircularProgress size={32} />
                      <Typography variant="body2" color="text.secondary">
                        Atualizando dados...
                      </Typography>
                    </LoadingSpinner>
                  </LoadingOverlay>
                )}

                <Fade in={!shouldShowLoading} timeout={800}>
                  <Box>
                    {shouldShowLoading ? (
                      renderSkeletonCards()
                    ) : (
                      <Grid container spacing={3} sx={{ mb: 6 }}>
                        {collaboratorStats.map((collaborator, index) => (
                          <Grid item xs={12} sm={6} lg={4} xl={3} key={collaborator.collaboratorUid}>
                            <CollaboratorMetricsCard collaborator={collaborator} index={index} />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                </Fade>
              </Box>
            </motion.div>

            {/* Divisor Visual */}
            <motion.div variants={itemVariants}>
              <Divider sx={{ my: 6 }} />
            </motion.div>

            {/* Seção de Performance dos Assessores */}
            <motion.div variants={itemVariants}>
              <SectionHeader>
                <IconWrapper>
                  <TrendingUp />
                </IconWrapper>
                <Box>
                  <Typography variant="h4" component="h2" fontWeight="700" color="text.primary" sx={{ mb: 0.5 }}>
                    Análise de Performance
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Visualização comparativa do desempenho entre assessores
                  </Typography>
                </Box>
              </SectionHeader>

              {/* Container com loading overlay para performance */}
              <Box sx={{ position: 'relative' }}>
                {shouldShowLoading && (
                  <LoadingOverlay>
                    <LoadingSpinner>
                      <CircularProgress size={32} />
                      <Typography variant="body2" color="text.secondary">
                        Atualizando gráficos...
                      </Typography>
                    </LoadingSpinner>
                  </LoadingOverlay>
                )}

                <Fade in={!shouldShowLoading} timeout={1000}>
                  <Box>
                    {shouldShowLoading ? (
                      <Card sx={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CardContent sx={{ textAlign: 'center', width: '100%' }}>
                          <Skeleton variant="rectangular" width="100%" height={300} />
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
                            <Skeleton variant="text" width="20%" height={20} />
                            <Skeleton variant="text" width="20%" height={20} />
                            <Skeleton variant="text" width="20%" height={20} />
                          </Box>
                        </CardContent>
                      </Card>
                    ) : (
                      <CollaboratorPerformanceWidget collaboratorStats={collaboratorStats} isLoading={shouldShowLoading} />
                    )}
                  </Box>
                </Fade>
              </Box>
            </motion.div>
          </motion.div>
        </ContentContainer>
      }
    />
  );
}

export default Reports;
