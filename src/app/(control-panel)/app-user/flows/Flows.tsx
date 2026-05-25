import { Box, Button, Container, LinearProgress, styled, Typography } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { useNavigate } from 'react-router';
import FlowsHeader from './FlowsHeader';
import { useGetFlowsQuery } from './flowsApi';
import ItemFlow from './components/ItemFlow';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .container': {
    maxWidth: '100%!important',
  },
  '& .FusePageSimple-header': {
    backgroundColor: theme.vars.palette.background.default,
    borderStyle: 'solid',
    borderColor: theme.vars.palette.divider,
  },
}));

/**
 * The Flows.
 */

function Flows() {
  const navigate = useNavigate();
  const { data, isLoading, isFetching } = useGetFlowsQuery('key=FLOW,', { refetchOnMountOrArgChange: true });
  const hasFlows = (data?.data?.length ?? 0) > 0;

  return (
    <Root
      scroll="content"
      header={
        <>
          {isFetching && (
            <div className="w-full">
              <LinearProgress color="secondary" />
            </div>
          )}
          {!isLoading && <FlowsHeader />}
        </>
      }
      content={
        <div className="flex flex-1 flex-col">
          <Container maxWidth="xl">
            {hasFlows &&
              data?.data.map((flow) => {
                return <ItemFlow key={flow.uid} data={flow} />;
              })}

            {!isLoading && !hasFlows && (
              <Box className="flex flex-col items-center justify-center text-center py-24 px-6">
                <Typography variant="h4" className="font-bold mb-3">
                  Transforme seu atendimento com agentes inteligentes
                </Typography>

                <Typography variant="body2" color="text.secondary" className="max-w-2xl mb-8">
                  Ative fluxos com inteligência artificial que conversam com seus apoiadores, tiram dúvidas, qualificam eleitores e aumentam seu
                  engajamento automaticamente.
                  <br />
                  <br />
                  Além disso, automatize tarefas repetitivas e ganhe mais tempo para focar no que realmente importa.
                  <br />
                  <br />
                  Seu plano atual não inclui esse recurso.
                </Typography>

                <Button variant="contained" color="secondary" size="large" onClick={() => navigate('/subscriptions')}>
                  Liberar fluxos inteligentes agora
                </Button>
              </Box>
            )}
          </Container>
        </div>
      }
    />
  );
}

export default Flows;
