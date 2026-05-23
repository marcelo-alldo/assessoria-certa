import { Container, LinearProgress, styled, useTheme } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import DashboardHeader from './DashboardHeader';
import { motion } from 'motion/react';
import DefaultWidget from './widgets/DefaultWidget';
import UsersIssuesWidget from './widgets/UsersIssuesWidget';
import { useGetDashboardQuery } from '@/store/api/adminApi';

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
  const { data: dashboardData, isLoading: isLoadingDashboard } = useGetDashboardQuery(undefined, { refetchOnMountOrArgChange: true });
  const theme = useTheme();

  return (
    <Root
      header={<DashboardHeader />}
      content={
        <>
          {isLoadingDashboard ? (
            <div className="w-full">
              <LinearProgress color="secondary" />
            </div>
          ) : (
            <Container>
              <div className="flex flex-1 flex-col">
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full min-w-0 py-6 px-6 md:px-8"
                  initial="hidden"
                  animate="show"
                >
                  <motion.div variants={item}>
                    <DefaultWidget
                      isLoading={false}
                      count={dashboardData?.data?.totalUsers || 0}
                      header="Usuários"
                      title="Usuários ativos"
                      subtitle="Usuários ativos no sistema"
                      color={theme.palette.primary.main}
                    />
                  </motion.div>
                  <motion.div variants={item}>
                    <DefaultWidget
                      isLoading={false}
                      count={dashboardData?.data?.totalFreeTier || 0}
                      header="Assinatura"
                      title="Free Tier"
                      subtitle="Usuários testando o Alldo"
                      color={theme.palette.primary.main}
                    />
                  </motion.div>
                  <motion.div variants={item}>
                    <DefaultWidget
                      isLoading={false}
                      count={dashboardData?.data?.totalStandard || 0}
                      header="Assinatura"
                      title="Assinatura Padrão"
                      subtitle="Usuários com assinatura Padrão ativa"
                      color={theme.palette.primary.main}
                    />
                  </motion.div>
                  <motion.div variants={item}>
                    <DefaultWidget
                      isLoading={false}
                      count={dashboardData?.data?.totalCustom || 0}
                      header="Assinatura"
                      title="Assinatura Customizada"
                      subtitle="Usuários com assinatura Custom ativa"
                      color={theme.palette.primary.main}
                    />
                  </motion.div>
                  <motion.div variants={item} className="sm:col-span-2 md:col-span-4">
                    <UsersIssuesWidget
                      usersIssuesData={{
                        overview: {
                          week: {
                            'all-week-users': Object.values(dashboardData.data.usersPerDay).reduce((acc, curr) => acc + Number(curr), 0),
                          },
                        },
                        series: {
                          week: [
                            {
                              name: 'Usuários',
                              type: 'line',
                              data: [
                                dashboardData?.data?.usersPerDay?.monday,
                                dashboardData?.data?.usersPerDay?.tuesday,
                                dashboardData?.data?.usersPerDay?.wednesday,
                                dashboardData?.data?.usersPerDay?.thursday,
                                dashboardData?.data?.usersPerDay?.friday,
                                dashboardData?.data?.usersPerDay?.saturday,
                                dashboardData?.data?.usersPerDay?.sunday,
                              ],
                            },
                          ],
                        },
                        ranges: {
                          week: 'Semana',
                        },
                        labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                      }}
                    />
                  </motion.div>
                </motion.div>
              </div>
            </Container>
          )}
        </>
      }
    />
  );
}

export default Dashboard;
