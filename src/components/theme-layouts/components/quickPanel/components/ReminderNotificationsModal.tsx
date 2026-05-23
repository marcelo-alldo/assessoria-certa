import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  IconButton,
  ButtonGroup,
  Collapse,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useState } from 'react';
import { Reminder, useUpdateReminderMutation } from '@/store/api/remindersApi';

interface ReminderNotificationModalProps {
  open: boolean;
  reminder: Reminder | null;
  onClose: () => void;
  onReminderSnoozed?: (uid: string) => void;
  refetchReminders?: () => void;
}

const priorityConfig = {
  URGENT: { color: 'error' as const, label: 'Urgente', bgcolor: '#ffebee' },
  HIGH: { color: 'warning' as const, label: 'Alto', bgcolor: '#fff3e0' },
  MEDIUM: { color: 'info' as const, label: 'Médio', bgcolor: '#e3f2fd' },
  LOW: { color: 'default' as const, label: 'Baixo', bgcolor: '#f5f5f5' },
  NONE: { color: 'default' as const, label: 'Normal', bgcolor: '#fafafa' },
};

export default function ReminderNotificationModal({ open, reminder, onClose, onReminderSnoozed, refetchReminders }: ReminderNotificationModalProps) {
  const [updateReminder, { isLoading: isUpdating }] = useUpdateReminderMutation();
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);
  const [snoozeMode, setSnoozeMode] = useState<'quick' | 'datetime'>('quick');
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [customTime, setCustomTime] = useState<Date | null>(null);

  const handleMarkAsDone = async () => {
    if (!reminder) return;

    try {
      await updateReminder({
        uid: reminder.uid,

        visualized: true,
        notified: true,
      }).unwrap();

      await refetchReminders?.();
      resetModal();
      onClose();
    } catch (error) {
      console.error('Erro ao marcar lembrete como feito:', error);
    }
  };

  const resetModal = () => {
    setShowSnoozeOptions(false);
    setSnoozeMode('quick');
    setCustomDate(null);
    setCustomTime(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!reminder) return null;

  const priority = reminder.priority || 'MEDIUM';
  const config = priorityConfig[priority as keyof typeof priorityConfig];

  const handleSnooze = async (minutes: number) => {
    if (!reminder) return;

    try {
      const newDate = new Date();
      newDate.setMinutes(newDate.getMinutes() + minutes);

      await updateReminder({
        uid: reminder.uid,
        dateTime: newDate.toISOString(),
        notified: false,
        visualized: false,
      }).unwrap();

      await refetchReminders?.();
      onReminderSnoozed?.(reminder.uid);
      resetModal();
      onClose();
    } catch (error) {
      console.error('Erro ao adiar lembrete:', error);
    }
  };

  const handleDateTimeSnooze = async () => {
    if (!customDate || !customTime || !reminder) return;

    try {
      const newDate = new Date(customDate);
      newDate.setHours(customTime.getHours());
      newDate.setMinutes(customTime.getMinutes());
      newDate.setSeconds(0);

      if (isNaN(newDate.getTime()) || newDate <= new Date()) {
        alert('Por favor, escolha uma data e hora futura válida.');
        return;
      }

      await updateReminder({
        uid: reminder.uid,
        dateTime: newDate.toISOString(),
        notified: false,
        visualized: false,
      }).unwrap();

      await refetchReminders?.();
      onReminderSnoozed?.(reminder.uid);
      resetModal();
      onClose();
    } catch (error) {
      console.error('Erro ao agendar lembrete:', error);
    }
  };

  const isOverdue = new Date() > new Date(reminder.dateTime);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderTop: 4,
          borderColor:
            config.color === 'error'
              ? 'error.main'
              : config.color === 'warning'
                ? 'warning.main'
                : config.color === 'info'
                  ? 'info.main'
                  : 'grey.300',
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: config.bgcolor,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          pb: 2,
        }}
      >
        <NotificationsActiveIcon
          sx={{
            fontSize: 32,
            color: config.color === 'default' ? 'grey.600' : `${config.color}.main`,
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" component="div">
            Lembrete
            {!isOverdue && new Date(reminder.dateTime).getTime() - Date.now() <= 5 * 60 * 1000 && (
              <Chip label="Em breve" size="small" color="info" sx={{ ml: 1, fontSize: '0.7rem' }} />
            )}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {format(new Date(reminder.dateTime), "dd/MM/yyyy 'às' HH:mm", {
              locale: ptBR,
            })}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Chip label={config.label} color={config.color} size="small" sx={{ mb: 2 }} />
        </Box>

        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          {reminder.title}
        </Typography>

        {reminder.description && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              whiteSpace: 'pre-wrap',
              bgcolor: 'grey.50',
              p: 2,
              borderRadius: 1,
              mb: 3,
            }}
          >
            {reminder.description}
          </Typography>
        )}

        <Collapse in={showSnoozeOptions}>
          <Box
            sx={{
              bgcolor: 'grey.50',
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AccessTimeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight={600}>
                Adiar lembrete
              </Typography>
            </Box>

            <ToggleButtonGroup
              value={snoozeMode}
              exclusive
              onChange={(e, newMode) => newMode && setSnoozeMode(newMode)}
              fullWidth
              sx={{ mb: 2 }}
              size="small"
            >
              <ToggleButton value="quick">Rápido</ToggleButton>
              <ToggleButton value="datetime">Data/Hora</ToggleButton>
            </ToggleButtonGroup>

            {snoozeMode === 'quick' && (
              <ButtonGroup fullWidth variant="outlined">
                <Button onClick={() => handleSnooze(1)}>1 min</Button>
                <Button onClick={() => handleSnooze(5)}>5 min</Button>
                <Button onClick={() => handleSnooze(60)}>1 hora</Button>
              </ButtonGroup>
            )}

            {snoozeMode === 'datetime' && (
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <Box>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                    <DatePicker
                      label="Data"
                      value={customDate}
                      onChange={(newValue) => setCustomDate(newValue)}
                      format="dd/MM/yyyy"
                      minDate={new Date()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                        },
                        popper: {
                          sx: {
                            zIndex: 9999,
                          },
                        },
                      }}
                    />
                    <TimePicker
                      label="Horário"
                      value={customTime}
                      onChange={(newValue) => setCustomTime(newValue)}
                      ampm={false}
                      views={['hours', 'minutes']}
                      timeSteps={{ minutes: 1 }}
                      minTime={customDate && customDate.toDateString() === new Date().toDateString() ? new Date() : undefined}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                        },
                        popper: {
                          sx: {
                            zIndex: 9999,
                          },
                        },
                      }}
                    />
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleDateTimeSnooze}
                    disabled={!customDate || !customTime || isUpdating}
                    startIcon={!isUpdating && <CalendarTodayIcon />}
                    color="secondary"
                  >
                    {isUpdating ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : customDate && customTime ? (
                      `Agendar para ${format(customDate, 'dd/MM', { locale: ptBR })} às ${format(customTime, 'HH:mm', { locale: ptBR })}`
                    ) : (
                      'Agendar para esta data'
                    )}
                  </Button>
                </Box>
              </LocalizationProvider>
            )}
          </Box>
        </Collapse>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button variant="outlined" onClick={() => setShowSnoozeOptions(!showSnoozeOptions)} disabled={isUpdating}>
          {showSnoozeOptions ? 'Cancelar' : 'Adiar'}
        </Button>

        <Box sx={{ flex: 1 }} />

        <Button onClick={handleMarkAsDone} variant="contained" color="primary" disabled={isUpdating || showSnoozeOptions}>
          {isUpdating ? <CircularProgress size={24} color="inherit" /> : 'Entendido'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
