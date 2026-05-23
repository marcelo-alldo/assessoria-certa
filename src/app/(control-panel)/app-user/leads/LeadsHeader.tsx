import { Button } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import CreateLeadModal from '@/components/CreateLeadModal';
import { useState } from 'react';
import ImportLeadsFileModal from './components/ImportLeadsFileModal';
import PageTitle from '@/components/PageTitle';

/**
 * The leads header component.
 */

interface LeadsHeaderProps {
  refetch: () => void;
}

function LeadsHeader({ refetch }: LeadsHeaderProps) {
  const [openCreateLeadModal, setOpenCreateLeadModal] = useState(false);
  const [openImportLeadsModal, setOpenImportLeadsModal] = useState(false);
  return (
    <div className="p-6 sm:p-8 w-full flex items-center sm:justify-between">
      <PageTitle title="Lista de Leads" />

      <div className="flex flex-1 items-center justify-end space-x-0 sm:space-x-3">
        <Button variant="contained" onClick={() => setOpenCreateLeadModal(true)} className="whitespace-nowrap" color="secondary">
          <FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>
          <span className="hidden sm:flex mx-2">Adicionar Lead</span>
        </Button>
        <Button variant="contained" onClick={() => setOpenImportLeadsModal(true)} className="whitespace-nowrap" color="secondary">
          <FuseSvgIcon size={20}>heroicons-outline:arrow-up-tray</FuseSvgIcon>
          <span className="hidden sm:flex mx-2">Importar Leads</span>
        </Button>
        <Button variant="outlined" className="whitespace-nowrap" color="primary" component="a" href="/assets/excel-models/modelo_leads.xlsx" download>
          <FuseSvgIcon size={20}>heroicons-outline:arrow-down-tray</FuseSvgIcon>
          <span className="hidden sm:flex mx-2">Baixar Modelo</span>
        </Button>
      </div>

      <CreateLeadModal open={openCreateLeadModal} onClose={() => setOpenCreateLeadModal(false)} refetch={refetch} />
      <ImportLeadsFileModal open={openImportLeadsModal} onClose={() => setOpenImportLeadsModal(false)} refetch={refetch} />
    </div>
  );
}

export default LeadsHeader;
