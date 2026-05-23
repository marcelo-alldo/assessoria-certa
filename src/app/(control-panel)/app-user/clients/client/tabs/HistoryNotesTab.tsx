import { Avatar, Box, Chip, Divider, List, ListItem, ListItemAvatar, ListItemText, Paper, Typography } from '@mui/material';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import NoteOutlinedIcon from '@mui/icons-material/NoteOutlined';
import { LeadHistoryNoteType } from '@/store/api/leadsApi';
import { formatDateToBrazilTimezone } from '@/utils/dateUtils';

interface HistoryNotesTabProps {
  historyNotes?: LeadHistoryNoteType[];
}

function getInitials(name?: string): string {
  if (!name) return '?';

  const parts = name.trim().split(' ');
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';

  return (first + last).toUpperCase();
}

function historyNoteTypeLabel(type: string): string {
  const map: Record<string, string> = {
    NOTE: 'Anotação',
    STEP_CHANGE: 'Mudança de Etapa',
    OWNER_CHANGE: 'Mudança de Responsável',
    ARCHIVE: 'Arquivado',
    UNARCHIVE: 'Desarquivado',
    CREATION: 'Criação',
    UPDATE: 'Atualização',
  };

  return map[type] ?? type;
}

function HistoryNotesTab({ historyNotes }: HistoryNotesTabProps) {
  if (!historyNotes || historyNotes.length === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={6} gap={1}>
        <NoteOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
        <Typography variant="body2" color="text.secondary">
          Nenhum histórico ou anotação encontrado.
        </Typography>
      </Box>
    );
  }

  const sorted = [...historyNotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <Paper variant="outlined" sx={{ maxWidth: 720, borderRadius: 2, overflow: 'hidden' }}>
      <List disablePadding>
        {sorted.map((item, index) => {
          const ownerName = item.owner?.profile?.name ?? item.owner?.login ?? 'Sistema';
          const initials = getInitials(ownerName);
          const dateFormatted = formatDateToBrazilTimezone(item.createdAt, 'dd/MM/yyyy HH:mm');

          return (
            <Box key={item.uid}>
              <ListItem alignItems="flex-start" sx={{ py: 2, px: 2.5 }}>
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: item.changeIa ? 'secondary.main' : 'primary.main',
                      width: 40,
                      height: 40,
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {item.changeIa ? <SmartToyOutlinedIcon fontSize="small" /> : initials}
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  disableTypography
                  primary={
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={0.5}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {ownerName}
                      </Typography>

                      <Chip
                        label={historyNoteTypeLabel(item.historyNoteType)}
                        size="small"
                        color="default"
                        variant="outlined"
                        sx={{ height: 20, fontSize: 11 }}
                      />

                      {item.changeIa && (
                        <Chip
                          icon={<SmartToyOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                          label="IA"
                          size="small"
                          color="secondary"
                          sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
                        />
                      )}

                      <Typography variant="caption" color="text.secondary" ml="auto">
                        {dateFormatted}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {item.note}
                    </Typography>
                  }
                />
              </ListItem>

              {index < sorted.length - 1 && <Divider component="li" />}
            </Box>
          );
        })}
      </List>
    </Paper>
  );
}

export default HistoryNotesTab;
