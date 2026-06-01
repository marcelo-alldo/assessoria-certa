import PageTitle from '@/components/PageTitle';
import { useCreateConfigMutation, useUpdateConfigMutation } from '@/store/api/configsApi';
import { useAppDispatch } from '@/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Button } from '@mui/material';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

type TestingFormValues = {
  actived: {
    uid: string;
    value: string;
    name: string;
    key: string;
  };
  testingNumber: {
    uid: string;
    value: string;
    name: string;
    key: string;
  };
};

interface TestingHeaderProps {
  refetch: () => void;
  setLoading: (loading: boolean) => void;
  hasChanges: boolean;
  setHasChanges: (hasChanges: boolean) => void;
}

function TestingHeader({ refetch, setLoading, hasChanges, setHasChanges }: TestingHeaderProps) {
  const methods = useFormContext<TestingFormValues>();
  const { watch, reset, formState } = methods;
  const dispatch = useAppDispatch();

  const [createConfig, { isLoading: isLoadingCreate }] = useCreateConfigMutation();
  const [updateConfig, { isLoading: isLoadingUpdate }] = useUpdateConfigMutation();

  useEffect(() => {
    setLoading(isLoadingCreate || isLoadingUpdate);
  }, [isLoadingCreate, isLoadingUpdate, setLoading]);

  const { actived, testingNumber } = watch();
  const { dirtyFields, isValid } = formState;

  const handleSave = async () => {
    try {
      const promises = [];

      // Handle actived config
      if (actived.uid) {
        // Update existing actived config
        promises.push(
          updateConfig({
            uid: actived.uid,
            key: actived.key,
            value: actived.value,
            name: actived.name,
          }),
        );
      } else {
        // Create new actived config
        promises.push(
          createConfig({
            key: actived.key,
            value: actived.value,
            name: actived.name,
          }),
        );
      }

      // Handle testingNumber config
      if (testingNumber.uid) {
        // Update existing testingNumber config
        const phoneValue = testingNumber.value.replace(/\D/g, '');
        const formattedPhone = phoneValue.startsWith('55') ? phoneValue : `55${phoneValue}`;

        promises.push(
          updateConfig({
            uid: testingNumber.uid,
            key: testingNumber.key,
            value: formattedPhone,
            name: testingNumber.name,
          }),
        );
      } else {
        // Create new testingNumber config
        const phoneValue = testingNumber.value.replace(/\D/g, '');
        const formattedPhone = phoneValue.startsWith('55') ? phoneValue : `55${phoneValue}`;

        promises.push(
          createConfig({
            key: testingNumber.key,
            value: formattedPhone,
            name: testingNumber.name,
          }),
        );
      }

      // Execute all promises
      const responses = await Promise.all(promises.map((p) => p.unwrap()));

      refetch();
      setHasChanges(false);

      dispatch(
        showMessage({
          message: 'Configurações salvas com sucesso',
          autoHideDuration: 3000,
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        }),
      );
    } catch (error: any) {
      dispatch(
        showMessage({
          message: error?.data?.msg || 'Erro ao salvar configurações',
          autoHideDuration: 3000,
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        }),
      );
    }
  };
  return (
    <div className="p-6 sm:p-8 w-full flex items-center sm:justify-between">
      <PageTitle title="Controle de Teste" />

      <div className="flex flex-1 items-center justify-end space-x-0 sm:space-x-3">
        <Button
          variant="contained"
          disabled={!hasChanges || isLoadingCreate || isLoadingUpdate}
          onClick={() => handleSave()}
          className="whitespace-nowrap"
          color="primary"
        >
          <FuseSvgIcon size={20}>heroicons-outline:check-circle</FuseSvgIcon>
          <span className="hidden sm:flex mx-2">Salvar</span>
        </Button>
      </div>
    </div>
  );
}

export default TestingHeader;
