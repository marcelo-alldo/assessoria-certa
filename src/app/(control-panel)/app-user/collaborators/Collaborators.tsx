import { Box, ButtonBase, LinearProgress, styled, Tooltip, Switch, Chip } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import DefaultTable from '@/components/DefaultTable';
import { useNavigate } from 'react-router';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetPage, setPage } from '@/store/slices/paginationSlice';
import { useEffect, useState } from 'react';
import DefaultConfirmModal from '@/components/DefaultConfirmModal';
import { CollaboratorType, useGetCollaboratorsQuery, useUpdateCollaboratorMutation } from './collaboratorsApi';
import CollaboratorsHeader from './CollaboratorsHeader';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

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
 * The Collaborators.
 */

function Collaborators() {
  const dispatch = useAppDispatch();
  const page = useAppSelector((state) => state.pagination.page);
  const navigate = useNavigate();

  // Detecta mudança de rota para resetar paginação se sair de /collaborators e não for para /collaborators/:uid
  useEffect(() => {
    return () => {
      // Se o novo path não for /collaborators/:uid, reseta a paginação
      const nextPath = window.location.pathname;
      const isDetail = /^\/collaborators\/[\w-]+$/.test(nextPath);

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
    data: collaborators,
    isLoading: isLoadingCollaborators,
    isFetching: isFetchingCollaborators,
    refetch: refetchCollaborators,
  } = useGetCollaboratorsQuery(`page=${page}&search=${search}`, { refetchOnMountOrArgChange: true });

  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState(null);

  // Função para abrir o modal e setar o colaborator selecionado
  function handleOpenConfirmModal(collaborator) {
    setSelectedCollaborator(collaborator);
    setOpenConfirmModal(true);
  }

  const [updateCollaborator, { isLoading: isLoadingUpdate }] = useUpdateCollaboratorMutation();

  // Função para ativar/desativar
  function handleToggleEnableCollaborator() {
    updateCollaborator({ uid: selectedCollaborator.uid, enable: !selectedCollaborator.enable })
      .unwrap()
      .then(() => {
        setSelectedCollaborator(null);
        refetchCollaborators();
        setOpenConfirmModal(false);

        dispatch(
          showMessage({
            message: `Colaborador "${selectedCollaborator.user.profile.name}" ${selectedCollaborator.enable ? 'desativado' : 'ativado'} com sucesso`,
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
        setSelectedCollaborator(null);
        setOpenConfirmModal(false);
        dispatch(
          showMessage({
            message: `Erro ao ${selectedCollaborator.enable ? 'desativar' : 'ativar'} o Colaborador "${selectedCollaborator.user.profile.name}"`,
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
      id: 'user.profile.name',
      accessorKey: 'user.profile.name',
      header: 'Nome',
      size: 250,
    },
    {
      id: 'user.profile.phone',
      accessorKey: 'user.profile.phone',
      header: 'Telefone',
      size: 250,
    },
    {
      id: 'user.profile.email',
      accessorKey: 'user.profile.email',
      header: 'E-mail',
      size: 250,
    },
    {
      id: 'enable',
      accessorKey: 'enable',
      header: 'Status',
      size: 250,
      accessorFn: (row: CollaboratorType) => (
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
      id: 'action',
      accessorKey: 'action',
      header: 'Ações',
      size: 60,
      accessorFn: (row) => (
        <Box display="flex" justifyContent="space-between" alignItems="center" width="90px">
          <ButtonBase sx={{ color: 'primary.main', padding: '5px', borderRadius: '5px' }} onClick={() => navigate(`/collaborators/${row.uid}`)}>
            <Tooltip title="Editar">
              <CreateOutlinedIcon fontSize="medium" />
            </Tooltip>
          </ButtonBase>
          <ButtonBase
            sx={{ color: 'primary.main', padding: '5px', borderRadius: '5px' }}
            onClick={() => navigate(`/collaborators/${row.uid}`, { state: { isView: true } })}
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
      header={
        <>
          {isFetchingCollaborators && (
            <div className="w-full">
              <LinearProgress color="secondary" />
            </div>
          )}
          {!isLoadingCollaborators && <CollaboratorsHeader />}
        </>
      }
      content={
        <div className="flex flex-1 flex-col overflow-x-auto overflow-y-hidden h-full">
          {!isLoadingCollaborators && (
            <>
              <DefaultTable
                data={collaborators?.data}
                columns={columns}
                page={page}
                totalPages={collaborators?.totalPages}
                onPageChange={(newPage) => dispatch(setPage(newPage))}
                globalFilter={search}
                onGlobalFilterChange={setSearch}
              />
              <DefaultConfirmModal
                onCancel={() => setOpenConfirmModal(false)}
                onConfirm={handleToggleEnableCollaborator}
                open={openConfirmModal}
                title={selectedCollaborator?.enable ? 'Desativar Colaborador' : 'Ativar Colaborador'}
                message={
                  selectedCollaborator?.enable
                    ? `Tem certeza que deseja desativar o Colaborador "${selectedCollaborator?.user.profile.name}"?`
                    : `Tem certeza que deseja ativar o Colaborador "${selectedCollaborator?.user.profile.name}"?`
                }
                confirmText={selectedCollaborator?.enable ? 'Desativar' : 'Ativar'}
                cancelText="Cancelar"
                confirmColor={selectedCollaborator?.enable ? 'error' : 'success'}
                loading={isLoadingUpdate}
              />
            </>
          )}
        </div>
      }
    />
  );
}

export default Collaborators;
