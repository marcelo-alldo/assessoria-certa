import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import { useAppDispatch } from 'src/store/hooks';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import clsx from 'clsx';
import { toggleQuickPanel } from './quickPanelSlice';
import { useGetRemindersQuery } from '@/store/api/remindersApi';
import { useMemo } from 'react';

type QuickPanelToggleButtonProps = {
  className?: string;
  children?: React.ReactNode;
};

/**
 * The quick panel toggle button.
 */
function QuickPanelToggleButton(props: QuickPanelToggleButtonProps) {
  const { className = '', children = <FuseSvgIcon size={20}>heroicons-outline:bell</FuseSvgIcon> } = props;
  const dispatch = useAppDispatch();

  const { data: remindersData } = useGetRemindersQuery({
    limit: 100,
    page: 1,
  });

  const overdueRemindersCount = useMemo(() => {
    if (!remindersData?.data) return 0;

    const reminders = Array.isArray(remindersData.data) ? remindersData.data : remindersData.data?.reminders || [];

    const now = new Date();
    return reminders.filter((reminder: any) => {
      const reminderDate = new Date(reminder.dateTime);
      return reminderDate < now && !reminder.visualized;
    }).length;
  }, [remindersData]);

  return (
    <Badge
      badgeContent={overdueRemindersCount}
      color="error"
      max={99}
      overlap="circular"
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      sx={{
        '& .MuiBadge-badge': {
          minWidth: '16px',
          height: '16px',
          fontSize: '0.65rem',
          padding: '0 4px',
        },
      }}
    >
      <IconButton onClick={() => dispatch(toggleQuickPanel())} className={clsx('border border-divider', className)}>
        {children}
      </IconButton>
    </Badge>
  );
}

export default QuickPanelToggleButton;
