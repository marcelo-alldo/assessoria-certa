import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { memo } from 'react';
import FuseLoading from '@fuse/core/FuseLoading';
import { Chip } from '@mui/material';

/**
 * The CustomWidget widget.
 */

interface CustomWidgetProps {
  count: number;
  header: string;
  title: string;
  subtitle: string;
  isLoading: boolean;
  color?: string;
  tagName?: string;
  colorTag?: string;
}

function CustomWidget({ header, title, subtitle, count, isLoading, color = '#f44336', tagName, colorTag }: CustomWidgetProps) {
  if (isLoading) {
    return <FuseLoading />;
  }

  return (
    <Paper className="flex flex-col flex-auto shadow-sm rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-2 pt-2">
        <Typography className="px-3 text-lg font-medium tracking-tight leading-6 truncate" color="text.secondary">
          {header}
        </Typography>
        <Chip
          label={tagName}
          size="small"
          sx={{
            backgroundColor: colorTag,
            color: '#fff',
            fontWeight: 500,
            '& .MuiChip-deleteIcon': {
              color: 'rgba(255,255,255,0.9)',
            },
          }}
        />
        {/* <IconButton aria-label="more">
          <FuseSvgIcon>heroicons-outline:ellipsis-vertical</FuseSvgIcon>
        </IconButton> */}
      </div>
      <div className="text-center mt-12">
        <Typography className="text-7xl sm:text-8xl font-bold tracking-tight leading-none" style={{ color }}>
          {String(count)}
        </Typography>
        <Typography className="text-lg font-medium" style={{ color }}>
          {title}
        </Typography>
      </div>
      <Typography className="flex items-baseline justify-center w-full mt-5 mb-6 space-x-2" color="text.secondary">
        <span className="truncate">{subtitle}</span>
        {/* <b>{String(data.extra.count)}</b> */}
      </Typography>
    </Paper>
  );
}

export default memo(CustomWidget);
