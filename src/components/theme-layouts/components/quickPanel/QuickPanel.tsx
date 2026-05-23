import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { styled } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import ListSubheader from '@mui/material/ListSubheader';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Box, List, ListItem, CircularProgress, Paper } from '@mui/material';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { selectQuickPanelOpen, toggleQuickPanel } from './quickPanelSlice';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useDeleteReminderMutation, useGetRemindersQuery, useUpdateReminderMutation } from '@/store/api/remindersApi';
import type { Reminder as ReminderType } from '@/store/api/remindersApi';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import ReminderCardItem from './components/ReminderCardItem';
import ReminderFormModal from './components/ReminderFormModal';

const StyledSwipeableDrawer = styled(SwipeableDrawer)(() => ({
  '& .MuiDrawer-paper': {
    width: 320,
  },
}));

function QuickPanel() {
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectQuickPanelOpen);
  const [deleteReminder] = useDeleteReminderMutation();
  const [updateReminder] = useUpdateReminderMutation();
  const { data: remindersData, refetch: refetchReminders, isLoading: isLoadingReminders } = useGetRemindersQuery({});

  const [openModal, setOpenModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<ReminderType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reminders = Array.isArray(remindersData?.data)
    ? (remindersData?.data as unknown as ReminderType[])
    : ((remindersData?.data as { reminders?: ReminderType[] })?.reminders ?? []);

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedReminder(null);
  };

  const handleEditReminder = (reminder: ReminderType) => {
    setSelectedReminder(reminder);
    setOpenModal(true);
  };

  const handleToggleComplete = async (reminder: ReminderType) => {
    try {
      await updateReminder({ uid: reminder.uid, visualized: !reminder.visualized }).unwrap();
      refetchReminders();
    } catch {
      dispatch(
        showMessage({
          message: 'Erro ao atualizar lembrete',
          autoHideDuration: 3000,
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        }),
      );
    }
  };

  const handleDeleteReminder = async (uid: string) => {
    setDeletingId(uid);
    try {
      await deleteReminder(uid).unwrap();
      dispatch(
        showMessage({
          message: 'Lembrete deletado com sucesso!',
          autoHideDuration: 3000,
          variant: 'success',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        }),
      );
    } catch (error: unknown) {
      const typedError = error as { data?: { msg?: string } };
      dispatch(
        showMessage({
          message: typedError?.data?.msg || 'Erro ao deletar lembrete',
          autoHideDuration: 3000,
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        }),
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <StyledSwipeableDrawer open={open} anchor="right" onOpen={() => {}} onClose={() => dispatch(toggleQuickPanel())} disableSwipeToOpen>
      <FuseScrollbars>
        <ListSubheader component="div">Hoje</ListSubheader>

        <div className="mb-0 px-6 py-4">
          <Typography className="mb-3 text-5xl" color="text.secondary">
            {format(new Date(), 'eeee', { locale: ptBR })}
          </Typography>
          <div className="flex">
            <Typography className="text-5xl leading-none mr-2" color="text.secondary">
              {format(new Date(), 'dd')}
            </Typography>

            <Typography className="text-5xl leading-none" color="text.secondary">
              {format(new Date(), 'MMMM', { locale: ptBR })}
            </Typography>
          </div>
        </div>
        <Divider />

        <Box sx={{ p: 2, position: 'relative' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2">
              Lembretes ({reminders.length})
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => {
                setSelectedReminder(null);
                setOpenModal(true);
              }}
            >
              Adicionar
            </Button>
          </Box>

          {isLoadingReminders ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 200,
              }}
            >
              <CircularProgress />
            </Box>
          ) : reminders.length === 0 ? (
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 2,
                backgroundColor: 'grey.50',
              }}
            >
              <Typography color="text.secondary">Nenhum lembrete encontrado</Typography>
              <Button
                variant="outlined"
                color="primary"
                sx={{ mt: 1 }}
                onClick={() => {
                  setSelectedReminder(null);
                  setOpenModal(true);
                }}
              >
                Criar primeiro lembrete
              </Button>
            </Paper>
          ) : (
            <List sx={{ py: 0 }}>
              {reminders.map((reminder) => (
                <ListItem key={reminder.uid} sx={{ px: 0, py: 0.5, position: 'relative' }}>
                  <ReminderCardItem
                    reminder={reminder}
                    onDelete={handleDeleteReminder}
                    isDeleting={deletingId === reminder.uid}
                    onEdit={handleEditReminder}
                    onToggleComplete={handleToggleComplete}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </FuseScrollbars>

      <ReminderFormModal open={openModal} onClose={handleCloseModal} onSuccess={refetchReminders} reminder={selectedReminder} />
    </StyledSwipeableDrawer>
  );
}

export default QuickPanel;
