import { Box, ButtonBase, Chip, LinearProgress, styled, Tooltip } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import LeadsHeader from './LeadsHeader';
import DefaultTable from '@/components/DefaultTable';
import { LeadType, useDeleteLeadMutation, useGetLeadsQuery } from '@/store/api/leadsApi';
import { useNavigate } from 'react-router';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetPage, setPage } from '@/store/slices/paginationSlice';
import { useEffect, useState } from 'react';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import DefaultConfirmModal from '@/components/DefaultConfirmModal';
import { useToggleArchiveMutation } from '@/store/api/archiveApi';
import { useGetConfigsQuery } from '@/store/api/configsApi';

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
 * The leads.
 */

function Leads() {
  const dispatch = useAppDispatch();
  const page = useAppSelector((state) => state.pagination.page);
  const navigate = useNavigate();

  // Detecta mudança de rota para resetar paginação se sair de /leads e não for para /leads/:uid
  useEffect(() => {
    return () => {
      // Se o novo path não for /leads/:uid, reseta a paginação
      const nextPath = window.location.pathname;
      const isLeadDetail = /^\/leads\/[\w-]+$/.test(nextPath);

      if (!isLeadDetail) {
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
  const { data: configs, isLoading: isLoadingConfigs } = useGetConfigsQuery('key=AI-AUTOMATIC', {
    // skip: !user?.uid || !user?.role.includes('user'),
    refetchOnMountOrArgChange: true,
  });

  const {
    data: leads,
    isLoading: isLoadingLeads,
    isFetching: isFetchingLeads,
    refetch: refetchLeads,
  } = useGetLeadsQuery(`page=${page}&search=${search}`, { refetchOnMountOrArgChange: true });
  const [deleteLead, { isLoading: isLoadingDelete }] = useDeleteLeadMutation();
  const [toggleArchive, { isLoading: isLoadingToggleArchive }] = useToggleArchiveMutation();
  const [openDeleteLeadModal, setOpenDeleteLeadModal] = useState(false);
  const [deleteLeadData, setDeleteLeadData] = useState<LeadType>(null);

  const handleOpenDeleteLeadModal = (lead: LeadType) => {
    setDeleteLeadData(lead);
    setOpenDeleteLeadModal(true);
  };

  const handleDeleteLead = () => {
    deleteLead(deleteLeadData?.uid)
      .unwrap()
      .then((response) => {
        refetchLeads();
        setDeleteLeadData(null);
        setOpenDeleteLeadModal(false);
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
        setDeleteLeadData(null);
        setOpenDeleteLeadModal(false);
        dispatch(
          showMessage({
            message: error?.data?.msg,
            autoHideDuration: 3000,
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
      });
  };

  const handleToggleArchiveLead = (lead: LeadType) => {
    toggleArchive({ entity: 'leads', uid: lead.uid, archived: !lead.archived })
      .unwrap()
      .then((response) => {
        refetchLeads();
        dispatch(
          showMessage({
            message: response?.msg || `Lead ${!lead.archived ? 'arquivado' : 'desarquivado'} com sucesso`,
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
            message: error?.data?.msg || `Erro ao ${!lead.archived ? 'arquivar' : 'desarquivar'} o lead`,
            autoHideDuration: 3000,
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
      });
  };

  const [columns, setColumns] = useState([
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Nome',
      size: 250,
    },
    {
      id: 'phone',
      accessorKey: 'phone',
      header: 'Telefone',
      size: 250,
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: 'E-mail',
      size: 250,
    },
    {
      id: 'archived',
      header: 'Arquivado',
      size: 150,
      accessorFn: (row: LeadType) => (
        <Chip
          label={row.archived ? 'Arquivado' : 'Não arquivado'}
          color={row.archived ? 'primary' : 'default'}
          variant={row.archived ? 'filled' : 'outlined'}
          size="small"
        />
      ),
    },
    {
      id: 'alldo-service',
      accessorFn: (row: LeadType) => {
        const stepUid = row.step?.uid;

        if (stepUid === import.meta.env.VITE_APP_START_CONVERSATION_UID) {
          return (
            <Box display="flex" justifyContent="space-between">
              <Chip
                label={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src="/assets/images/logo/alldo-sem-fundo-face.png" alt="logo Alldo" width={20} style={{ display: 'block' }} />
                    <span>Em atendimento</span>
                  </div>
                }
                color="secondary"
                variant="filled"
                size="small"
              />
            </Box>
          );
        }

        return (
          <Box display="flex" justifyContent="space-between" width="70px">
            <Chip label="Não" color="default" variant="outlined" size="small" />
          </Box>
        );
      },
      header: 'Atendimento Alldo',
      size: 250,
    },
    {
      id: 'step',
      accessorFn: (row: LeadType) => row.step?.name || '-',
      header: 'Etapa',
      size: 250,
    },
    {
      id: 'tags',
      accessorFn: (row: LeadType) => {
        if (!row.leadTags || row.leadTags.length === 0) {
          return '-';
        }

        return (
          <Box display="flex" gap="8px" flexWrap="wrap">
            {row.leadTags.map((leadTag) => (
              <Chip
                key={leadTag.uid}
                label={leadTag.tag?.name}
                size="small"
                sx={{
                  backgroundColor: leadTag.tag?.color || '#e0e0e0',
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
      accessorFn: (row: LeadType) => (
        <Box display="flex" justifyContent="space-between" width="120px">
          <ButtonBase
            sx={{ color: 'primary.main', padding: '5px', borderRadius: '5px' }}
            disabled={isLoadingDelete}
            onClick={() => handleOpenDeleteLeadModal(row)}
          >
            <Tooltip title="Excluir">
              <DeleteOutlineOutlinedIcon color="error" fontSize="medium" />
            </Tooltip>
          </ButtonBase>
          <ButtonBase
            sx={{ color: 'primary.main', padding: '5px', borderRadius: '5px' }}
            disabled={isLoadingToggleArchive}
            onClick={() => handleToggleArchiveLead(row)}
          >
            <Tooltip title={row.archived ? 'Desarquivar' : 'Arquivar'}>
              {row.archived ? <UnarchiveOutlinedIcon fontSize="medium" color="primary" /> : <ArchiveOutlinedIcon fontSize="medium" color="primary" />}
            </Tooltip>
          </ButtonBase>
          <ButtonBase sx={{ color: 'primary.main', padding: '5px', borderRadius: '5px' }} onClick={() => navigate(`/leads/${row.uid}`)}>
            <Tooltip title="Editar">
              <CreateOutlinedIcon fontSize="medium" />
            </Tooltip>
          </ButtonBase>
          <ButtonBase
            sx={{ color: 'primary.main', padding: '5px', borderRadius: '5px' }}
            onClick={() => navigate(`/leads/${row.uid}`, { state: { isView: true } })}
          >
            <Tooltip title="Visualizar">
              <VisibilityOutlinedIcon fontSize="medium" color="primary" />
            </Tooltip>
          </ButtonBase>
        </Box>
      ),
    },
  ]);

  useEffect(() => {
    if (configs?.data) {
      const aiAutomaticConfig = configs.data.value == 'true';

      if (aiAutomaticConfig) {
        const newColumns = columns.filter((col) => col.id !== 'alldo-service');
        setColumns(newColumns);
      }
    }
  }, [configs]);

  return (
    <Root
      scroll="content"
      header={
        <>
          {isFetchingLeads && isLoadingConfigs && (
            <div className="w-full">
              <LinearProgress color="secondary" />
            </div>
          )}
          {!isLoadingLeads && <LeadsHeader refetch={refetchLeads} />}
        </>
      }
      content={
        <div className="flex flex-1 flex-col overflow-x-auto ">
          {!isLoadingLeads && (
            <>
              <DefaultTable
                data={leads?.data}
                columns={columns}
                page={page}
                totalPages={leads?.totalPages || 0}
                onPageChange={(newPage) => dispatch(setPage(newPage))}
                globalFilter={search}
                onGlobalFilterChange={setSearch}
              />
            </>
          )}
          <DefaultConfirmModal
            onCancel={() => setOpenDeleteLeadModal(false)}
            onConfirm={handleDeleteLead}
            open={openDeleteLeadModal}
            title="Excluir lead"
            message={`Tem certeza que deseja excluir o lead "${deleteLeadData?.name}"? Esta ação não poderá ser desfeita.`}
            confirmText="Excluir"
            cancelText="Cancelar"
            confirmColor="error"
            loading={isLoadingDelete}
          />
        </div>
      }
    />
  );
}

export default Leads;
