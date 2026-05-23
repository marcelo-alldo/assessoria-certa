import TableClients from '../components/TableClients';

interface ClientsTabProps {
  changeRecipients: (change: boolean) => void;
  page: number;
  setPage: (page: number) => void;
}

function ClientsTab({ changeRecipients, page, setPage }: ClientsTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <TableClients changeRecipients={changeRecipients} page={page} setPage={setPage} />
    </div>
  );
}

export default ClientsTab;
