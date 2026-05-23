import PageTitle from '@/components/PageTitle';
import { useCreateOriginMutation, useUpdateOriginMutation } from '@/store/api/originsApi';
import { useAppDispatch } from '@/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Button } from '@mui/material';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

type OriginFormValues = {
  name: string;
  key: string;
  tagUid: string;
};

interface OriginsHeaderProps {
  refetch: () => void;
  setLoading: (loading: boolean) => void;
  uid?: string;
  hasChanges: boolean;
  setHasChanges: (hasChanges: boolean) => void;
  showForm: (show: boolean) => void;
}

function OriginsHeader({ refetch, setLoading, uid, hasChanges, setHasChanges, showForm }: OriginsHeaderProps) {
  const methods = useFormContext<OriginFormValues>();
  const { watch, reset } = methods;
  const dispatch = useAppDispatch();

  const [createOrigin, { isLoading: isLoadingCreate }] = useCreateOriginMutation();
  const [updateOriginMutation, { isLoading: isLoadingUpdate }] = useUpdateOriginMutation();

  useEffect(() => {
    setLoading(isLoadingCreate || isLoadingUpdate);
  }, [isLoadingCreate, isLoadingUpdate, setLoading]);

  const handleSave = () => {
    const { name, key, tagUid } = watch();

    const payload = {
      name: name?.trim(),
      key: key?.trim(),
      tagUid: tagUid?.trim() || undefined,
    };

    if (!payload.name || !payload.key || !payload.tagUid) {
      return;
    }

    if (uid) {
      updateOriginMutation({
        uid,
        ...payload,
      })
        .unwrap()
        .then((response) => {
          setHasChanges(false);
          refetch();
          reset({ name: '', key: '', tagUid: '' });
          showForm(false);
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
              message: error?.data?.msg || 'Erro ao atualizar origem',
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
      createOrigin(payload)
        .unwrap()
        .then((response) => {
          setHasChanges(false);
          refetch();
          reset({ name: '', key: '', tagUid: '' });
          showForm(false);
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
              message: error?.data?.msg || 'Erro ao criar origem',
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
      <PageTitle title="Lista de Origens" />

      <div className="flex flex-1 items-center justify-end space-x-0 sm:space-x-3">
        <Button
          variant="contained"
          disabled={!hasChanges || isLoadingCreate || isLoadingUpdate}
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

export default OriginsHeader;
