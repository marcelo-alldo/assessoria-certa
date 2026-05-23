import { useTimeout } from '@fuse/hooks';
import { useState } from 'react';
import clsx from 'clsx';
import Box from '@mui/material/Box';
import themesConfig from '@/configs/themesConfig';

export type FuseLoadingProps = {
  delay?: number;
  className?: string;
};

/**
 * FuseLoading displays a loading state with an optional delay
 */
function FuseLoading(props: FuseLoadingProps) {
  const { delay = 0, className } = props;
  const [showLoading, setShowLoading] = useState(!delay);
  const theme = themesConfig[import.meta.env.VITE_APP_THEME_DEFAULT];

  if (!theme) {
    return null;
  }

  useTimeout(() => {
    setShowLoading(true);
  }, delay);

  return (
    <Box sx={{ backgroundColor: theme.palette.secondary.main }} className="flex flex-1">
      <div
        className={clsx(
          className,
          'flex flex-1 min-h-full h-full w-full self-center flex-col items-center justify-center p-6',
          !showLoading ? 'hidden' : '',
        )}
      >
        <img width="200" src="assets/images/logo/alldo-sem-fundo-robot.png" alt="logo" />
        <Box
          id="spinner"
          sx={{
            '& > div': {
              backgroundColor: theme.palette.primary.main,
            },
          }}
        >
          <div className="bounce1" />
          <div className="bounce2" />
          <div className="bounce3" />
        </Box>
      </div>
    </Box>
  );
}

export default FuseLoading;
