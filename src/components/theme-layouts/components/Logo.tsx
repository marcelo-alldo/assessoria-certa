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
      <div className="flex flex-1 items-center">
        <img
          src="/assets/images/logo/assessoria-certa.png"
          alt="Assessoria Certa"
          style={{
            width: 170,
            height: 'auto',
            objectFit: 'contain',
            objectPosition: 'left center',
            filter: 'brightness(0) invert(1)', // torna o logo branco
          }}
        />
        <div className="logo-text flex flex-col flex-auto gap-0.5"></div>
      </div>
    </Root>
  );
}

export default Logo;
