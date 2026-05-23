import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

/**
 * The chat first screen.
 */
function ChatsFirstScreen() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center w-full p-6">
      <FuseSvgIcon className="icon-size-32 mb-4" color="disabled">
        heroicons-outline:chat-bubble-left-right
      </FuseSvgIcon>
      <Typography className="hidden lg:flex text-xl font-medium tracking-tight text-secondary" color="text.secondary">
        Selecione uma conversa para começar
      </Typography>
    </div>
  );
}

export default ChatsFirstScreen;
