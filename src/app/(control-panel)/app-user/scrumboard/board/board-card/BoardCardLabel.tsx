import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';

type BoardCardLabelProps = {
  card: any;
};

/**
 * The board card label component.
 */
function BoardCardLabel(props: BoardCardLabelProps) {
  const { card } = props;

  if (!card) {
    return null;
  }

  return (
    <Tooltip title={card.name} key={card.uid}>
      <Chip className="font-semibold text-md mx-1 mb-1.5" label={card.name || card.clientProfile.name} size="small" />
    </Tooltip>
  );
}

export default BoardCardLabel;
