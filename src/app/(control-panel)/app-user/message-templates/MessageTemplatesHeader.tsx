import { Button } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageTitle from '@/components/PageTitle';
import { useNavigate } from 'react-router';

function MessageTemplatesHeader() {
  const navigate = useNavigate();

  return (
    <div className="p-6 sm:p-8 w-full flex items-center sm:justify-between">
      <PageTitle title="Modelos de Mensagem" />

      <div className="flex flex-1 items-center justify-end space-x-0 sm:space-x-3">
        <Button variant="contained" onClick={() => navigate('/message-templates/new')} className="whitespace-nowrap" color="primary">
          <FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>
          <span className="hidden sm:flex mx-2">Criar Modelo de Mensagem</span>
        </Button>
      </div>
    </div>
  );
}

export default MessageTemplatesHeader;
