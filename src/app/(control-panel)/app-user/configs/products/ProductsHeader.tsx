import PageTitle from '@/components/PageTitle';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Button } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { useCreateConfigMutation, useUpdateConfigMutation } from '../../../../../store/api/configsApi';
import { useAppDispatch } from '@/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useEffect } from 'react';

/**
 * The products header component.
 */

interface ProductsHeaderProps {
  refetch: () => void;
  setLoading: (loading: boolean) => void;
  uid?: string;
  hasChanges: boolean;
  setHasChanges: (hasChanges: boolean) => void;
}

function ProductsHeader({ refetch, setLoading, uid, hasChanges, setHasChanges }: ProductsHeaderProps) {
  const methods = useFormContext();
  const { formState, watch } = methods;
  const dispatch = useAppDispatch();

  const [createConfig, { isLoading: isLoadingCreate }] = useCreateConfigMutation();
  const [updateConfig, { isLoading: isLoadingUpdate }] = useUpdateConfigMutation();

  useEffect(() => {
    setLoading(isLoadingCreate);
  }, [isLoadingCreate, setLoading]);

  useEffect(() => {
    setLoading(isLoadingUpdate);
  }, [isLoadingUpdate, setLoading]);

  const { products } = watch();
  const { isValid } = formState;

  const handleSave = () => {
    const parsedProducts = JSON.stringify({ products }, null, 2);

    if (uid) {
      updateConfig({
        uid,
        key: 'PRODUCTS',
        value: 'Produtos da empresa',
        name: 'Sobre a empresa',
        data: parsedProducts,
      })
        .unwrap()
        .then((response) => {
          setHasChanges(false); // Resetar mudanças após salvar
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
              message: error?.data?.msg || 'Erro ao atualizar produtos',
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
        key: 'PRODUCTS',
        value: 'Produtos da empresa',
        name: 'Sobre a empresa',
        data: parsedProducts,
      })
        .unwrap()
        .then((response) => {
          setHasChanges(false); // Resetar mudanças após salvar
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
              message: error?.data?.msg || 'Erro ao criar produtos',
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
      <PageTitle title="Produtos da sua empresa" />

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

export default ProductsHeader;
