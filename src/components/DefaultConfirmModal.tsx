import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { CircularProgress, IconButton, Box } from '@mui/material';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';

interface DefaultConfirmModalProps {
  open: boolean;
  title?: string;
  message?: React.ReactNode;
  confirmText?: string;
  removeConfirm?: boolean;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  cancelColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  loading?: boolean;
  hideCancel?: boolean;
  confirmDisabled?: boolean;
  fullScreen?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

const Transition = React.forwardRef(function Transition(props: TransitionProps & { children: React.ReactElement }, ref: React.Ref<unknown>) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DefaultConfirmModal: React.FC<DefaultConfirmModalProps> = ({
  open,
  title = 'Confirmação',
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  confirmColor = 'primary',
  cancelColor = 'primary',
  loading = false,
  hideCancel = false,
  confirmDisabled = false,
  fullScreen = false,
  maxWidth = 'xs',
  removeConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth={fullScreen ? false : maxWidth}
      fullWidth
      fullScreen={fullScreen}
      TransitionComponent={Transition}
    >
      {hideCancel && onCancel && (
        <IconButton
          aria-label="close"
          onClick={onCancel}
          disabled={loading}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
            zIndex: 1,
          }}
        >
          <CloseIcon />
        </IconButton>
      )}
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>{maxWidth === 'xl' || maxWidth === 'lg' ? message : <DialogContentText>{message}</DialogContentText>}</DialogContent>
      <DialogActions>
        {!hideCancel && (
          <Button onClick={onCancel} color={cancelColor} disabled={loading}>
            {cancelText}
          </Button>
        )}
        {!removeConfirm && (
          <Button onClick={onConfirm} color={confirmColor} variant="contained" disabled={loading || confirmDisabled} autoFocus>
            {loading ? <CircularProgress size={24} /> : confirmText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DefaultConfirmModal;
