import { Button, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useAppDispatch } from '@/store/hooks';
import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import _ from 'lodash';
import PageTitle from '@/components/PageTitle';
import {
  useCreateScheduledMessagesMutation,
  useGetRecipientsQuery,
  useUpdateScheduledMessageMutation,
  useUpdateToggleScheduledMessagesMutation,
} from '../scheduledMessagesApi';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import Switch from '@mui/material/Switch';

/**
 * The header component.
 */

interface ScheduledMessageHeaderProps {
  refetch: () => void;
  setLoading: (loading: boolean) => void;
  changeRecipients: boolean;
  recipientsPage: number;
  leadsPage: number;
  clientsPage: number;
}

function ScheduledMessageHeader({ refetch, setLoading, changeRecipients, recipientsPage, leadsPage, clientsPage }: ScheduledMessageHeaderProps) {
  const { uid } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { state } = useLocation();

  const methods = useFormContext();
  const { formState, watch, getValues, reset } = methods;

  const { title } = watch();

  const { dirtyFields, isValid } = formState;
  const [createMessage, { isLoading: isLoadingCreate }] = useCreateScheduledMessagesMutation();

  useEffect(() => {
    setLoading(isLoadingCreate);
  }, [isLoadingCreate, setLoading]);

  // CREATE MESSAGE
  const handleCreate = () => {
    // Garantir que todos os valores sejam arrays válidos
    const newRecipients = Array.isArray(getValues('newRecipients')) ? getValues('newRecipients') : [];

    // Filtrar newRecipients para remover duplicatas baseado em remoteJid, clientUid ou leadUid
    const newRecipientsFiltered = newRecipients.filter((newItem, index) => {
      return !newRecipients.some((otherItem, otherIndex) => {
        // Se for o mesmo item (mesmo índice), não filtrar
        if (index === otherIndex) return false;

        // Se o outro item aparece antes (índice menor), remover o atual (duplicata)
        if (otherIndex < index) {
          // Comparar por remoteJid (sempre presente)
          if (newItem.remoteJid && otherItem.remoteJid && newItem.remoteJid === otherItem.remoteJid) {
            return true;
          }

          // Comparar por leadUid se ambos tiverem
          if (newItem.leadUid && otherItem.leadUid && newItem.leadUid === otherItem.leadUid) {
            return true;
          }

          // Comparar por clientUid se ambos tiverem
          if (newItem.clientUid && otherItem.clientUid && newItem.clientUid === otherItem.clientUid) {
            return true;
          }
        }

        return false;
      });
    });

    const values = {
      title: getValues('title'),
      message: getValues('message'),
      sendAt: getValues('sentAt'),
      messageTemplateUid: getValues('messageTemplateUid'),
      newRecipients: newRecipientsFiltered,
    };
    createMessage(values)
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
        reset();
        navigate('/scheduled-messages');
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

  // UPDATE MESSAGE
  const [updateMessage, { isLoading }] = useUpdateScheduledMessageMutation();

  const { refetch: refetchRecipients } = useGetRecipientsQuery(`page=${recipientsPage}&message=${uid}`);
  const { refetch: refetchLeads } = useGetRecipientsQuery(`page=${leadsPage}&leads=true&message=${uid}`);
  const { refetch: refetchClients } = useGetRecipientsQuery(`page=${clientsPage}&clients=true&message=${uid}`);

  const handleUpdate = () => {
    setLoading(true);
    // Garantir que todos os valores sejam arrays válidos
    const selectedsRecipients = Array.isArray(getValues('selectedsRecipients')) ? getValues('selectedsRecipients') : [];
    const removedRecipients = Array.isArray(getValues('removedRecipients')) ? getValues('removedRecipients') : [];
    const newRecipients = Array.isArray(getValues('newRecipients')) ? getValues('newRecipients') : [];

    // Filtrar newRecipients para remover os que já estão em selectedsRecipients
    const newRecipientsFiltered = newRecipients.filter((newItem) => {
      return !selectedsRecipients.some((selectedItem) => {
        // Comparar por remoteJid (sempre presente)
        if (newItem.remoteJid && selectedItem.remoteJid && newItem.remoteJid === selectedItem.remoteJid) {
          return true;
        }

        // Comparar por leadUid se ambos tiverem
        if (newItem.leadUid && selectedItem.leadUid && newItem.leadUid === selectedItem.leadUid) {
          return true;
        }

        // Comparar por clientUid se ambos tiverem
        if (newItem.clientUid && selectedItem.clientUid && newItem.clientUid === selectedItem.clientUid) {
          return true;
        }

        return false;
      });
    });

    const values = {
      uid,
      title: getValues('title'),
      message: getValues('message'),
      sendAt: getValues('sentAt'),
      messageTemplateUid: getValues('messageTemplateUid'),
      removedRecipients,
      newRecipients: newRecipientsFiltered,
    };

    updateMessage(values)
      .unwrap()
      .then((response) => {
        refetch();
        refetchRecipients();
        refetchLeads();
        refetchClients();
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
        setLoading(false);
      });
  };

  const [isLoadingToggle, setIsLoadingToggle] = useState(false);
  // const [updateToggle] = useUpdateToggleScheduledMessagesMutation();

  const [updateToggleSchedule] = useUpdateToggleScheduledMessagesMutation();

  // Função para ativar/desativar
  function handleToggleEnable() {
    setIsLoadingToggle(true);
    updateToggleSchedule(uid)
      .unwrap()
      .then(() => {
        refetch();
        dispatch(
          showMessage({
            message: `Mensagem "${getValues('title')}" ${getValues('enable') ? 'desativado' : 'ativado'} com sucesso`,
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
        dispatch(
          showMessage({
            message: `Erro ao ${getValues('enable') ? 'desativar' : 'ativar'} a Mensagem "${getValues('title')}"`,
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
  }

  const canSubmitCallBack = useCallback(() => {
    if (changeRecipients) {
      return false;
    }

    return _.isEmpty(dirtyFields) || !isValid || isLoadingCreate;
  }, [dirtyFields, isValid, isLoadingCreate, changeRecipients]);

  return (
    <div className="p-6 sm:p-8 w-full flex items-center sm:justify-between">
      <PageTitle title={uid === 'new' ? 'Nova Mensagem' : title} backNavigation />

      {!state?.isView && (
        <div className="flex flex-1 items-center justify-end space-x-0 sm:space-x-3">
          {uid === 'new' ? (
            <Button variant="contained" className="whitespace-nowrap" color="secondary" disabled={canSubmitCallBack()} onClick={handleCreate}>
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
                      onChange={handleToggleEnable}
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
                disabled={canSubmitCallBack() || isLoading}
                onClick={handleUpdate}
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

export default ScheduledMessageHeader;
