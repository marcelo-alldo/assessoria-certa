import { Container, LinearProgress, styled, useTheme } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import DashboardHeader from './DashboardHeader';
import { motion } from 'motion/react';
import DefaultWidget from './widgets/DefaultWidget';
import { useGetDashboardUserQuery } from '@/store/api/resportsApi';
import LeadsClientsWidget from './widgets/LeadsClientsWidget';

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
  const { data: dashboardData, isLoading: isLoadingDashboard } = useGetDashboardUserQuery(undefined, { refetchOnMountOrArgChange: true });
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
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full min-w-0 py-6 px-6 md:px-8"
                  initial="hidden"
                  animate="show"
                >
                  <motion.div variants={item}>
                    <DefaultWidget
                      isLoading={false}
                      count={dashboardData?.data?.totalLeads || 0}
                      header="Eleitores"
                      title="Total de Eleitores"
                      subtitle="Eleitores cadastrados no sistema"
                      color={theme.palette.primary.main}
                    />
                  </motion.div>
                  <motion.div variants={item}>
                    <DefaultWidget
                      isLoading={false}
                      count={dashboardData?.data?.totalClientsEnable || 0}
                      header="Apoiadores"
                      title="Apoiadores Ativos"
                      subtitle={`Total de apoiadores inativos ${dashboardData?.data?.totalClientsDisable || 0}`}
                      color={theme.palette.primary.main}
                    />
                  </motion.div>
                  <motion.div variants={item}>
                    <DefaultWidget
                      isLoading={false}
                      count={dashboardData?.data?.totalCollaborators || 0}
                      header="Assessores"
                      title="Total de assessores"
                      subtitle="Assessores ativos no sistema"
                      color={theme.palette.primary.main}
                    />
                  </motion.div>
                  <motion.div variants={item}>
                    <DefaultWidget
                      isLoading={false}
                      count={dashboardData?.data?.totalMessagesPending || 0}
                      header="Mensagens Agendadas"
                      title={`Total de mensagens pendentes`}
                      subtitle={`Total mensagens criadas ${dashboardData?.data?.totalMessages || 0}`}
                      color={theme.palette.primary.main}
                    />
                  </motion.div>
                  <motion.div variants={item} className="sm:col-span-2 md:col-span-4">
                    <LeadsClientsWidget
                      usersIssuesData={{
                        overview: {
                          year: {
                            'all-year-leads': dashboardData?.data?.leadsPerMonth?.reduce((acc, curr) => acc + Number(curr), 0),
                            'all-year-clients': dashboardData?.data?.clientsPerMonth?.reduce((acc, curr) => acc + Number(curr), 0),
                          },
                        },
                        series: {
                          year: [
                            {
                              name: 'Eleitores',
                              type: 'line',
                              data: dashboardData?.data?.leadsPerMonth || [],
                            },
                            {
                              name: 'Apoiadores',
                              type: 'bar',
                              data: dashboardData?.data?.clientsPerMonth || [],
                            },
                          ],
                        },
                        ranges: {
                          year: 'Ano',
                        },
                        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                      }}
                    />
                  </motion.div>
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
