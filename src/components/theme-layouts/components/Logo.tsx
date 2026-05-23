import { useAppSelector } from '@/store/hooks';
import { styled } from '@mui/material/styles';

const Root = styled('div')(({ theme }) => ({
  '& > .logo-icon': {
    transition: theme.transitions.create(['width', 'height'], {
      duration: theme.transitions.duration.shortest,
      easing: theme.transitions.easing.easeInOut,
    }),
  },
  '& > .badge': {
    transition: theme.transitions.create('opacity', {
      duration: theme.transitions.duration.shortest,
      easing: theme.transitions.easing.easeInOut,
    }),
  },
}));

/**
 * The logo component.
 */
function Logo() {
  const navbar = useAppSelector((state) => state.navbar);

  return (
    <Root className="flex flex-1 items-center space-x-3">
      <div className="flex flex-1 items-center ">
        <div
          className="flex items-center"
          style={{
            width: navbar.foldedOpen ? 170 : 55,
            height: 60,
            backgroundImage: navbar.foldedOpen ? `url(${import.meta.env.VITE_APP_LOGO_MENU})` : `url(${import.meta.env.VITE_APP_LOGO_MENU_ICONE})`,
            backgroundSize: 'cover', // ou 'cover'
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
          }}
        ></div>
        <div className="logo-text flex flex-col flex-auto gap-0.5"></div>
      </div>
    </Root>
  );
}

export default Logo;
