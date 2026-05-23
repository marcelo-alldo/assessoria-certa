import { Button, Switch, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useAppDispatch } from '@/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useFormContext } from 'react-hook-form';
import _ from 'lodash';
import PageTitle from '@/components/PageTitle';
import { useCreateCollaboratorMutation, useUpdateCollaboratorMutation } from '../collaboratorsApi';
import { useEffect, useState } from 'react';
import DefaultConfirmModal from '@/components/DefaultConfirmModal';

/**
 * The collaborator header component.
 */

interface CollaboratorHeaderProps {
  refetch: () => void;
  setLoading: (loading: boolean) => void;
}

function CollaboratorHeader({ refetch, setLoading }: CollaboratorHeaderProps) {
  const { uid } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { state } = useLocation();

  const methods = useFormContext();
  const { formState, watch, getValues } = methods;

  const { name, enable } = watch();

  const { dirtyFields, isValid } = formState;
  const [createCollaborator, { isLoading: isLoadingCreate }] = useCreateCollaboratorMutation();

  useEffect(() => {
    setLoading(isLoadingCreate);
  }, [isLoadingCreate]);

  // CREATE COLLABORATOR
  const handleCreateCollaborator = () => {
    const values = {
      email: getValues('email'),
      name: getValues('name'),
      phone: getValues('phone'),
      cpf: getValues('cpf'),
      birthDate: getValues('birthDate'),
      cnpj: getValues('cnpj'),
    };
    createCollaborator(values)
      .unwrap()
      .then((response) => {
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
        navigate('/collaborators');
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

  // UPDATE COLLABORATOR
  const [updateCollaborator, { isLoading: isLoadingUpdateCollaborator }] = useUpdateCollaboratorMutation();
  const [isLoadingToggle, setIsLoadingToggle] = useState(false);

  useEffect(() => {
    if (!isLoadingToggle) {
      setLoading(isLoadingUpdateCollaborator);
    }
  }, [isLoadingToggle, isLoadingUpdateCollaborator, setLoading]);

  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);

  const handleUpdateCollaborator = () => {
    setIsLoadingUpdate(true);
    const values = {
      uid,
      email: getValues('email'),
      name: getValues('name'),
      phone: getValues('phone'),
      cpf: getValues('cpf'),
      birthDate: getValues('birthDate'),
    };

    updateCollaborator(values)
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
      })
      .finally(() => {
        setIsLoadingUpdate(false);
      });
  };

  // Função para ativar/desativar Colaborador

  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  function handleOpenConfirmModal(collaborator) {
    setOpenConfirmModal(true);
  }

  const handleToggleEnableCollaborator = () => {
    setIsLoadingToggle(true);
    updateCollaborator({
      uid,
      enable: !getValues('enable'),
    })
      .unwrap()
      .then(() => {
        refetch();
        setOpenConfirmModal(false);
        dispatch(
          showMessage({
            message: getValues('enable') ? 'Colaborador desativado com sucesso' : 'Colaborador ativado com sucesso',
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
        setOpenConfirmModal(false);
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
      })
      .finally(() => setIsLoadingToggle(false));
  };

  return (
    <div className="p-6 sm:p-8 w-full flex items-center sm:justify-between">
      <PageTitle title={uid === 'new' ? 'Novo Colaborador' : name} backNavigation />

      {!state?.isView && (
        <div className="flex flex-1 items-center justify-end space-x-0 sm:space-x-3">
          {uid === 'new' ? (
            <Button
              variant="contained"
              className="whitespace-nowrap"
              color="secondary"
              disabled={_.isEmpty(dirtyFields) || !isValid || isLoadingCreate}
              onClick={handleCreateCollaborator}
            >
              <FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>
              <span className="hidden sm:flex mx-2">Adicionar</span>
            </Button>
          ) : (
            <>
              <div className="flex items-center">
                <Typography fontWeight={700}>{getValues('enable') ? 'Ativado' : 'Inativo'}</Typography>
                <Tooltip title={getValues('enable') ? 'Desativar' : 'Ativar'}>
                  <span>
                    <Switch
                      checked={getValues('enable')}
                      color={getValues('enable') ? 'success' : 'error'}
                      onChange={handleOpenConfirmModal}
                      disabled={isLoadingToggle}
                      inputProps={{ 'aria-label': getValues('enable') ? 'Desativar' : 'Ativar' }}
                    />
                  </span>
                </Tooltip>
              </div>
              <Button
                variant="contained"
                className="whitespace-nowrap"
                color="secondary"
                disabled={_.isEmpty(dirtyFields) || !isValid || isLoadingUpdate}
                onClick={handleUpdateCollaborator}
              >
                <FuseSvgIcon size={20}>heroicons-outline:check-circle</FuseSvgIcon>
                <span className="hidden sm:flex mx-2">Salvar</span>
              </Button>
            </>
          )}
        </div>
      )}

      <DefaultConfirmModal
        onCancel={() => setOpenConfirmModal(false)}
        onConfirm={handleToggleEnableCollaborator}
        open={openConfirmModal}
        title={enable ? 'Desativar Colaborador' : 'Ativar Colaborador'}
        message={enable ? `Tem certeza que deseja desativar o Colaborador "${name}"?` : `Tem certeza que deseja ativar o Colaborador "${name}"?`}
        confirmText={enable ? 'Desativar' : 'Ativar'}
        cancelText="Cancelar"
        confirmColor={enable ? 'error' : 'success'}
        loading={isLoadingToggle}
      />
    </div>
  );
}

export default CollaboratorHeader;
