import { styled } from '@mui/material/styles';
import { useEffect, useMemo, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import FusePageSimple from '@fuse/core/FusePageSimple';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { DatesSetArg, EventClickArg, EventInput } from '@fullcalendar/core';
import { format, parseISO } from 'date-fns';
import CalendarHeader from './CalendarHeader';
import { EventType, useGetCalendarEventsQuery } from './CalendarApi';
import { LinearProgress, Box, Typography, Button, IconButton, CircularProgress, Tooltip, Chip, useTheme } from '@mui/material';
import { useGetRemindersQuery, useDeleteReminderMutation, type Reminder as ReminderType } from '@/store/api/remindersApi';
import { useAppDispatch } from '@/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { isPast } from 'date-fns';
import ReminderFormModal from '@/components/theme-layouts/components/quickPanel/components/ReminderFormModal';
import { useUpdateReminderMutation } from '@/store/api/remindersApi';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .container': {
    maxWidth: '100%!important',
  },
  '& a': {
    color: `${theme.palette.text.primary}!important`,
    textDecoration: 'none!important',
  },
  '&  .fc-media-screen': {
    minHeight: '100%',
    width: '100%',
  },
  '& .fc-scrollgrid, & .fc-theme-standard td, & .fc-theme-standard th': {
    borderColor: `${theme.palette.divider}!important`,
  },
  '&  .fc-scrollgrid-section > td': {
    border: 0,
  },
  '& .fc-daygrid-day': {
    '&:last-child': {
      borderRight: 0,
    },
  },
  '& .fc-col-header-cell': {
    borderWidth: '0 1px 0 1px',
    padding: '8px 0 0 0',
    '& .fc-col-header-cell-cushion': {
      color: theme.palette.text.secondary,
      fontWeight: 500,
      fontSize: 12,
      textTransform: 'uppercase',
    },
  },
  '& .fc-view ': {
    '& > .fc-scrollgrid': {
      border: 0,
    },
  },
  '& .fc-daygrid-day.fc-day-today': {
    backgroundColor: 'transparent!important',
    '& .fc-daygrid-day-number': {
      borderRadius: '100%',
      backgroundColor: `${theme.palette.secondary.main}!important`,
      color: `${theme.palette.secondary.contrastText}!important`,
    },
  },
  '& .fc-daygrid-day-top': {
    justifyContent: 'center',
    '& .fc-daygrid-day-number': {
      color: theme.palette.text.secondary,
      fontWeight: 500,
      fontSize: 12,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 26,
      height: 26,
      margin: '4px 0',
      borderRadius: '50%',
      float: 'none',
      lineHeight: 1,
    },
  },
  '& .fc-h-event': {
    border: '0!important',
    background: 'initial',
  },
  '& .fc-event': {
    border: 0,
    padding: '0',
    fontSize: 12,
    margin: '0 6px 4px 6px!important',
    cursor: 'pointer',
  },
}));

const PRIORITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  URGENT: { bg: '#c62828', text: '#fff', label: 'Urgente' },
  HIGH: { bg: '#ef6c00', text: '#fff', label: 'Alto' },
  MEDIUM: { bg: '#1565c0', text: '#fff', label: 'Médio' },
  LOW: { bg: '#2e7d32', text: '#fff', label: 'Baixo' },
  NONE: { bg: '#757575', text: '#fff', label: 'Nenhum' },
};

const convertSchedulesToEvents = (schedules: EventType[]): EventInput[] => {
  return schedules?.map((event) => ({
    id: `google-${event.id}`,
    title: `${event.summary}`,
    start: event.start.dateTime,
    end: event.end.dateTime,
    display: 'block',
    backgroundColor: '#555',
    borderColor: '#fff',
    textColor: '#fff',
    extendedProps: { source: 'google' },
  }));
};

const convertRemindersToEvents = (reminders: ReminderType[]): EventInput[] => {
  return reminders
    .filter((r) => r.dateTime)
    .map((r) => {
      const color = PRIORITY_COLORS[r.priority] ?? PRIORITY_COLORS.NONE;
      return {
        id: `reminder-${r.uid}`,
        title: `${r.title}`,
        start: r.dateTime,
        display: 'block',
        backgroundColor: color.bg,
        borderColor: color.bg,
        textColor: color.text,
        extendedProps: { source: 'reminder', reminderUid: r.uid, completed: r.visualized },
      };
    });
};

function CalendarApp() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [currentDate, setCurrentDate] = useState<DatesSetArg>();
  const [dateRange, setDateRange] = useState<string>('');
  const calendarRef = useRef<FullCalendar>(null);
  const isMobile = useThemeMediaQuery((t) => t.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [events, setEvents] = useState<EventInput[]>([]);

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<ReminderType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // APIs
  const { data, isLoading, isFetching } = useGetCalendarEventsQuery(dateRange);
  const { data: remindersData, refetch: refetchReminders, isLoading: isLoadingReminders } = useGetRemindersQuery({});
  const [updateReminder] = useUpdateReminderMutation();
  const [deleteReminder] = useDeleteReminderMutation();

  const reminders: ReminderType[] = useMemo(() => {
    const raw = (remindersData as { data: unknown } | undefined)?.data;

    if (Array.isArray(raw)) return raw as ReminderType[];

    return ((raw as { reminders?: ReminderType[] } | undefined)?.reminders ?? []) as ReminderType[];
  }, [remindersData]);

  // Build calendar events from both sources
  useEffect(() => {
    const googleEvents = data?.data ? convertSchedulesToEvents(data.data) : [];
    const reminderEvents = reminders.length ? convertRemindersToEvents(reminders) : [];
    setEvents([...googleEvents, ...reminderEvents]);
  }, [data?.data, reminders]);

  useEffect(() => {
    const now = new Date();
    const start = format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd');
    const end = format(new Date(now.getFullYear(), now.getMonth() + 1, 0), 'yyyy-MM-dd');
    setDateRange(`after=${start}&before=${end}`);
  }, []);

  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    setTimeout(() => calendarRef.current?.getApi()?.updateSize(), 300);
  }, [leftSidebarOpen]);

  const handleDates = (rangeInfo: DatesSetArg) => {
    setCurrentDate(rangeInfo);
    const start = format(rangeInfo.start, 'yyyy-MM-dd');
    const end = format(rangeInfo.end, 'yyyy-MM-dd');
    setDateRange(`after=${start}&before=${end}`);
  };

  const handleEventClick = (info: EventClickArg) => {
    const { source, reminderUid } = info.event.extendedProps;

    if (source === 'reminder') {
      const reminder = reminders.find((r) => r.uid === reminderUid);

      if (reminder) handleEditReminder(reminder);
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedReminder(null);
    setOpenModal(true);
  };

  const handleEditReminder = (reminder: ReminderType) => {
    setSelectedReminder(reminder);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedReminder(null);
  };

  const handleDeleteReminder = async (uid: string) => {
    setDeletingId(uid);
    try {
      await deleteReminder(uid).unwrap();
      dispatch(
        showMessage({
          message: 'Lembrete excluído!',
          autoHideDuration: 3000,
          variant: 'success',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        }),
      );
    } catch {
      dispatch(
        showMessage({
          message: 'Erro ao excluir lembrete',
          autoHideDuration: 3000,
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        }),
      );
    } finally {
      setDeletingId(null);
    }
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

  const isDark = theme.palette.mode === 'dark';

  const SidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Sidebar Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
            Lembretes
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {reminders.length} no total
          </Typography>
        </Box>
        <Button variant="contained" color="primary" size="small" startIcon={<AddIcon />} onClick={handleOpenCreateModal} sx={{ borderRadius: 2 }}>
          Novo
        </Button>
      </Box>

      {/* Legend */}
      <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5 }}>
          LEGENDA DO CALENDÁRIO
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: '#555' }} />
            <Typography variant="caption">Google</Typography>
          </Box>
          {Object.entries(PRIORITY_COLORS)
            .filter(([k]) => k !== 'NONE')
            .map(([key, val]) => (
              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: val.bg }} />
                <Typography variant="caption">{val.label}</Typography>
              </Box>
            ))}
        </Box>
      </Box>

      {/* Reminders List */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1.5 }}>
        {isLoadingReminders ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
            <CircularProgress size={28} color="secondary" />
          </Box>
        ) : reminders.length === 0 ? (
          <Box sx={{ textAlign: 'center', pt: 6, color: 'text.secondary' }}>
            <FuseSvgIcon size={40} color="disabled">
              material-outline:notifications_none
            </FuseSvgIcon>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Nenhum lembrete
            </Typography>
          </Box>
        ) : (
          reminders.map((reminder) => {
            const priority = PRIORITY_COLORS[reminder.priority] ?? PRIORITY_COLORS.NONE;
            const overdue = !reminder.visualized && isPast(parseISO(reminder.dateTime));
            const isDeleting = deletingId === reminder.uid;
            return (
              <Box
                key={reminder.uid}
                sx={{
                  mb: 1.5,
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
                        <IconButton size="small" onClick={() => handleToggleComplete(reminder)} color={reminder.visualized ? 'success' : 'default'}>
                          {reminder.visualized ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <RadioButtonUncheckedIcon sx={{ fontSize: 16 }} />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small" color="primary" onClick={() => handleEditReminder(reminder)}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton size="small" color="error" onClick={() => handleDeleteReminder(reminder.uid)} disabled={isDeleting}>
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
                    <Typography
                      variant="caption"
                      color={overdue ? 'error.main' : 'text.secondary'}
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}
                    >
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
          })
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <Root
        header={
          <>
            {(isFetching || isLoading) && <LinearProgress color="secondary" />}
            {!isLoading && <CalendarHeader calendarRef={calendarRef} currentDate={currentDate} />}
          </>
        }
        content={
          !isLoading && (
            <FullCalendar
              locale={ptBrLocale}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={false}
              initialView="dayGridMonth"
              weekends
              datesSet={handleDates}
              events={events}
              eventClick={handleEventClick}
              initialDate={new Date()}
              ref={calendarRef}
            />
          )
        }
        leftSidebarContent={SidebarContent}
        leftSidebarOpen={leftSidebarOpen}
        leftSidebarOnClose={() => setLeftSidebarOpen(false)}
        leftSidebarWidth={300}
        scroll="content"
      />

      {/* Reminder Form Modal */}
      <ReminderFormModal open={openModal} onClose={handleCloseModal} onSuccess={refetchReminders} reminder={selectedReminder} />
    </>
  );
}

export default CalendarApp;
