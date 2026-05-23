import { styled, Typography, Button, LinearProgress } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { useState } from 'react';
import { useGetConfigsQuery, useUpdateConfigMutation } from '../../../../../store/api/configsApi';
import StatusHeader from './StatusHeader';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useDispatch } from 'react-redux';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';

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
 * The Status.
 */

function Status() {
  const [localLoading, setLocalLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    data: configs,
    isLoading: isLoadingConfigs,
    refetch: refetchConfigs,
  } = useGetConfigsQuery('key=ALLDO_STATUS', { refetchOnMountOrArgChange: true });

  const [updateConfig, { isLoading: isLoadingUpdate }] = useUpdateConfigMutation();

  // Extrai status
  let statusObj = { about: false, keys: false, products: false, whatsapp: false };
  let statusValue = '';
  try {
    if (configs?.data && configs?.data?.data) {
      const parsed = JSON.parse(configs.data?.data);
      // Garante que statusObj sempre tem as chaves esperadas
      statusObj = {
        about: parsed?.about ?? false,
        keys: parsed?.keys ?? false,
        products: parsed?.products ?? false,
        whatsapp: parsed?.whatsapp ?? false,
      };
      statusValue = configs?.data?.value;
    }
  } catch {
    // Intentionally ignore JSON parse errors
  }

  const steps = [
    { key: 'about', label: '1. Sobre a empresa', configPath: '/configs/about' },
    { key: 'products', label: '2. Produtos/Serviços', configPath: '/configs/products' },
    { key: 'keys', label: '3. Chaves', configPath: '/configs/keys' },
    { key: 'whatsapp', label: '4. WhatsApp', configPath: '/configs/whatsapp' },
  ];

  const firstPendingIdx = steps.findIndex((s) => !statusObj?.[s.key]);

  const stepIcons = {
    about: <InfoOutlinedIcon />,
    keys: <VpnKeyIcon />,
    products: <Inventory2OutlinedIcon />,
    whatsapp: <WhatsAppIcon />,
  };

  return (
    <Root
      scroll="content"
      header={<StatusHeader />}
      content={
        <div className="flex flex-1 flex-col h-full">
          {(isLoadingConfigs || localLoading) && (
            <div className="w-full">
              <LinearProgress color="secondary" />
            </div>
          )}
          {!isLoadingConfigs && (
            <div className="flex flex-1 flex-col h-full p-8 max-w-2xl">
              <Typography variant="h6" className="mb-6" color="text.secondary">
                Esta tela mostra o progresso da configuração inicial do sistema. Complete cada etapa para garantir o funcionamento correto das
                integrações e recursos. Clique em "Configurar" para preencher cada etapa e depois confirme.
              </Typography>
              {statusValue === 'PENDING' && (
                <Typography variant="body1" color="warning.main" className="mb-4">
                  O Alldo está configurando os dados. Em breve estará disponível para uso.
                </Typography>
              )}
              {statusValue === 'FINISHED' && (
                <Typography variant="body1" color="success.main" className="mb-4">
                  O Alldo está pronto para uso!
                </Typography>
              )}
              <Timeline position="alternate">
                {steps.map((step, idx) => {
                  const done = statusObj[step.key];
                  const isCurrent = idx === firstPendingIdx || (firstPendingIdx === -1 && idx === steps.length - 1);
                  return (
                    <TimelineItem key={step.key}>
                      <TimelineSeparator>
                        <TimelineDot color={done ? 'success' : isCurrent ? 'primary' : 'grey'}>
                          {done ? <CheckCircleIcon /> : stepIcons[step.key]}
                        </TimelineDot>
                        {idx < steps.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <div className="w-full ">
                          <div className="flex items-center justify-between">
                            <Typography variant="subtitle1" color={done ? 'success.main' : isCurrent ? 'primary.main' : 'text.secondary'}>
                              {step.label}
                            </Typography>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <Button
                                variant="contained"
                                color={done ? 'success' : isCurrent ? 'secondary' : 'inherit'}
                                disabled={!isCurrent || done || isLoadingUpdate}
                                onClick={async () => {
                                  if (!isCurrent || done) return;

                                  const newStatus = { ...statusObj, [step.key]: true };
                                  setLocalLoading(true);

                                  await updateConfig({
                                    uid: configs.data?.uid,
                                    value: configs.data?.value,
                                    key: 'ALLDO_STATUS',
                                    data: JSON.stringify(newStatus),
                                    name: 'Status do Alldo Assistente',
                                  })
                                    .unwrap()
                                    .then((response) => {
                                      refetchConfigs();
                                      setLocalLoading(false);
                                      dispatch(
                                        showMessage({
                                          message: `${step.label.replace(/^\d+\. /, '')} confirmada com sucesso!`,
                                          autoHideDuration: 3000,
                                          variant: 'success',
                                          anchorOrigin: {
                                            vertical: 'top',
                                            horizontal: 'right',
                                          },
                                        }),
                                      );
                                    })
                                    .catch((error) => {
                                      setLocalLoading(false);
                                      dispatch(
                                        showMessage({
                                          message: `Erro ao confirmar ${step.label.replace(/^\d+\. /, '')}`,
                                          autoHideDuration: 3000,
                                          variant: 'error',
                                          anchorOrigin: {
                                            vertical: 'top',
                                            horizontal: 'right',
                                          },
                                        }),
                                      );
                                    });
                                }}
                              >
                                Confirmar
                              </Button>
                              <Button
                                variant="outlined"
                                color={done ? 'success' : isCurrent ? 'primary' : 'inherit'}
                                onClick={() => navigate(step.configPath)}
                                disabled={!isCurrent || done}
                              >
                                Configurar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TimelineContent>
                    </TimelineItem>
                  );
                })}
                <div className="flex justify-center mt-8">
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    disabled={firstPendingIdx !== -1 || isLoadingConfigs || localLoading || statusValue === 'PENDING' || statusValue === 'FINISHED'}
                    onClick={async () => {
                      setLocalLoading(true);

                      await updateConfig({
                        uid: configs.data?.uid,
                        value: 'PENDING',
                        key: 'ALLDO_STATUS',
                        data: JSON.stringify(statusObj),
                        name: 'Status do Alldo Assistente',
                      })
                        .unwrap()
                        .then((response) => {
                          setLocalLoading(false);
                          refetchConfigs();
                          sessionStorage.removeItem('alldo_has_seen_config_modal');
                          dispatch(
                            showMessage({
                              message: response?.msg,
                              autoHideDuration: 3000,
                              variant: 'success',
                              anchorOrigin: {
                                vertical: 'top',
                                horizontal: 'right',
                              },
                            }),
                          );
                        })
                        .catch((error) => {
                          setLocalLoading(false);
                          dispatch(
                            showMessage({
                              message: error?.data?.msg,
                              autoHideDuration: 3000,
                              variant: 'error',
                              anchorOrigin: { vertical: 'top', horizontal: 'right' },
                            }),
                          );
                        });
                    }}
                  >
                    Pronto para começar
                  </Button>
                </div>
              </Timeline>
            </div>
          )}
        </div>
      }
    />
  );
}

export default Status;
