import { Button, Switch, Tooltip, Typography, TextField, Box } from '@mui/material';
import { useLocation } from 'react-router';
import { useFormContext } from 'react-hook-form';
import PageTitle from '@/components/PageTitle';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useUpdateUserEnableMutation } from '@/store/api/userApi';
import { useAppDispatch } from '@/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useState } from 'react';
import DefaultConfirmModal from '@/components/DefaultConfirmModal';
import { useUpdateConfigMutation } from '@/store/api/configsApi';
import { useGenerateUserKeyMutation } from '@/store/api/adminApi';

/**
 * The user header component.
 */

interface UserHeaderProps {
  setLoading: (loading: boolean) => void;
  refetch: () => void;
}

function UserHeader({ setLoading, refetch }: UserHeaderProps) {
  const { state } = useLocation();
  const dispatch = useAppDispatch();

  const methods = useFormContext();
  const { watch, getValues } = methods;

  const { profile, configs, enable, uid } = watch();
  const { name } = profile;

  const findPendingStatus = configs.find((config) => config.value === 'PENDING');

  // Update user

  const [updateUser, { isLoading: isLoadingUpdateUser }] = useUpdateUserEnableMutation();

  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  function handleOpenConfirmModal() {
    setOpenConfirmModal(true);
  }

  // Função para ativar/desativar
  function handleToggleEnableUser() {
    updateUser({ uid: uid, enable: !enable })
      .unwrap()
      .then(() => {
        refetch();
        setOpenConfirmModal(false);
        dispatch(
          showMessage({
            message: `Usuário "${name}" ${enable ? 'desativado' : 'ativado'} com sucesso`,
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
        dispatch(
          showMessage({
            message: `Erro ao ${enable ? 'desativar' : 'ativar'} o Usuário "${name}"`,
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

  const [updateConfig, { isLoading: isLoadingUpdateConfig }] = useUpdateConfigMutation();

  function handleUpdateConfig() {
    updateConfig({
      uid: configs?.find((config) => config.key === 'ALLDO_STATUS')?.uid || '',
      value: 'FINISHED',
      key: 'ALLDO_STATUS',
      data: configs?.find((config) => config.key === 'ALLDO_STATUS')?.data || '',
      name: 'Status do Alldo Assistente',
    })
      .unwrap()
      .then((response) => {
        refetch();
        setLoading(false);
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
        setLoading(false);
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

  const [openKeyModal, setOpenKeyModal] = useState(false);
  const [generateKey, { isLoading: isLoadingGenerateKey, data: generateKeyResp }] = useGenerateUserKeyMutation();
  const [password, setPassword] = useState('');

  const handleGenerateKey = () => {
    generateKey({ userUid: uid, password })
      .unwrap()
      .then((response) => {
        setPassword('');
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
        setPassword('');
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

  return (
    <div className="p-6 sm:p-8 w-full flex items-center sm:justify-between">
      <PageTitle title={name} backNavigation />

      {!state?.isView && (
        <div className="flex flex-1 items-center justify-end space-x-0 sm:space-x-3">
          <div className="flex items-center">
            <Typography fontWeight={700}>{getValues('enable') ? 'Ativado' : 'Inativo'}</Typography>
            <Tooltip title={getValues('enable') ? 'Desativar' : 'Ativar'}>
              <span>
                <Switch
                  checked={getValues('enable')}
                  color={getValues('enable') ? 'success' : 'error'}
                  onChange={handleOpenConfirmModal}
                  disabled={isLoadingUpdateUser}
                  inputProps={{ 'aria-label': getValues('enable') ? 'Desativar' : 'Ativar' }}
                />
              </span>
            </Tooltip>
          </div>
          {findPendingStatus && (
            <Button variant="contained" className="whitespace-nowrap" color="secondary" disabled={isLoadingUpdateConfig} onClick={handleUpdateConfig}>
              <FuseSvgIcon size={20}>heroicons-outline:cog-8-tooth</FuseSvgIcon>
              <span className="hidden sm:flex mx-2">Finalizar configuração</span>
            </Button>
          )}
          <Button
            variant="contained"
            className="whitespace-nowrap"
            color="secondary"
            disabled={isLoadingGenerateKey}
            onClick={() => setOpenKeyModal(true)}
          >
            <FuseSvgIcon size={20}>heroicons-outline:key</FuseSvgIcon>
            <span className="hidden sm:flex mx-2">Gerar chave</span>
          </Button>
        </div>
      )}

      <DefaultConfirmModal
        onCancel={() => setOpenConfirmModal(false)}
        onConfirm={handleToggleEnableUser}
        open={openConfirmModal}
        title={enable ? 'Desativar Usuário' : 'Ativar Usuário'}
        message={enable ? `Tem certeza que deseja desativar o Usuário "${name}"?` : `Tem certeza que deseja ativar o Usuário "${name}"?`}
        confirmText={enable ? 'Desativar' : 'Ativar'}
        cancelText="Cancelar"
        confirmColor={enable ? 'error' : 'success'}
        loading={isLoadingUpdateUser}
      />

      <DefaultConfirmModal
        onCancel={generateKeyResp?.success === true ? undefined : () => setOpenKeyModal(false)}
        onConfirm={generateKeyResp?.success === true ? () => setOpenKeyModal(false) : handleGenerateKey}
        open={openKeyModal}
        title="Gerar Chave de Acesso"
        message={
          generateKeyResp?.success === true ? (
            <Box>
              <Box display="flex" alignItems="center" flexDirection="column" gap={1} mt={1} sx={{ overflowX: 'auto', maxWidth: '100%' }}>
                <Typography variant="h6" color="success.main">
                  Chave gerada com sucesso!
                </Typography>
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{
                    wordBreak: 'break-all',
                    whiteSpace: 'pre-wrap',
                    flex: 1,
                    overflowX: 'hidden',
                  }}
                >
                  {generateKeyResp?.data?.user_key || 'Chave não disponível'}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    navigator.clipboard.writeText(generateKeyResp?.data?.user_key || '');
                    setOpenKeyModal(false);
                  }}
                  sx={{ minWidth: 0, px: 1 }}
                >
                  Copiar
                </Button>
              </Box>
            </Box>
          ) : (
            <TextField
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              label="Senha"
              fullWidth
              autoFocus
              size="medium"
              margin="normal"
              variant="outlined"
            />
          )
        }
        confirmText={generateKeyResp?.success === true ? 'Fechar' : 'Gerar'}
        cancelText="Cancelar"
        confirmColor="primary"
        hideCancel={generateKeyResp?.success === true}
        loading={isLoadingGenerateKey}
      />
    </div>
  );
}

export default UserHeader;
