/* eslint-disable @typescript-eslint/no-explicit-any */
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Box, CircularProgress, Paper, Switch, Tooltip, Typography, useTheme } from '@mui/material';
import { ConfigType } from '../flowsApi';
import { useEffect, useState } from 'react';
import { useN8nMutation } from '@/store/api/n8nApi';
import DefaultConfirmModal from '@/components/DefaultConfirmModal';
import { useAppDispatch } from '@/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';

interface ItemFlowProps {
  data: ConfigType;
}

interface ContentData {
  icon?: string;
  execution: string;
  description: string;
}

function ItemFlow({ data }: ItemFlowProps) {
  const theme = useTheme();
  const [content, setContent] = useState<ContentData | null>(null);
  const [dataFlow, setDataFlow] = useState<any | null>(null);
  const [openConfirmModal, setOpenConfirmModal] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const [n8n, { isLoading }] = useN8nMutation();

  useEffect(() => {
    if (data?.data) {
      try {
        const parsedData = JSON.parse(data?.data || '{}');
        setContent(parsedData);
      } catch (error) {
        console.error('Error parsing data:', error);
        setContent(null);
      }
    } else {
      setContent(null);
    }

    if (data?.value) {
      n8n({
        url: `/api/v1/workflows/${data?.value}`,
        method: 'GET',
      })
        .unwrap()
        .then((response) => {
          if (response?.data) {
            setDataFlow(response.data);
          }
        })
        .catch((error) => {
          console.error('Error fetching workflow:', error);
          setDataFlow(null);
        });
    }
  }, [data]);

  function handleOpenConfirmModal() {
    setOpenConfirmModal(!openConfirmModal);
  }

  function handleConfirmModal() {
    const action = dataFlow?.active ? 'deactivate' : 'activate';
    n8n({
      url: `/api/v1/workflows/${data?.value}/${action}`,
      method: 'POST',
    })
      .unwrap()
      .then((response) => {
        setDataFlow((prev) => ({ ...prev, active: !prev.active }));
        setOpenConfirmModal(false);
        dispatch(
          showMessage({
            message: `Fluxo - ${data.name} ${dataFlow.active ? 'desativado' : 'ativado'} com sucesso`,
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
        console.error(`Error ${action}ing workflow:`, error);
        setOpenConfirmModal(false);
        dispatch(
          showMessage({
            message: `Erro ao ${dataFlow.active ? 'desativar' : 'ativar'} Fluxo - ${data.name}`,
            autoHideDuration: 3000,
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
      });
  }

  return (
    <>
      <Paper sx={{ marginY: 2 }} className="w-full flex items-center justify-between rounded-lg shadow-lg overflow-hidden">
        <Box display={'flex'}>
          <Box
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            sx={{ backgroundColor: (theme) => theme.palette.primary.main, padding: 2 }}
          >
            <FuseSvgIcon size={32} sx={{ color: theme.palette.secondary.main }}>
              {`material-outline:${content?.icon || 'account_tree'}`}
            </FuseSvgIcon>
          </Box>
          <Box marginX={2} p={2}>
            <Typography variant="h6">{data?.name}</Typography>
            <Typography variant="body2">{content?.description}</Typography>
          </Box>
        </Box>
        <Box display={'flex'}>
          <Box p={2} display={'flex'} alignItems={'center'}>
            <Tooltip title={'Fluxo configurado para lista de clientes.'}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Execução: <b>{content?.execution}</b>
              </Typography>
            </Tooltip>
          </Box>
          {/* <Box p={2} display={'flex'} alignItems={'center'}>
          <Tooltip title={'Editar'}>
            <Button variant="contained" color="secondary" size="large">
              <FuseSvgIcon size={'25px'}>material-outline:edit</FuseSvgIcon>
            </Button>
          </Tooltip>
        </Box> */}
          <Box p={2} display={'flex'} alignItems={'center'}>
            {isLoading ? (
              <CircularProgress size={24} />
            ) : (
              <Tooltip title={'Desativar'}>
                <Switch
                  color={'success'}
                  checked={dataFlow?.active || false}
                  onChange={() => handleOpenConfirmModal()}
                  // inputProps={{ 'aria-label': row.enable ? 'Desativar' : 'Ativar' }}
                  size="medium"
                />
              </Tooltip>
            )}
          </Box>
        </Box>
      </Paper>
      <DefaultConfirmModal open={openConfirmModal} onConfirm={handleConfirmModal} onCancel={handleOpenConfirmModal}></DefaultConfirmModal>
    </>
  );
}

export default ItemFlow;
