import { Box, ButtonBase, LinearProgress, styled, Tooltip } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import { useNavigate } from 'react-router';
import ClientsHeader from './ClientsHeader';
import DefaultConfirmModal from '@/components/DefaultConfirmModal';
import DefaultTable from '@/components/DefaultTable';
import { ClientType, useGetClientsQuery, useUpdateClientMutation, useClientChangeOwnerMutation } from '../../../../store/api/clientsApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetPage, setPage } from '@/store/slices/paginationSlice';
import { useEffect, useState } from 'react';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useToggleArchiveMutation } from '@/store/api/archiveApi';

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
 * The Clients.
 */

function Clients() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const page = useAppSelector((state) => state.pagination.page);

  // Detecta mudança de rota para resetar paginação se sair de /clients e não for para /clients/:uid
  useEffect(() => {
    return () => {
      // Se o novo path não for /clients/:uid, reseta a paginação
      const nextPath = window.location.pathname;
      const isClientDetail = /^\/clients\/[\w-]+$/.test(nextPath);

      if (!isClientDetail) {
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
    data: clients,
    isFetching: isFetchingClients,
    isLoading: isLoadingClients,
    refetch: refetchClients,
  } = useGetClientsQuery(`page=${page}&search=${search}`, { refetchOnMountOrArgChange: true });

  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Função para abrir o modal e setar o cliente
  function handleOpenConfirmModal(client) {
    setSelectedClient(client);
    setOpenConfirmModal(true);
  }

  const [updateClient, { isLoading: isLoadingUpdate }] = useUpdateClientMutation();
  const [changeOwner, { isLoading: isLoadingOwner }] = useClientChangeOwnerMutation();
  const [toggleArchive, { isLoading: isLoadingToggleArchive }] = useToggleArchiveMutation();

  // Função para ativar/desativar
  function handleToggleEnableClient() {
    updateClient({ uid: selectedClient.uid, enable: !selectedClient.enable })
      .unwrap()
      .then(() => {
        setSelectedClient(null);
        refetchClients();
        setOpenConfirmModal(false);

        dispatch(
          showMessage({
            message: `Cliente "${selectedClient.clientProfile.name}" ${selectedClient.enable ? 'desativado' : 'ativado'} com sucesso`,
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
        setSelectedClient(null);
        setOpenConfirmModal(false);
        dispatch(
          showMessage({
            message: `Erro ao ${selectedClient.enable ? 'desativar' : 'ativar'} o cliente "${selectedClient.clientProfile.name}"`,
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

  // Função para alterar proprietário
  function handleChangeOwner(client: ClientType) {
    changeOwner({ uid: client.uid })
      .unwrap()
      .then((response) => {
        refetchClients();
        dispatch(
          showMessage({
            message: response.msg,
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
        dispatch(
          showMessage({
            message: error.data.msg,
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

  function handleToggleArchiveClient(client: ClientType) {
    toggleArchive({ entity: 'clients', uid: client.uid, archived: !client.archived })
      .unwrap()
      .then((response) => {
        refetchClients();
        dispatch(
          showMessage({
            message: response?.msg || `Cliente ${!client.archived ? 'arquivado' : 'desarquivado'} com sucesso`,
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
        dispatch(
          showMessage({
            message: error?.data?.msg || `Erro ao ${!client.archived ? 'arquivar' : 'desarquivar'} o cliente`,
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
      id: 'clientProfile.name',
      accessorKey: 'clientProfile.name',
      header: 'Nome',
      size: 250,
    },
    {
      id: 'clientProfile.phone',
      accessorKey: 'clientProfile.phone',
      header: 'Telefone',
      size: 250,
    },
    {
      id: 'clientProfile.email',
      accessorKey: 'clientProfile.email',
      header: 'E-mail',
      size: 250,
    },
    {
      id: 'enable',
      accessorKey: 'enable',
      header: 'Status',
      size: 250,
      accessorFn: (row: ClientType) => (
        <Chip
          label={row.enable ? 'Ativo' : 'Inativo'}
          color={row.enable ? 'success' : 'error'}
          size="small"
          icon={row.enable ? <CheckCircleOutlineIcon /> : <BlockIcon />}
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      id: 'archived',
      header: 'Arquivado',
      size: 150,
      accessorFn: (row: ClientType) => (
        <Chip
          label={row.archived ? 'Arquivado' : 'Não arquivado'}
          color={row.archived ? 'primary' : 'default'}
          variant={row.archived ? 'filled' : 'outlined'}
          size="small"
        />
      ),
    },
    {
      id: 'step',
      accessorFn: (row: ClientType) => row.step?.name || '-',
      header: 'Etapa',
      size: 250,
    },
    {
      id: 'tags',
      accessorFn: (row: ClientType) => {
        if (!row.clientTags || row.clientTags.length === 0) {
          return '-';
        }

        return (
          <Box display="flex" gap="8px" flexWrap="wrap">
            {row.clientTags.map((clientTag) => (
              <Chip
                key={clientTag.uid}
                label={clientTag.tag?.name}
                size="small"
                sx={{
                  backgroundColor: clientTag.tag?.color || '#e0e0e0',
                  color: '#fff',
                  fontWeight: 500,
                }}
              />
            ))}
          </Box>
        );
      },
      header: 'Tags',
      size: 250,
    },
    {
      id: 'action',
      accessorKey: 'action',
      header: 'Ações',
      size: 60,
      accessorFn: (row: ClientType) => (
        <Box display="flex" justifyContent="space-between" alignItems="center" width="160px">
          <Tooltip title="Alterar atendente">
            <ButtonBase
              sx={{ color: 'primary.main', padding: '5px', borderRadius: '5px' }}
              onClick={() => handleChangeOwner(row)}
              disabled={isLoadingOwner}
            >
              <FuseSvgIcon size={20} color="action">
                material-outline:supervisor_account
              </FuseSvgIcon>
            </ButtonBase>
          </Tooltip>
          <ButtonBase
            sx={{ color: 'primary.main', padding: '5px', borderRadius: '5px' }}
            disabled={isLoadingToggleArchive}
            onClick={() => handleToggleArchiveClient(row)}
          >
            <Tooltip title={row.archived ? 'Desarquivar' : 'Arquivar'}>
              {row.archived ? <UnarchiveOutlinedIcon fontSize="medium" color="primary" /> : <ArchiveOutlinedIcon fontSize="medium" color="primary" />}
            </Tooltip>
          </ButtonBase>
          <ButtonBase sx={{ color: 'primary.main', padding: '5px', borderRadius: '5px' }} onClick={() => navigate(`/clients/${row.uid}`)}>
            <Tooltip title="Editar">
              <CreateOutlinedIcon fontSize="medium" />
            </Tooltip>
          </ButtonBase>
          <ButtonBase
            sx={{ color: 'primary.main', padding: '5px', borderRadius: '5px' }}
            onClick={() => navigate(`/clients/${row.uid}`, { state: { isView: true } })}
          >
            <Tooltip title="Visualizar">
              <VisibilityOutlinedIcon fontSize="medium" color="primary" />
            </Tooltip>
          </ButtonBase>
          <Tooltip title={row.enable ? 'Desativar' : 'Ativar'}>
            <Switch
              checked={row.enable}
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
          {isFetchingClients && (
            <div className="w-full">
              <LinearProgress color="secondary" />
            </div>
          )}
          {!isLoadingClients && <ClientsHeader />}
        </>
      }
      content={
        <div className="flex flex-1 flex-col overflow-x-auto ">
          {!isLoadingClients && (
            <>
              <DefaultTable
                data={clients?.data}
                columns={columns}
                page={page}
                totalPages={clients?.totalPages}
                onPageChange={(newPage) => dispatch(setPage(newPage))}
                globalFilter={search}
                onGlobalFilterChange={setSearch}
              />
              <DefaultConfirmModal
                onCancel={() => setOpenConfirmModal(false)}
                onConfirm={handleToggleEnableClient}
                open={openConfirmModal}
                title={selectedClient?.enable ? 'Desativar cliente' : 'Ativar cliente'}
                message={
                  selectedClient?.enable
                    ? `Tem certeza que deseja desativar o cliente "${selectedClient?.clientProfile.name}"?`
                    : `Tem certeza que deseja ativar o cliente "${selectedClient?.clientProfile.name}"?`
                }
                confirmText={selectedClient?.enable ? 'Desativar' : 'Ativar'}
                cancelText="Cancelar"
                confirmColor={selectedClient?.enable ? 'error' : 'success'}
                loading={isLoadingUpdate}
              />
            </>
          )}
        </div>
      }
      // scroll={isMobile ? 'normal' : 'content'}
    />
  );
}

export default Clients;
