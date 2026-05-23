import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import clsx from 'clsx';
import Chip from '@mui/material/Chip';
import PricingItemType from '../PricingItemType';
import { useNavigate } from 'react-router';

type SimplePricingCardProps = PricingItemType & {
  className?: string;
  url: string;
  target?: boolean; // If true, the link will open in a new tab
};

/**
 * The simple pricing card component.
 */
function SimplePricingCard(props: SimplePricingCardProps) {
  const navigate = useNavigate();
  const {
    period = '',
    title = '',
    yearlyPrice = '',
    monthlyPrice = '',
    buttonTitle = '',
    isPopular = false,
    details = '',
    className = '',
    url = '',
    target = false,
  } = props;

  function handleClick() {
    navigate(url);
  }

  return (
    <Paper className={clsx('max-w-sm flex-col items-center p-8 text-center sm:px-10 sm:py-12 md:max-w-none lg:rounded-xl', className)}>
      {isPopular && (
        <div className="flex justify-center">
          <Chip label="Mais vendido" color="secondary" className="mb-8 h-8 rounded-full px-8 text-center font-semibold leading-none" />
        </div>
      )}

      <div className="text-4xl font-extrabold leading-[1.25] tracking-tight">{title}</div>

      <div className="mt-7 justify-center whitespace-nowrap">
        {title === 'Customizada' && (
          <div className="flex  justify-center ">
            <Typography variant="caption">a partir de</Typography>
          </div>
        )}
        <div className=" flex items-baseline justify-center whitespace-nowrap">
          <Typography className="text-6xl font-semibold leading-[1.25] tracking-tight">
            {period === 'mês' && monthlyPrice}
            {period === 'ano' && yearlyPrice}
          </Typography>
          <Typography className="ml-2 text-2xl" color="text.secondary">
            / mês
          </Typography>
        </div>
      </div>

      <Typography className="mt-2 flex flex-col" color="text.secondary">
        {period === 'mês' && (
          <>
            <span>pago por mês</span>
            <span>
              <b>{yearlyPrice}</b> pago por ano
            </span>
          </>
        )}
        {period === 'ano' && (
          <>
            <span>pago por mês</span>
            <span>
              <b>{monthlyPrice}</b> pago por ano
            </span>
          </>
        )}
      </Typography>

      {details}

      {target ? (
        <a style={{ textDecoration: 'none', backgroundColor: 'inherit', borderBottom: '0px' }} href={url} target="_blank" rel="noopener noreferrer">
          <Button className="mt-10 w-full" size="large" variant={isPopular ? 'contained' : 'outlined'} color={isPopular ? 'secondary' : 'inherit'}>
            {buttonTitle}
          </Button>
        </a>
      ) : (
        <Button
          onClick={handleClick}
          className="mt-10 w-full"
          size="large"
          variant={isPopular ? 'contained' : 'outlined'}
          color={isPopular ? 'secondary' : 'inherit'}
        >
          {buttonTitle}
        </Button>
      )}
    </Paper>
  );
}

export default SimplePricingCard;
