import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, IconButton, useTheme, CircularProgress } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface ImagePreviewModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (caption: string) => void;
  imageFile: File | null;
  loading?: boolean;
}

function ImagePreviewModal({ open, onClose, onSend, imageFile, loading = false }: ImagePreviewModalProps) {
  const theme = useTheme();
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');

  React.useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  const handleSend = () => {
    onSend(caption);
    setCaption('');
  };

  const handleClose = () => {
    setCaption('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <span>Enviar Imagem</span>
        <IconButton onClick={handleClose} size="small">
          <FuseSvgIcon size={20}>material-outline:close</FuseSvgIcon>
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        {imageUrl && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 2,
              borderRadius: 2,
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <img
              src={imageUrl}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '300px',
                objectFit: 'contain',
              }}
            />
          </Box>
        )}

        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Adicione uma legenda (opcional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        {imageFile && (
          <Box sx={{ mt: 1, fontSize: '0.875rem', color: theme.palette.text.secondary }}>
            <strong>Arquivo:</strong> {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={handleClose} variant="outlined" disabled={loading} sx={{ borderRadius: 2 }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSend}
          variant="contained"
          disabled={loading || !imageFile}
          startIcon={loading ? <CircularProgress size={16} /> : <FuseSvgIcon size={16}>material-outline:send</FuseSvgIcon>}
          sx={{ borderRadius: 2, minWidth: 100 }}
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ImagePreviewModal;
