import { Button } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import CreateLeadModal from '@/components/CreateLeadModal';
import { useState } from 'react';
import PageTitle from '@/components/PageTitle';
import CreateClientModal from '@/components/CreateClientModal';
import CreateTagModal from '@/components/CreateTagModal';

/**
 * The board header component.
 */

interface BoardHeaderProps {
  refetch?: () => void;
  type: 'clients' | 'leads';
}

function BoardHeader({ refetch, type }: BoardHeaderProps) {
  const [openCreateLeadModal, setOpenCreateLeadModal] = useState(false);
  const [openCreateClientModal, setOpenCreateClientModal] = useState(false);

  return (
    <div className="p-6 sm:p-8 w-full flex items-center sm:justify-between">
      <div className="flex flex-col">
        {type === 'clients' && <PageTitle title="Painel de Clientes" />}
        {type === 'leads' && <PageTitle title="Painel de Leads" />}
      </div>

      <div className="flex flex-1 items-center justify-end space-x-0 sm:space-x-3">
        <Button
          onClick={() => {
            type === 'clients' ? setOpenCreateClientModal(true) : setOpenCreateLeadModal(true);
          }}
          variant="contained"
          className="whitespace-nowrap"
          color="secondary"
        >
          <FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>
          {type === 'clients' && <span className="hidden sm:flex mx-2">Adicionar Cliente</span>}
          {type === 'leads' && <span className="hidden sm:flex mx-2">Adicionar Lead</span>}
        </Button>
      </div>

      <CreateLeadModal open={openCreateLeadModal} onClose={() => setOpenCreateLeadModal(false)} refetch={refetch} />
      <CreateClientModal open={openCreateClientModal} onClose={() => setOpenCreateClientModal(false)} refetch={refetch} />
    </div>
  );
}

export default BoardHeader;
