import { useEffect, useRef, useState, useCallback } from 'react';
import { useGetRemindersQuery } from '@/store/api/remindersApi';
import type { Reminder } from '@/store/api/remindersApi';

// Cache para controlar lembretes já mostrados (persiste durante a sessão)
const sessionShownReminders = new Set<string>();

export const useReminderNotifications = (enabled = true) => {
  const { data: remindersData, refetch: refetchReminders } = useGetRemindersQuery(
    {
      limit: 100,
      page: 1,
      filterToday: true,
    },
    {
      skip: !enabled,
      refetchOnMountOrArgChange: true,
      pollingInterval: enabled ? 30000 : 0, // Polling a cada 30 segundos
    },
  );

  const [pendingReminder, setPendingReminder] = useState<Reminder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const remindersRef = useRef<Reminder[]>([]);
  const lastNotificationTimeRef = useRef<{ [key: string]: number }>({});

  // Atualiza a referência dos lembretes
  useEffect(() => {
    if (remindersData?.data) {
      const reminders = Array.isArray(remindersData.data) ? remindersData.data : remindersData.data?.reminders || [];

      remindersRef.current = reminders;
    }
  }, [remindersData]);

  const checkReminders = useCallback(() => {
    const reminders = remindersRef.current;
    if (reminders.length === 0 || isModalOpen) return;

    const now = Date.now();
    const currentReminders: Reminder[] = [];

    for (const reminder of reminders) {
      const reminderTime = new Date(reminder.dateTime).getTime();

      // Se já foi notificado completamente, ignorar
      if (reminder.notified === true) continue;

      const fiveMinutesBefore = reminderTime - 5 * 60 * 1000;
      const isWithinFiveMinutesBefore = now >= fiveMinutesBefore && now < reminderTime;
      const isAtOrAfterReminderTime = now >= reminderTime;

      // Critérios para mostrar notificação:
      // 1. Está dentro da janela de 5 minutos antes E ainda não foi mostrado
      // 2. Já passou do horário E ainda não foi notificado
      const shouldNotify = (isWithinFiveMinutesBefore && !sessionShownReminders.has(reminder.uid)) || (isAtOrAfterReminderTime && !reminder.notified);

      if (shouldNotify) {
        // Para lembretes que já passaram do horário, verificar intervalo de 1 minuto
        if (isAtOrAfterReminderTime) {
          const lastNotification = lastNotificationTimeRef.current[reminder.uid] || 0;
          const oneMinute = 60 * 1000;

          // Só mostrar se passou pelo menos 1 minuto da última notificação
          if (now - lastNotification < oneMinute) {
            continue;
          }
        }

        currentReminders.push(reminder);
      }
    }

    // Ordenar por prioridade: primeiro os que já passaram do horário, depois os que estão próximos
    currentReminders.sort((a, b) => {
      const aTime = new Date(a.dateTime).getTime();
      const bTime = new Date(b.dateTime).getTime();
      const aIsOverdue = now >= aTime;
      const bIsOverdue = now >= bTime;

      if (aIsOverdue && !bIsOverdue) return -1;
      if (!aIsOverdue && bIsOverdue) return 1;
      return aTime - bTime;
    });

    if (currentReminders.length > 0) {
      const nextReminder = currentReminders[0];
      setPendingReminder(nextReminder);
      setIsModalOpen(true);

      // Marcar como mostrado na sessão (para lembretes futuros)
      if (now < new Date(nextReminder.dateTime).getTime()) {
        sessionShownReminders.add(nextReminder.uid);
      }

      // Registrar hora da última notificação para este lembrete
      lastNotificationTimeRef.current[nextReminder.uid] = now;
    }
  }, [isModalOpen]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setPendingReminder(null);

    // Recarregar os lembretes após fechar o modal
    setTimeout(() => {
      refetchReminders();
    }, 500);
  }, [refetchReminders]);

  const handleReminderSnoozed = useCallback(
    (uid: string) => {
      // Aqui você pode implementar a lógica de "soneca" se necessário
      closeModal();
    },
    [closeModal],
  );

  // Polling para verificar lembretes
  useEffect(() => {
    if (!enabled) return;

    checkReminders();

    const checkInterval = setInterval(() => {
      checkReminders();
    }, 5000); // Verificar a cada 5 segundos

    return () => clearInterval(checkInterval);
  }, [enabled, checkReminders]);

  // Recarregar quando a página ficar visível
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetchReminders();
        // Pequeno delay para garantir que os dados foram carregados
        setTimeout(checkReminders, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, checkReminders, refetchReminders]);

  // Verificar sempre que os dados dos lembretes mudarem
  useEffect(() => {
    if (!enabled || !remindersData) return;
    checkReminders();
  }, [remindersData, enabled, checkReminders]);

  return {
    isModalOpen,
    pendingReminder,
    closeModal,
    handleReminderSnoozed,
    refetchReminders,
  };
};
