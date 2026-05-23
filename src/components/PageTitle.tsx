import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { IconButton } from '@mui/material';
import { useNavigate } from 'react-router';

export type PageTitleProps = {
  title: string;
  backUrl?: string;
  backNavigation?: boolean;
};

function PageTitle(props: PageTitleProps) {
  const { title, backUrl, backNavigation } = props;
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <div className="flex items-center min-w-0 gap-3">
        {backNavigation && (
          <IconButton onClick={() => (backUrl ? navigate(backUrl) : navigate(-1))} size="large">
            <FuseSvgIcon className="w-8 h-8" color="primary">
              heroicons-outline:arrow-long-left
            </FuseSvgIcon>
          </IconButton>
        )}
        <div className="flex items-center justify-center space-x-3">
          <Typography className="text-xl sm:text-4xl font-extrabold leading-none tracking-tight" color="inherit">
            {title}
          </Typography>
        </div>
      </div>
    </div>
  );
}

export default PageTitle;
