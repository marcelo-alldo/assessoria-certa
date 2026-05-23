import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FullCalendar from '@fullcalendar/react';
import { DatesSetArg } from '@fullcalendar/core';
import { MutableRefObject } from 'react';
import { useMainTheme } from '@fuse/core/FuseSettings/hooks/fuseThemeHooks';
import CalendarViewMenu from './CalendarViewMenu';

type CalendarHeaderProps = {
  calendarRef: MutableRefObject<FullCalendar | null>;
  currentDate: DatesSetArg;
};

/**
 * The calendar header.
 */
function CalendarHeader(props: CalendarHeaderProps) {
  const { calendarRef, currentDate } = props;

  const mainTheme = useMainTheme();
  const calendarApi = () => calendarRef.current.getApi();

  function handleViewChange(viewType: string) {
    calendarApi().changeView(viewType);
  }

  return (
    <div className="flex w-full p-3 justify-between z-10 container">
      <div className="flex items-center justify-between space-x-2">
        <div className="flex items-center space-x-2">
          <Typography className="hidden sm:flex text-2xl font-semibold tracking-tight whitespace-nowrap">{currentDate?.view.title}</Typography>
        </div>

        <div className="flex items-center space-x-2">
          <Tooltip title="Voltar">
            <IconButton aria-label="Voltar" onClick={() => calendarApi().prev()} className="border border-divider" size="small">
              <FuseSvgIcon size={16}>{mainTheme.direction === 'ltr' ? 'heroicons-solid:chevron-left' : 'heroicons-solid:chevron-right'}</FuseSvgIcon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Próximo">
            <IconButton aria-label="Próximo" onClick={() => calendarApi().next()} className="border border-divider" size="small">
              <FuseSvgIcon size={16}>{mainTheme.direction === 'ltr' ? 'heroicons-solid:chevron-right' : 'heroicons-solid:chevron-left'}</FuseSvgIcon>
            </IconButton>
          </Tooltip>

          <Tooltip title="Hoje">
            <div>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
                <IconButton aria-label="Hoje" onClick={() => calendarApi().today()} className="border border-divider" size="small">
                  <FuseSvgIcon size={16}>heroicons-outline:calendar</FuseSvgIcon>
                </IconButton>
              </motion.div>
            </div>
          </Tooltip>
        </div>
      </div>

      <motion.div
        className="flex items-center justify-end md:justify-center space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.3 } }}
      >
        {/* <IconButton
          className="border border-divider"
          size="small"
          aria-label="add"
          onClick={(ev) =>
            dispatch(
              openNewEventDialog({
                jsEvent: ev.nativeEvent,
                start: new Date(),
                end: new Date(),
              }),
            )
          }
        >
          <FuseSvgIcon>heroicons-outline:plus-circle</FuseSvgIcon>
        </IconButton> */}

        <CalendarViewMenu currentDate={currentDate} onChange={handleViewChange} />
      </motion.div>
    </div>
  );
}

export default CalendarHeader;
