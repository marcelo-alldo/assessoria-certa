import { Box, Container, LinearProgress, styled, Typography, useTheme } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import DashboardHeader from './DashboardHeader';
import { motion } from 'motion/react';
import DefaultWidget from './widgets/DefaultWidget';
import { useGetOriginsQuery } from '@/store/api/originsApi';

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

/**
 * The Dashboard.
 */

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function Dashboard() {
  const { data: dashboardData, isLoading: isLoadingDashboard } = useGetOriginsQuery('dashboard=true', { refetchOnMountOrArgChange: true });
  const theme = useTheme();

  return (
    <Root
      scroll="content"
      header={<DashboardHeader />}
      content={
        <>
          {isLoadingDashboard ? (
            <div className="w-full">
              <LinearProgress color="secondary" />
            </div>
          ) : (
            <Container>
              <div className="flex flex-1 flex-col overflow-x-auto ">
                <Box className="flex flex-col pl-6 pb-6 mt-4">
                  <Typography variant="subtitle1" color="text.secondary">
                    Acompanhe a performance das suas origens de leads e descubra quais canais estão gerando mais conversões.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <br />
                    Este dashboard mostra o total de leads capturados por cada origem configurada em tempo real.
                    <br />
                    Use esses dados para otimizar seus investimentos e focar nos canais mais efetivos para o seu negócio.
                  </Typography>
                </Box>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full min-w-0 py-6 px-6 md:px-8"
                  initial="hidden"
                  animate="show"
                >
                  {dashboardData?.data?.map((item) => (
                    <>
                      <motion.div key={item.uid}>
                        <DefaultWidget
                          isLoading={false}
                          count={item?._count?.originTracings || 0}
                          header={item?.name}
                          title="Total de Leads"
                          subtitle={item?.key}
                          color={theme.palette.primary.main}
                          tagName={item?.tag?.name}
                          colorTag={item?.tag?.color}
                        />
                      </motion.div>
                    </>
                  ))}
                </motion.div>
              </div>
            </Container>
          )}
        </>
      }
      // scroll={isMobile ? 'normal' : 'content'}
    />
  );
}

export default Dashboard;
