import { memo } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/system';

/**
 * The FuseSplashScreen component is responsible for rendering a splash screen with a logo and a loading spinner.
 * It uses various MUI components to render the logo and spinner.
 * The component is memoized to prevent unnecessary re-renders.
 */
function FuseSplashScreen() {
  const theme = useTheme();
  return (
    <div id="fuse-splash-screen">
      <div className="logo">
        <img width="200" src="/assets/images/logo/alldo-sem-fundo-robot.png" alt="logo" />
      </div>
      <Box
        id="spinner"
        sx={{
          '& > div': {
            backgroundColor: (theme) => theme.palette.secondary.main,
          },
        }}
      >
        <div className="bounce1" />
        <div className="bounce2" />
        <div className="bounce3" />
      </Box>
    </div>
  );
}

export default memo(FuseSplashScreen);
