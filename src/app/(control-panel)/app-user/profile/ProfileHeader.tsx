import { Button } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageTitle from '@/components/PageTitle';
import { useFormContext } from 'react-hook-form';
import _ from 'lodash';
import { UpdateUserType, useUpdateUserMutation } from '@/store/api/userApi';
import { useAppDispatch } from '@/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useEffect } from 'react';

/**
 * The Profile header component.
 */

interface ProfileHeaderProps {
  setLoading: (loading: boolean) => void;
  refetch: () => void;
}

function ProfileHeader({ setLoading, refetch }: ProfileHeaderProps) {
  const methods = useFormContext();
  const { formState, getValues } = methods;
  const dispatch = useAppDispatch();

  const { dirtyFields, isValid } = formState;

  const [updateUser, { isLoading: isLoadingUpdate }] = useUpdateUserMutation();

  useEffect(() => {
    setLoading(isLoadingUpdate);
  }, [isLoadingUpdate, setLoading]);

  function handleSave() {
    updateUser(getValues() as UpdateUserType)
      .unwrap()
      .then((response) => {
        refetch();
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
            message: error.data?.msg,
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

  return (
    <div className="p-6 sm:p-8 w-full flex items-center sm:justify-between">
      <PageTitle title="Meu Perfil" />

      <div className="flex flex-1 items-center justify-end space-x-0 sm:space-x-3">
        <Button
          variant="contained"
          onClick={handleSave}
          className="whitespace-nowrap"
          color="secondary"
          // disabled={_.isEmpty(dirtyFields) || !isValid || isLoadingUpdate}
          disabled={_.isEmpty(dirtyFields) || !isValid}
        >
          <FuseSvgIcon size={20}>heroicons-outline:check-circle</FuseSvgIcon>
          <span className="hidden sm:flex mx-2">Salvar</span>
        </Button>
      </div>
    </div>
  );
}

export default ProfileHeader;
