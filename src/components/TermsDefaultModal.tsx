import { Dialog, DialogTitle, DialogContent, IconButton, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TransitionProps } from '@mui/material/transitions';
import { forwardRef } from 'react';
import { TermsDefault } from './TermsDefault';

const Transition = forwardRef<unknown, TransitionProps & { children: React.ReactElement }>((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'SlideUpTransition';

interface TermsDefaultModalProps {
  setOpen: (open: boolean) => void;
  open: boolean;
}

export function TermsDefaultModal({ setOpen, open }: TermsDefaultModalProps) {
  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullScreen TransitionComponent={Transition}>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Termos e Condições
        <IconButton
          aria-label="close"
          onClick={() => setOpen(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <TermsDefault />
      </DialogContent>
    </Dialog>
  );
}
