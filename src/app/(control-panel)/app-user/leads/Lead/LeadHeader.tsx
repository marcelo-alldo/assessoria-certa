import { Button, Select, MenuItem, FormControl, InputLabel, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useDeleteLeadMutation, useUpdateLeadMutation } from '@/store/api/leadsApi';
import { useLocation, useNavigate } from 'react-router';
import { useAppDispatch } from '@/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import DefaultConfirmModal from '@/components/DefaultConfirmModal';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import _ from 'lodash';
import PageTitle from '@/components/PageTitle';
import { StepsType, useGetStepsQuery } from '../../scrumboard/ScrumboardApi';
import { useToggleArchiveMutation } from '@/store/api/archiveApi';
import { useGetConfigsQuery } from '@/store/api/configsApi';

/**
 * The lead header component.
 */

interface LeadHeaderProps {
  setLoading: (loading: boolean) => void;
  refetch: () => void;
}

function LeadHeader({ setLoading, refetch }: LeadHeaderProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { state } = useLocation();

  const methods = useFormContext();
  const { formState, watch, getValues } = methods;

  const { uid, name, phone, cpf, email, summary, notes, stepUid } = watch();

  const { dirtyFields, isValid } = formState;

  // DELETE LEAD
  const [deleteLead, { isLoading: isLoadingDelete }] = useDeleteLeadMutation();
  const [openDeleteLeadModal, setOpenDeleteLeadModal] = useState(false);
  const handleOpenDeleteLeadModal = () => {
    setOpenDeleteLeadModal(true);
  };
  const { data: configs, isLoading: isLoadingConfigs } = useGetConfigsQuery('key=AI-AUTOMATIC', {
    // skip: !user?.uid || !user?.role.includes('user'),
    refetchOnMountOrArgChange: true,
  });

  const [aiAutomatic, setAiAutomatic] = useState(false);

  useEffect(() => {
    if (configs?.data) {
      const aiAutomaticConfig = configs.data.value == 'true';
      setAiAutomatic(aiAutomaticConfig);
    }
  }, [configs]);

  const handleDeleteLead = () => {
    deleteLead(uid)
      .unwrap()
      .then((response) => {
        navigate('/leads');
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

  // UPDATE LEAD
  const [updateLead, { isLoading: isLoadingUpdate }] = useUpdateLeadMutation();
  const [toggleArchive, { isLoading: isLoadingToggleArchive }] = useToggleArchiveMutation();

  useEffect(() => {
    setLoading(isLoadingUpdate);
  }, [isLoadingUpdate]);

  useEffect(() => {
    setLoading(isLoadingToggleArchive);
  }, [isLoadingToggleArchive]);

  const handleUpdateLead = () => {
    updateLead({
      cpf,
      email,
      name,
      phone,
      summary,
      notes,
      uid,
    })
      .unwrap()
      .then((response) => {
        refetch();
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

  const handleToggleArchive = () => {
    const currentArchived = !!getValues('archived');
    toggleArchive({ entity: 'leads', uid, archived: !currentArchived })
      .unwrap()
      .then((response) => {
        refetch();
        dispatch(
          showMessage({
            message: response?.msg || (currentArchived ? 'Lead desarquivado com sucesso' : 'Lead arquivado com sucesso'),
            autoHideDuration: 3000,
            variant: 'success',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          }),
        );
      })
      .catch((error) => {
        dispatch(
          showMessage({
            message: error?.data?.msg,
            autoHideDuration: 3000,
            variant: 'error',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          }),
        );
      });
  };

  // TRANSFER TO ALLDO
  const [openTransferAlldoModal, setOpenTransferAlldoModal] = useState(false);
  const [isLoadingTransferAlldo, setIsLoadingTransferAlldo] = useState(false);

  const handleOpenTransferAlldoModal = () => {
    setOpenTransferAlldoModal(true);
  };

  const handleTransferToAlldo = async () => {
    setIsLoadingTransferAlldo(true);

    try {
      const stepToAlldo = steps?.data?.find((step) => step.uid === import.meta.env.VITE_APP_START_CONVERSATION_UID);

      const response = await updateLead({
        stepUid: stepToAlldo.uid,
        uid,
        position: 1,
        changeStep: true,
      }).unwrap();

      refetch();
      setOpenTransferAlldoModal(false);

      dispatch(
        showMessage({
          message: response?.msg,
          autoHideDuration: 3000,
          variant: 'success',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        }),
      );
    } catch (error: any) {
      dispatch(
        showMessage({
          message: error?.data?.msg || error?.message || 'Erro ao transferir lead para Alldo.',
          autoHideDuration: 3000,
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        }),
      );
    } finally {
      setIsLoadingTransferAlldo(false);
    }
  };

  // CHANGE LEAD STEP

  const [openModalSelectStep, setOpenModalSelectStep] = useState(false);

  const { data: steps, isLoading: isLoadingSteps } = useGetStepsQuery('', { refetchOnMountOrArgChange: true });
  // Estado para o step selecionado
  const [selectedStep, setSelectedStep] = useState<StepsType>(null);

  // Handler para abrir o modal e garantir que selectedStep está sincronizado
  const handleOpenModalSelectStep = () => {
    if (steps?.data && stepUid) {
      const step = steps.data.find((s) => s.uid === stepUid);
      setSelectedStep(step);
    }

    setOpenModalSelectStep(true);
  };
  const [modalConfirmNewClient, setModalConfirmNewClient] = useState(false);

  const handleChangeCardOrder = () => {
    if (!uid || !selectedStep) {
      return;
    }

    if (selectedStep?.position === 1001) {
      setModalConfirmNewClient(true);
      return;
    }

    updateLead({
      stepUid: selectedStep.uid,
      uid,
      position: 1,
      changeStep: true,
    })
      .unwrap()
      .then((response) => {
        setOpenModalSelectStep(false);
        refetch();
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

  function handleConfirmNewClient(confirm: boolean) {
    if (confirm && selectedStep) {
      updateLead({
        stepUid: selectedStep.uid,
        uid: uid,
        position: 1,
        changeStep: true,
      })
        .unwrap()
        .then((response) => {
          setOpenModalSelectStep(false);
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
          navigate(`/leads`);
        })
        .catch((error) => {
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
    }

    setModalConfirmNewClient(false);
  }

  return (
    <div className="p-6 sm:p-8 w-full flex items-center sm:justify-between">
      <PageTitle title={name} backNavigation />

      {!state?.isView && (
        <div className="flex flex-1 items-center justify-end space-x-0 sm:space-x-3">
          <Button variant="text" className="whitespace-nowrap" color="error" onClick={handleOpenDeleteLeadModal} disabled={isLoadingDelete || !uid}>
            <FuseSvgIcon size={20}>heroicons-outline:trash</FuseSvgIcon>
            <span className="hidden sm:flex mx-2">Excluir</span>
          </Button>
          <Button
            variant="contained"
            className="whitespace-nowrap"
            color={getValues('archived') ? 'primary' : 'secondary'}
            onClick={handleToggleArchive}
            disabled={isLoadingToggleArchive}
          >
            <FuseSvgIcon size={20}>heroicons-outline:archive-box</FuseSvgIcon>
            <span className="hidden sm:flex mx-2">{getValues('archived') ? 'Desarquivar' : 'Arquivar'}</span>
          </Button>
          {!aiAutomatic && (
            <Button variant="contained" className="whitespace-nowrap" color="secondary" onClick={handleOpenTransferAlldoModal}>
              <img src="/assets/images/logo/alldo-sem-fundo-face.png" alt="logo Alldo" width={25} style={{ display: 'block' }} />
              <span className="hidden sm:flex mx-2">Transferir para Alldo</span>
            </Button>
          )}
          {uid && (
            <Button variant="contained" className="whitespace-nowrap" color="secondary" onClick={handleOpenModalSelectStep}>
              <FuseSvgIcon size={20}>heroicons-outline:arrows-right-left</FuseSvgIcon>
              <span className="hidden sm:flex mx-2">Mudar Etapa</span>
            </Button>
          )}
          <Button
            variant="contained"
            className="whitespace-nowrap"
            color="secondary"
            disabled={_.isEmpty(dirtyFields) || !isValid || !uid || isLoadingUpdate}
            onClick={handleUpdateLead}
          >
            <FuseSvgIcon size={20}>heroicons-outline:check-circle</FuseSvgIcon>
            <span className="hidden sm:flex mx-2">Salvar</span>
          </Button>
        </div>
      )}

      <DefaultConfirmModal
        open={openTransferAlldoModal}
        title="Transferir Lead para Alldo"
        message={`Tem certeza que deseja transferir o lead "${name}" para o Alldo?`}
        onConfirm={handleTransferToAlldo}
        onCancel={() => setOpenTransferAlldoModal(false)}
        confirmText="Transferir"
        cancelText="Cancelar"
        confirmColor="secondary"
        loading={isLoadingTransferAlldo}
      />

      <DefaultConfirmModal
        open={modalConfirmNewClient}
        title="Transformar lead em cliente?"
        message="Tem certeza que deseja transformar este lead em cliente?"
        onConfirm={() => handleConfirmNewClient(true)}
        onCancel={() => handleConfirmNewClient(false)}
      />
      <DefaultConfirmModal
        onCancel={() => setOpenModalSelectStep(false)}
        onConfirm={handleChangeCardOrder}
        open={openModalSelectStep}
        title="Mudar Etapa do Lead"
        message={
          <>
            <Typography variant="body2" color="textSecondary">
              Aqui você pode selecionar a etapa em que quer mover seu Lead
            </Typography>
            <FormControl fullWidth size="small" sx={{ mt: 2 }}>
              <InputLabel id="select-step-label">Etapa</InputLabel>
              <Select
                labelId="select-step-label"
                value={selectedStep?.uid}
                label="Etapa"
                onChange={(e) => {
                  const step = steps?.data?.find((s) => s.uid === e.target.value);
                  setSelectedStep(step);
                }}
                disabled={isLoadingSteps || !steps?.data?.length}
              >
                {steps?.data?.map((step) => {
                  if (aiAutomatic && step.position === 2) {
                    return null;
                  }

                  return (
                    <MenuItem key={step.uid} value={step.uid}>
                      {step.name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </>
        }
        confirmText="Confirmar"
        cancelText="Cancelar"
        confirmColor="secondary"
        loading={isLoadingUpdate}
        confirmDisabled={selectedStep?.uid === stepUid}
      />
      <DefaultConfirmModal
        onCancel={() => setOpenDeleteLeadModal(false)}
        onConfirm={handleDeleteLead}
        open={openDeleteLeadModal}
        title="Excluir lead"
        message={`Tem certeza que deseja excluir o lead "${name}"? Esta ação não poderá ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmColor="error"
        loading={isLoadingDelete}
      />
    </div>
  );
}

export default LeadHeader;
