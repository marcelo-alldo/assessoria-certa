import { Box, ButtonBase, LinearProgress, styled, Tooltip } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useState } from 'react';
import Chip from '@mui/material/Chip';
import { format } from 'date-fns';
import DefaultConfirmModal from '@/components/DefaultConfirmModal';
import DefaultTable from '@/components/DefaultTable';
import MessageTemplatesHeader from './MessageTemplatesHeader';
import { useGetMessageTemplatesQuery, useDeleteMessageTemplateMutation } from './messageTemplatesApi';
import { useAppDispatch } from '@/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useNavigate } from 'react-router';

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

function MessageTemplates() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams();

  if (search) queryParams.append('search', search);

  queryParams.append('page', page.toString());
  queryParams.append('pageSize', '10');

  const { data: messageTemplatesData, isLoading, error } = useGetMessageTemplatesQuery(queryParams.toString());
  const [deleteMessageTemplate, { isLoading: isDeleting }] = useDeleteMessageTemplateMutation();

  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  function handleOpenConfirmModal(template) {
    setSelectedTemplate(template);
    setOpenConfirmModal(true);
  }

  async function handleDeleteTemplate() {
    if (selectedTemplate?.uid) {
      try {
        await deleteMessageTemplate(selectedTemplate.uid).unwrap();
        setOpenConfirmModal(false);
        setSelectedTemplate(null);
        dispatch(
          showMessage({
            message: 'Template deletado com sucesso!',
            autoHideDuration: 3000,
            variant: 'success',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
      } catch (error) {
        if (error?.status === 400 && error?.data?.relatedScheduledMessages) {
          const { msg } = error.data;

          dispatch(
            showMessage({
              message: msg,
              autoHideDuration: 8000,
              variant: 'error',
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'right',
              },
            }),
          );
        } else {
          const errorMessage = error?.data?.msg || error?.message || 'Erro ao deletar template';
          dispatch(
            showMessage({
              message: errorMessage,
              autoHideDuration: 3000,
              variant: 'error',
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'right',
              },
            }),
          );
        }

        setOpenConfirmModal(false);
        setSelectedTemplate(null);
      }
    }
  }

  const columns = [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Nome',
      size: 250,
      accessorFn: (row) => <span style={{ fontWeight: '700' }}>{row.name}</span>,
    },
    {
      id: 'message',
      accessorKey: 'message',
      header: 'Mensagem',
      size: 300,
      accessorFn: (row) => (
        <Box>
          <ButtonBase
            sx={{ color: 'primary.main', padding: '5px', borderRadius: '5px' }}
            onClick={() => navigate(`/message-templates/${row.uid}`, { state: { isView: true, message: row } })}
          >
            <Tooltip title={<Box sx={{ fontSize: 15, whiteSpace: 'pre-wrap' }}>{row?.message}</Box>}>
              {row?.message?.length > 100 ? `${row?.message?.substring(0, 100)}...` : row?.message}
            </Tooltip>
          </ButtonBase>
        </Box>
      ),
    },
    {
      id: 'category',
      accessorKey: 'category',
      header: 'Categoria',
      size: 150,
      accessorFn: (row) => {
        const categoryColors = {
          MARKETING: '#4CAF50',
          UTILITY: '#FF9800',
        };
        const categoryLabels = {
          MARKETING: 'Marketing',
          UTILITY: 'Utilidade',
        };
        return (
          <Chip
            label={categoryLabels[row.category] || row.category}
            size="small"
            sx={{
              backgroundColor: categoryColors[row.category] || '#757575',
              color: 'white',
              fontWeight: 500,
            }}
          />
        );
      },
    },
    {
      id: 'enable',
      accessorKey: 'enable',
      header: 'Ativo',
      size: 100,
      accessorFn: (row) => {
        const isEnabled = row.enable === true || row.enable === 1 || row.enable === '1' || row.enable === 'true';
        return <Chip label={isEnabled ? 'Sim' : 'Não'} color={isEnabled ? 'success' : 'error'} size="small" sx={{ fontWeight: 500 }} />;
      },
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      size: 150,
      accessorFn: (row) => {
        const statusColors = {
          PENDING: '#FF9800',
          APPROVED: '#4CAF50',
          REJECTED: '#F44336',
        };
        const statusLabels = {
          PENDING: 'Pendente',
          APPROVED: 'Aprovado',
          REJECTED: 'Rejeitado',
        };
        return (
          <Chip
            label={statusLabels[row.status] || row.status || 'Pendente'}
            size="small"
            sx={{
              backgroundColor: statusColors[row.status] || statusColors.PENDING,
              color: 'white',
              fontWeight: 500,
            }}
          />
        );
      },
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Data de criação',
      size: 200,
      accessorFn: (row) => format(new Date(row.createdAt), 'dd/MM/yyyy HH:mm:ss'),
    },
    {
      id: 'action',
      accessorKey: 'action',
      header: 'Ações',
      size: 60,
      accessorFn: (row) => (
        <Box display="flex" justifyContent="space-between" width="70px">
          <ButtonBase
            sx={{ color: 'primary.main', padding: '5px', borderRadius: '5px' }}
            onClick={() => navigate(`/message-templates/${row.uid}`, { state: { isView: true, message: row } })}
          >
            <Tooltip title="Visualizar">
              <VisibilityOutlinedIcon fontSize="medium" color="primary" />
            </Tooltip>
          </ButtonBase>
          <ButtonBase
            sx={{
              color: 'error.main',
              padding: '5px',
              borderRadius: '5px',
              '&:hover': { backgroundColor: 'error.light' },
            }}
            onClick={() => handleOpenConfirmModal(row)}
          >
            <Tooltip title="Excluir">
              <DeleteOutlineOutlinedIcon color="error" fontSize="medium" />
            </Tooltip>
          </ButtonBase>
        </Box>
      ),
    },
  ];

  return (
    <Root
      scroll="content"
      header={
        <>
          {isLoading && (
            <Box sx={{ width: '100%' }}>
              <LinearProgress color="secondary" />
            </Box>
          )}
          <MessageTemplatesHeader />
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
          {error ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Box sx={{ color: 'error.main' }}>
                Erro ao carregar templates:{' '}
                {'data' in error && error.data && typeof error.data === 'object' && 'msg' in error.data
                  ? (error.data as any).msg
                  : 'status' in error
                    ? `Erro ${error.status}`
                    : 'Erro desconhecido'}
              </Box>
            </Box>
          ) : (
            <DefaultTable
              data={messageTemplatesData?.data || []}
              columns={columns}
              page={page}
              totalPages={messageTemplatesData?.totalPages || 1}
              onPageChange={(newPage) => setPage(newPage)}
              globalFilter={search}
              onGlobalFilterChange={setSearch}
            />
          )}
          <DefaultConfirmModal
            onCancel={() => setOpenConfirmModal(false)}
            onConfirm={handleDeleteTemplate}
            open={openConfirmModal}
            title="Excluir modelo"
            message={
              selectedTemplate ? `Tem certeza que deseja excluir o modelo "${selectedTemplate.name}"?` : 'Tem certeza que deseja excluir este modelo?'
            }
            confirmText="Excluir"
            cancelText="Cancelar"
            confirmColor="error"
            loading={isDeleting}
          />
        </Box>
      }
    />
  );
}

export default MessageTemplates;
