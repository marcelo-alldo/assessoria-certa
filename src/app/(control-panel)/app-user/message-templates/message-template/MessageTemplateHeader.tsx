import { Button } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useNavigate, useParams } from 'react-router';
import { useFormContext } from 'react-hook-form';
import { useAppDispatch } from '@/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { CreateMessageTemplateType, useCreateMessageTemplateMutation } from '../messageTemplatesApi';
import PageTitle from '@/components/PageTitle';
import DefaultConfirmModal from '@/components/DefaultConfirmModal';
import { useState } from 'react';

interface MessageTemplateHeaderProps {
  setLoading: (loading: boolean) => void;
}

function MessageTemplateHeader({ setLoading }: MessageTemplateHeaderProps) {
  const { uid } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  const [createMessageTemplate] = useCreateMessageTemplateMutation();

  const methods = useFormContext();
  const { formState, watch, reset, getValues } = methods;
  const { name } = watch();
  const { dirtyFields, isValid } = formState;

  const isNew = uid === 'new';

  const handleCreateClick = () => {
    if (!isValid) return;

    setOpenConfirmModal(true);
  };

  const handleConfirmCreate = async () => {
    setOpenConfirmModal(false);
    setLoading(true);
    try {
      const formData = getValues();

      const { uid, ...createData } = formData;

      const messageTemplateData: CreateMessageTemplateType = {
        name: createData.name,
        category: createData.category,
        enable: createData.enable,
        message: createData.message,
        image: createData.image,
      };

      await createMessageTemplate(messageTemplateData).unwrap();

      dispatch(
        showMessage({
          message: 'Modelo de mensagem criado com sucesso!',
          autoHideDuration: 3000,
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        }),
      );
      reset();
      navigate('/message-templates');
    } catch (error) {
      console.error('Error creating message template:', error);

      let errorMessage = 'Erro ao criar modelo de mensagem';

      if (error && typeof error === 'object' && 'data' in error) {
        const errorData = error.data as any;

        if (errorData?.error) {
          errorMessage = errorData.error;
        }
      }

      dispatch(
        showMessage({
          message: errorMessage,
          autoHideDuration: 6000,
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCreate = () => {
    setOpenConfirmModal(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row flex-1 w-full items-center justify-between space-y-8 sm:space-y-0 py-8 px-6 sm:px-8">
        <PageTitle title={name || 'Novo Modelo de Mensagem'} backNavigation />

        <div className="flex items-center -mx-4">
          {isNew && (
            <Button variant="contained" color="primary" onClick={handleCreateClick} className="mx-4" disabled={!isValid}>
              <FuseSvgIcon size={20}>heroicons-outline:check-circle</FuseSvgIcon>
              <span className="mx-2">Criar</span>
            </Button>
          )}
        </div>
      </div>

      <DefaultConfirmModal
        open={openConfirmModal}
        title="Aviso Importante"
        message="Atenção: Após criar um modelo de mensagem, ele não poderá ser editado, apenas excluído. Tem certeza que deseja continuar?"
        confirmText="Sim, criar modelo"
        cancelText="Cancelar"
        onConfirm={handleConfirmCreate}
        onCancel={handleCancelCreate}
        confirmColor="primary"
      />
    </>
  );
}

export default MessageTemplateHeader;
