import TableRecipients from '../components/TableRecipients';
import { Box } from '@mui/material';

interface RecipientsTabProps {
  changeRecipients: (change: boolean) => void;
  page: number;
  setPage: (page: number) => void;
}

function RecipientsTab({ changeRecipients, page, setPage }: RecipientsTabProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        height: '100%',
        backgroundColor: 'background.default',
      }}
    >
      <TableRecipients changeRecipients={changeRecipients} page={page} setPage={setPage} />
    </Box>
  );
}

export default RecipientsTab;
