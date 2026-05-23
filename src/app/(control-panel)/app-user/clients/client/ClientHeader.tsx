import { Button, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useAppDispatch } from '@/store/hooks';
import { useEffect, useState } from 'react';

import { useFormContext } from 'react-hook-form';
import _ from 'lodash';
import PageTitle from '@/components/PageTitle';
import { useCreateClientMutation, useUpdateClientMutation } from '../../../../../store/api/clientsApi';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import Switch from '@mui/material/Switch';
import { useToggleArchiveMutation } from '../../../../../store/api/archiveApi';

/**
 * The client header component.
 */

interface ClientHeaderProps {
  refetch: () => void;
  setLoading: (loading: boolean) => void;
}

function ClientHeader({ refetch, setLoading }: ClientHeaderProps) {
  const { uid } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { state } = useLocation();

  const methods = useFormContext();
  const { formState, watch, getValues } = methods;

  const { name } = watch();

  const { dirtyFields, isValid } = formState;
  const [createClient, { isLoading: isLoadingCreate }] = useCreateClientMutation();
  const [toggleArchive, { isLoading: isLoadingToggleArchive }] = useToggleArchiveMutation();

  useEffect(() => {
    setLoading(isLoadingCreate);
  }, [isLoadingCreate]);

  // CREATE CLIENT
  const handleCreateClient = () => {
    const values = {
      email: getValues('email'),
      name: getValues('name'),
      phone: getValues('phone'),
      cpf: getValues('cpf'),
      birthDate: getValues('birthDate'),
      cnpj: getValues('cnpj'),
      notes: getValues('notes'),
      summary: getValues('summary'),
      fantasyName: getValues('fantasyName'),
      address: getValues('address'),
      complement: getValues('complement'),
      cityUid: getValues('cityUid'),
      latitude: getValues('latitude'),
      longitude: getValues('longitude'),
      neighborhood: getValues('neighborhood'),
      number: getValues('number'),
      zipCode: getValues('zipCode'),
      enterprise: getValues('enterprise'),
      lastPurchase: getValues('lastPurchase'),
    };
    createClient(values)
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
        navigate('/clients');
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
  // UPDATE CLIENT
  const [updateClient, { isLoading: isLoadingUpdateClient }] = useUpdateClientMutation();
  useEffect(() => {
    setLoading(isLoadingUpdateClient);
  }, [isLoadingUpdateClient]);

  useEffect(() => {
    setLoading(isLoadingToggleArchive);
  }, [isLoadingToggleArchive]);

  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);

  const handleUpdateClient = () => {
    setIsLoadingUpdate(true);
    const values = {
      uid,
      profileUpdate: getValues('profileUpdate'),
      email: getValues('email'),
      name: getValues('name'),
      phone: getValues('phone'),
      cpf: getValues('cpf'),
      notes: getValues('notes'),
      summary: getValues('summary'),
      birthDate: getValues('birthDate'),
      cnpj: getValues('cnpj'),
      fantasyName: getValues('fantasyName'),
      addressUpdate: getValues('addressUpdate'),
      address: getValues('address'),
      complement: getValues('complement'),
      cityUid: getValues('cityUid'),
      latitude: getValues('latitude'),
      longitude: getValues('longitude'),
      neighborhood: getValues('neighborhood'),
      number: getValues('number'),
      zipCode: getValues('zipCode'),
      documentUpdate: getValues('documentUpdate'),
      enterprise: getValues('enterprise'),
      lastPurchase: getValues('lastPurchase'),
    };

    updateClient(values)
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

  const handleToggleArchiveClient = () => {
    const currentArchived = !!getValues('archived');
    toggleArchive({ entity: 'clients', uid, archived: !currentArchived })
      .unwrap()
      .then((response) => {
        refetch();
        dispatch(
          showMessage({
            message: response?.msg || (currentArchived ? 'Apoiador desarquivado com sucesso' : 'Apoiador arquivado com sucesso'),
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

  // Função para ativar/desativar cliente
  const [isLoadingToggle, setIsLoadingToggle] = useState(false);

  const handleToggleEnableClient = () => {
    setIsLoadingToggle(true);
    updateClient({
      uid,
      enable: !getValues('enable'),
    })
      .unwrap()
      .then(() => {
        refetch();
        dispatch(
          showMessage({
            message: getValues('enable') ? 'Apoiador desativado com sucesso' : 'Apoiador ativado com sucesso',
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
      .finally(() => setIsLoadingToggle(false));
  };

  return (
    <div className="p-6 sm:p-8 w-full flex items-center sm:justify-between">
      <PageTitle title={uid === 'new' ? 'Novo Apoiador' : name} backNavigation />

      {!state?.isView && (
        <div className="flex flex-1 items-center justify-end space-x-0 sm:space-x-3">
          {uid === 'new' ? (
            <Button
              variant="contained"
              className="whitespace-nowrap"
              color="secondary"
              disabled={_.isEmpty(dirtyFields) || !isValid || isLoadingCreate}
              onClick={handleCreateClient}
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
                      onChange={handleToggleEnableClient}
                      disabled={isLoadingToggle}
                      inputProps={{ 'aria-label': getValues('enable') ? 'Desativar' : 'Ativar' }}
                    />
                  </span>
                </Tooltip>
              </div>
              <Button
                variant="contained"
                className="whitespace-nowrap"
                color={getValues('archived') ? 'secondary' : 'primary'}
                onClick={handleToggleArchiveClient}
                disabled={isLoadingToggleArchive}
              >
                <FuseSvgIcon size={20}>heroicons-outline:archive-box</FuseSvgIcon>
                <span className="hidden sm:flex mx-2">{getValues('archived') ? 'Desarquivar' : 'Arquivar'}</span>
              </Button>
              <Button
                variant="contained"
                className="whitespace-nowrap"
                color="secondary"
                disabled={_.isEmpty(dirtyFields) || !isValid || isLoadingUpdate}
                onClick={handleUpdateClient}
              >
                <FuseSvgIcon size={20}>heroicons-outline:check-circle</FuseSvgIcon>
                <span className="hidden sm:flex mx-2">Salvar</span>
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ClientHeader;
