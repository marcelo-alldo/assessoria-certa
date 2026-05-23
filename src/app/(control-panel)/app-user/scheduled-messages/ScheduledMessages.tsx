import { Box, ButtonBase, LinearProgress, styled, Tooltip } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import { useNavigate } from 'react-router';
import ScheduledMessagesHeader from './ScheduledMessagesHeader';
import DefaultConfirmModal from '@/components/DefaultConfirmModal';
import DefaultTable from '@/components/DefaultTable';
import { useGetScheduledMessageQuery, useUpdateToggleScheduledMessagesMutation } from './scheduledMessagesApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetPage, setPage } from '@/store/slices/paginationSlice';
import { useEffect, useState } from 'react';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { formatDateToBrazilTimezone } from '@/utils/dateUtils';

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
 * The ScheduledMessages.
 */

function ScheduledMessages() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const page = useAppSelector((state) => state.pagination.page);

  // Detecta mudança de rota para resetar paginação se sair de /clients e não for para /clients/:uid
  useEffect(() => {
    return () => {
      // Se o novo path não for /clients/:uid, reseta a paginação
      const nextPath = window.location.pathname;
      const isDetail = /^\/scheduled-messages\/[\w-]+$/.test(nextPath);

      if (!isDetail) {
        dispatch(resetPage()); // ou resetPage() se preferir
      }
    };
  }, [dispatch]);

  const [search, setSearch] = useState('');

  // Atualiza a query string ao pesquisar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [search]);

  // Usa o search na query da API
  const {
    data: messages,
    isFetching: isFetchingMessages,
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useGetScheduledMessageQuery(`page=${page}&search=${search}`, { refetchOnMountOrArgChange: true });

  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Função para abrir o modal e setar o cliente
  function handleOpenConfirmModal(message) {
    setSelectedMessage(message);
    setOpenConfirmModal(true);
  }

  const [updateToggleSchedule, { isLoading: isLoadingUpdateToggle }] = useUpdateToggleScheduledMessagesMutation();

  // Função para ativar/desativar
  function handleToggleEnableMessage() {
    updateToggleSchedule(selectedMessage.uid)
      .unwrap()
      .then(() => {
        setOpenConfirmModal(false);
        refetchMessages();
        setSelectedMessage(null);
        dispatch(
          showMessage({
            message: `Mensagem "${selectedMessage.title}" ${selectedMessage.enable ? 'desativado' : 'ativado'} com sucesso`,
            autoHideDuration: 3000,
            variant: 'success',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
      })
      .catch(() => {
        setOpenConfirmModal(false);
        setSelectedMessage(null);
        dispatch(
          showMessage({
            message: `Erro ao ${selectedMessage.enable ? 'desativar' : 'ativar'} a Mensagem "${selectedMessage.title}"`,
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

  const columns = [
    {
      id: 'title',
      accessorKey: 'title',
      header: 'Título da campanha / mensagem',
      size: 350,
      accessorFn: (row) => <span style={{ fontWeight: '700' }}>{row.title}</span>,
    },
    {
      id: 'message',
      accessorKey: 'message',
      header: 'Mensagem',
      size: 350,
      accessorFn: (row) => (
        <Box sx={{ maxWidth: '350px ' }}>
          <ButtonBase sx={{ color: 'primary.main', padding: '5px', borderRadius: '5px' }} onClick={() => navigate(`/scheduled-messages/${row.uid}`)}>
            <Tooltip title={<Box sx={{ fontSize: 15, whiteSpace: 'pre-wrap' }}>{row?.message}</Box>}>
              {row?.message?.length > 50 ? `${row?.message?.substring(0, 50)}...` : row?.message}
            </Tooltip>
          </ButtonBase>
        </Box>
      ),
    },
    {
      id: 'total',
      accessorKey: 'recipientsTotal',
      header: 'Participantes',
      accessorFn: (row) => row?._count?.recipients || 0,
    },
    {
      id: 'send',
      accessorKey: 'sendAt',
      header: 'Data de envio',
      size: 250,
      accessorFn: (row) => {
        return formatDateToBrazilTimezone(row?.sendAt, 'dd/MM/yyyy HH:mm');
      },
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      accessorFn: (row) => {
        type StatusKey = 'PENDING' | 'SENT' | 'FAILED';
        const statusConfig: Record<
          StatusKey,
          {
            label: string;
            color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
          }
        > = {
          PENDING: { label: 'Pendente', color: 'info' },
          SENT: { label: 'Enviado', color: 'success' },
          FAILED: { label: 'Falhou', color: 'error' },
        };
        const current = statusConfig[row.status as StatusKey] || { label: row.status || 'Desconhecido', color: 'default' };
        return <Chip label={current.label} color={current.color} size="small" sx={{ fontWeight: 500 }} />;
      },
    },
    {
      id: 'action',
      accessorKey: 'action',
      header: 'Ações',
      accessorFn: (row) => (
        <Box display="flex" justifyContent="space-between" alignItems="center" width="90px">
          <ButtonBase
            disabled={row.status !== 'PENDING'} // Desabilita o switch se a mensagem já foi enviada
            sx={{ color: 'primary.main', padding: '5px', borderRadius: '5px' }}
            onClick={() => navigate(`/scheduled-messages/${row.uid}`)}
          >
            <Tooltip title="Editar">
              <CreateOutlinedIcon color={row.status !== 'PENDING' ? 'disabled' : 'primary'} fontSize="medium" />
            </Tooltip>
          </ButtonBase>
          <ButtonBase
            sx={{ color: 'primary.main', padding: '5px', borderRadius: '5px' }}
            onClick={() => navigate(`/scheduled-messages/${row.uid}/report`)}
          >
            <Tooltip title="Relatório de envios">
              <AssessmentOutlinedIcon fontSize="medium" />
            </Tooltip>
          </ButtonBase>
          <Tooltip title={row.enable ? 'Desativar' : 'Ativar'}>
            <Switch
              checked={row.enable}
              disabled={row.status !== 'PENDING'} // Desabilita o switch se a mensagem já foi enviada
              color={row.enable ? 'success' : 'error'}
              onChange={() => handleOpenConfirmModal(row)}
              inputProps={{ 'aria-label': row.enable ? 'Desativar' : 'Ativar' }}
              size="small"
            />
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Root
      scroll="content"
      header={
        <>
          {isFetchingMessages && (
            <Box sx={{ width: '100%' }}>
              <LinearProgress color="secondary" />
            </Box>
          )}
          {!isLoadingMessages && <ScheduledMessagesHeader />}
        </>
      }
      content={
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            overflowX: 'auto',
            overflowY: 'hidden',
            height: '100%',
            backgroundColor: 'background.default',
          }}
        >
          {!isLoadingMessages && (
            <>
              <DefaultTable
                data={messages?.data}
                columns={columns}
                page={page}
                totalPages={messages?.totalPages}
                onPageChange={(newPage) => dispatch(setPage(newPage))}
                globalFilter={search}
                onGlobalFilterChange={setSearch}
              />
              <DefaultConfirmModal
                onCancel={() => setOpenConfirmModal(false)}
                onConfirm={handleToggleEnableMessage}
                open={openConfirmModal}
                title={selectedMessage?.enable ? 'Desativar mensagem' : 'Ativar mensagem'}
                message={
                  selectedMessage?.enable
                    ? `Tem certeza que deseja desativar a mensagem "${selectedMessage?.title}"?`
                    : `Tem certeza que deseja ativar a mensagem "${selectedMessage?.title}"?`
                }
                confirmText={selectedMessage?.enable ? 'Desativar' : 'Ativar'}
                cancelText="Cancelar"
                confirmColor={selectedMessage?.enable ? 'error' : 'success'}
                loading={isLoadingUpdateToggle}
              />
            </>
          )}
        </Box>
      }
    />
  );
}

export default ScheduledMessages;
