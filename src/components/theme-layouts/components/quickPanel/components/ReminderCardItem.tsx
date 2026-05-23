import { Box, Typography, Chip, IconButton, CircularProgress, Tooltip, useTheme } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { parseISO, format, isPast } from 'date-fns';
import type { Reminder as ReminderType } from '@/store/api/remindersApi';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

const PRIORITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  URGENT: { bg: '#c62828', text: '#fff', label: 'Urgente' },
  HIGH: { bg: '#ef6c00', text: '#fff', label: 'Alto' },
  MEDIUM: { bg: '#1565c0', text: '#fff', label: 'Médio' },
  LOW: { bg: '#2e7d32', text: '#fff', label: 'Baixo' },
  NONE: { bg: '#757575', text: '#fff', label: 'Nenhum' },
};

type Props = {
  reminder: ReminderType;
  onDelete: (uid: string) => void;
  isDeleting: boolean;
  onEdit?: (reminder: ReminderType) => void;
  onToggleComplete?: (reminder: ReminderType) => void;
};

export default function ReminderCardItem({ reminder, onDelete, isDeleting, onEdit, onToggleComplete }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const overdue = !reminder.visualized && isPast(parseISO(reminder.dateTime));
  const priority = PRIORITY_COLORS[reminder.priority] ?? PRIORITY_COLORS.NONE;

  return (
    <Box
      sx={{
        width: '100%',
        mb: 0,
        borderRadius: 2,
        border: `1px solid ${overdue ? theme.palette.error.main : theme.palette.divider}`,
        background: reminder.visualized ? (isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb') : isDark ? 'rgba(255,255,255,0.06)' : '#fff',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: '0 2px 12px rgba(0,0,0,0.1)' },
      }}
    >
      {/* Priority bar */}
      <Box sx={{ height: 3, borderRadius: '8px 8px 0 0', bgcolor: priority.bg }} />

      <Box sx={{ px: 1.5, py: 1.25 }}>
        {/* Title row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Typography
            variant="body2"
            fontWeight={reminder.visualized ? 400 : 600}
            sx={{
              flex: 1,
              textDecoration: reminder.visualized ? 'line-through' : 'none',
              color: reminder.visualized ? 'text.secondary' : 'text.primary',
              lineHeight: 1.4,
            }}
          >
            {reminder.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0, mt: -0.25 }}>
            <Tooltip title={reminder.visualized ? 'Reabrir' : 'Concluir'}>
              <IconButton size="small" onClick={() => onToggleComplete?.(reminder)} color={reminder.visualized ? 'success' : 'default'}>
                {reminder.visualized ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <RadioButtonUncheckedIcon sx={{ fontSize: 16 }} />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar">
              <IconButton size="small" color="primary" onClick={() => onEdit?.(reminder)}>
                <EditIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir">
              <IconButton size="small" color="error" onClick={() => onDelete(reminder.uid ?? '')} disabled={isDeleting}>
                {isDeleting ? <CircularProgress size={14} /> : <DeleteIcon sx={{ fontSize: 16 }} />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Description */}
        {reminder.description && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, lineHeight: 1.4 }}>
            {reminder.description}
          </Typography>
        )}

        {/* Footer */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1, gap: 1 }}>
          <Typography variant="caption" color={overdue ? 'error.main' : 'text.secondary'} sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <FuseSvgIcon size={12}>material-outline:schedule</FuseSvgIcon>
            {format(parseISO(reminder.dateTime), "dd/MM/yyyy 'às' HH:mm")}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {overdue && <Chip label="Atrasado" color="error" size="small" sx={{ height: 18, fontSize: 10, fontWeight: 600 }} />}
            <Chip
              label={priority.label}
              size="small"
              sx={{ height: 18, fontSize: 10, fontWeight: 600, bgcolor: priority.bg, color: priority.text }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
