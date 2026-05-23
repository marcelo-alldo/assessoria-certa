import PageTitle from '@/components/PageTitle';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Button } from '@mui/material';
import _ from 'lodash';
import { useFormContext } from 'react-hook-form';
import { useCreateConfigMutation, useUpdateConfigMutation } from '../../../../../store/api/configsApi';
import { useAppDispatch } from '@/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useEffect } from 'react';

/**
 * The about header component.
 */

interface AboutHeaderProps {
  refetch: () => void;
  setLoading: (loading: boolean) => void;
  uid?: string;
}

function AboutHeader({ refetch, setLoading, uid }: AboutHeaderProps) {
  const methods = useFormContext();
  const { formState, watch } = methods;
  const dispatch = useAppDispatch();

  const [createConfig, { isLoading: isLoadingCreate }] = useCreateConfigMutation();
  const [updateConfig, { isLoading: isLoadingUpdate }] = useUpdateConfigMutation();

  useEffect(() => {
    setLoading(isLoadingCreate);
  }, [isLoadingCreate]);

  useEffect(() => {
    setLoading(isLoadingUpdate);
  }, [isLoadingUpdate]);

  const { about } = watch();
  const { dirtyFields, isValid } = formState;

  const handleSave = () => {
    if (uid) {
      updateConfig({
        uid,
        key: 'ABOUT',
        value: about,
        name: 'Sobre a empresa',
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
    } else {
      createConfig({
        key: 'ABOUT',
        value: about,
        name: 'Sobre a empresa',
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
    }
  };

  return (
    <div className="p-6 sm:p-8 w-full flex items-center sm:justify-between">
      <PageTitle title="Sobre sua empresa" />

      <div className="flex flex-1 items-center justify-end space-x-0 sm:space-x-3">
        <Button
          variant="contained"
          disabled={_.isEmpty(dirtyFields) || !isValid || isLoadingCreate || isLoadingUpdate}
          onClick={() => handleSave()}
          className="whitespace-nowrap"
          color="secondary"
        >
          <FuseSvgIcon size={20}>heroicons-outline:check-circle</FuseSvgIcon>
          <span className="hidden sm:flex mx-2">Salvar</span>
        </Button>
      </div>
    </div>
  );
}

export default AboutHeader;
