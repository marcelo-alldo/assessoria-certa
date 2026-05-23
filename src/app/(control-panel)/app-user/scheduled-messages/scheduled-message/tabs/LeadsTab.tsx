import TableLeads from '../components/TableLeads';

interface LeadsTabProps {
  changeRecipients: (change: boolean) => void;
  page: number;
  setPage: (page: number) => void;
}

function LeadsTab({ changeRecipients, page, setPage }: LeadsTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <TableLeads changeRecipients={changeRecipients} page={page} setPage={setPage} />
    </div>
  );
}

export default LeadsTab;
