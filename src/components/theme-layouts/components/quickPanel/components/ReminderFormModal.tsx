import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Paper,
  Button,
  CircularProgress,
  Backdrop,
  Switch,
  FormControlLabel,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { useCreateReminderMutation, useUpdateReminderMutation } from '@/store/api/remindersApi';
import type { Reminder as ReminderType } from '@/store/api/remindersApi';
import { useAppDispatch } from 'src/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';

const schema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  description: z.string().optional(),
  date: z.date(),
  time: z.date(),
  priority: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  visualized: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface ReminderFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** Passe um reminder para modo edição; null ou undefined = criação */
  reminder?: ReminderType | null;
}

function ReminderFormModal({ open, onClose, onSuccess, reminder }: ReminderFormModalProps) {
  const dispatch = useAppDispatch();
  const [createReminder, { isLoading: isCreating }] = useCreateReminderMutation();
  const [updateReminder, { isLoading: isUpdating }] = useUpdateReminderMutation();

  const isEditing = !!reminder;
  const isBusy = isCreating || isUpdating;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, dirtyFields, isValid },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      date: new Date(),
      time: new Date(),
      priority: 'MEDIUM',
      visualized: false,
    },
    mode: 'onChange',
  });

  // Preenche o formulário ao abrir em modo edição
  useEffect(() => {
    if (open && reminder) {
      const dt = new Date(reminder.dateTime);
      reset({
        title: reminder.title,
        description: reminder.description || '',
        date: dt,
        time: dt,
        priority: (reminder.priority as FormData['priority']) || 'MEDIUM',
        visualized: reminder.visualized ?? false,
      });
    } else if (open && !reminder) {
      reset({
        title: '',
        description: '',
        date: new Date(),
        time: new Date(),
        priority: 'MEDIUM',
        visualized: false,
      });
    }
  }, [open, reminder, reset]);

  const handleClose = () => {
    if (isBusy) return;

    reset();
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    const combinedDateTime = new Date(
      data.date.getFullYear(),
      data.date.getMonth(),
      data.date.getDate(),
      data.time.getHours(),
      data.time.getMinutes(),
      data.time.getSeconds(),
    );
    const isoDateTime = combinedDateTime.toISOString();

    try {
      if (isEditing && reminder) {
        await updateReminder({
          uid: (reminder.uid ?? (reminder as any).id) as string,
          title: data.title,
          description: data.description,
          dateTime: isoDateTime,
          priority: data.priority,
          visualized: data.visualized,
          notified: false,
        }).unwrap();

        dispatch(
          showMessage({
            message: 'Lembrete atualizado com sucesso!',
            autoHideDuration: 3000,
            variant: 'success',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          }),
        );
      } else {
        await createReminder({
          title: data.title,
          description: data.description,
          dateTime: isoDateTime,
          priority: data.priority,
          visualized: data.visualized,
        }).unwrap();

        dispatch(
          showMessage({
            message: 'Lembrete criado com sucesso!',
            autoHideDuration: 3000,
            variant: 'success',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          }),
        );
      }

      onSuccess?.();
      handleClose();
    } catch (error: unknown) {
      const typedError = error as { data?: { msg?: string } };
      dispatch(
        showMessage({
          message: typedError?.data?.msg || (isEditing ? 'Erro ao atualizar lembrete' : 'Erro ao criar lembrete'),
          autoHideDuration: 3000,
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        }),
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 1,
          boxShadow: 8,
          position: 'relative',
          zIndex: 1300,
        },
      }}
    >
      <Backdrop
        sx={{
          position: 'absolute',
          zIndex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderRadius: 4,
        }}
        open={isBusy}
      >
        <CircularProgress />
      </Backdrop>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 4 }}>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', pb: 1 }}>{isEditing ? 'Editar lembrete' : 'Adicionar lembrete'}</DialogTitle>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ pt: 1 }}>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Título"
                fullWidth
                required
                {...register('title')}
                error={!!errors.title}
                helperText={errors.title?.message}
                disabled={isBusy}
              />

              <TextField
                label="Descrição"
                fullWidth
                multiline
                minRows={3}
                {...register('description')}
                error={!!errors.description}
                helperText={errors.description?.message}
                disabled={isBusy}
              />

              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR} dateFormats={{ monthAndYear: 'LLLL yyyy', year: 'yyyy' }}>
                <Box display="flex" gap={2}>
                  <Controller
                    name="date"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Data"
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        format="dd/MM/yyyy"
                        disabled={isBusy}
                        slotProps={{
                          popper: { sx: { zIndex: 9999 } },
                          dialog: { sx: { '& .MuiDialog-paper': { zIndex: 9999 } } },
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="time"
                    control={control}
                    render={({ field }) => (
                      <TimePicker
                        label="Hora"
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        ampm={false}
                        views={['hours', 'minutes']}
                        timeSteps={{ minutes: 1 }}
                        disabled={isBusy}
                        slotProps={{
                          popper: { sx: { zIndex: 9999 } },
                          dialog: { sx: { '& .MuiDialog-paper': { zIndex: 9999 } } },
                        }}
                      />
                    )}
                  />
                </Box>
              </LocalizationProvider>

              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth disabled={isBusy}>
                    <InputLabel id="priority-label">Prioridade</InputLabel>
                    <Select labelId="priority-label" label="Prioridade" {...field} value={field.value}>
                      <MenuItem value="NONE">Nenhum</MenuItem>
                      <MenuItem value="LOW">Baixo</MenuItem>
                      <MenuItem value="MEDIUM">Médio</MenuItem>
                      <MenuItem value="HIGH">Alto</MenuItem>
                      <MenuItem value="URGENT">Urgente</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
              <Controller
                name="visualized"
                control={control}
                render={({ field }) => (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: field.value ? 'success.main' : 'divider',
                      bgcolor: field.value ? 'success.50' : 'transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Finalizado
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {field.value ? 'Lembrete marcado como concluído' : 'Lembrete pendente'}
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} color="success" disabled={isBusy} />}
                      label=""
                      sx={{ m: 0 }}
                    />
                  </Box>
                )}
              />
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose} disabled={isBusy}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={!isValid || Object.keys(dirtyFields).length === 0 || isBusy}
              startIcon={isBusy ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isEditing ? (isUpdating ? 'Atualizando...' : 'Atualizar') : isCreating ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogActions>
        </form>
      </Paper>
    </Dialog>
  );
}

export default ReminderFormModal;
