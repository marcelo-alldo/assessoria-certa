import React, { useState, useEffect } from 'react';
import { useTheme, Dialog, DialogContent, DialogActions, Button, Typography, Box, IconButton } from '@mui/material';
import { Close as CloseIcon, Description as DocumentIcon, PictureAsPdf as PdfIcon, InsertDriveFile as FileIcon } from '@mui/icons-material';

interface DocumentPreviewModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (file: File, caption?: string) => void;
  file: File | null;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ open, onClose, onSend, file }) => {
  const theme = useTheme();
  const [caption, setCaption] = useState('');

  useEffect(() => {
    // Cleanup function para revogar URLs quando o componente for desmontado ou arquivo mudar
    return () => {
      // Limpeza não é mais necessária pois não criamos URLs
    };
  }, [file]);

  const handleSend = () => {
    if (file) {
      onSend(file, caption.trim() || undefined);
      setCaption('');
      onClose();
    }
  };

  const handleClose = () => {
    setCaption('');
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    if (!file) return <FileIcon sx={{ fontSize: 'inherit' }} />;

    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (fileType.startsWith('image/')) {
      return <DocumentIcon sx={{ color: '#4CAF50', fontSize: 'inherit' }} />;
    } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return <PdfIcon sx={{ color: '#F44336', fontSize: 'inherit' }} />;
    } else if (fileType.startsWith('text/')) {
      return <DocumentIcon sx={{ color: '#2196F3', fontSize: 'inherit' }} />;
    } else {
      return <FileIcon sx={{ color: '#9E9E9E', fontSize: 'inherit' }} />;
    }
  };

  const renderDocumentInfo = () => {
    if (!file) return null;

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          px: 2,
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          borderRadius: 2,
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }}
      >
        <Box sx={{ fontSize: '4rem', mb: 2 }}>{getFileIcon()}</Box>
        <Typography variant="h6" sx={{ fontWeight: 500, textAlign: 'center', mb: 1 }}>
          {file.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          {formatFileSize(file.size)} • {file.type || 'Tipo desconhecido'}
        </Typography>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff',
          backgroundImage: 'none',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pb: 0 }}>
        <Typography variant="h6">Preview do Documento</Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 2 }}>
        {renderDocumentInfo()}

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Legenda (opcional):
          </Typography>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Adicione uma legenda ao documento..."
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '12px',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
              borderRadius: '8px',
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              color: theme.palette.text.primary,
              fontFamily: 'inherit',
              fontSize: '14px',
              resize: 'vertical',
              outline: 'none',
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={handleClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSend}
          variant="contained"
          disabled={!file}
          sx={{
            backgroundColor: theme.palette.mode === 'dark' ? '#4CAF50' : '#25D366',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? '#45a049' : '#128C7E',
            },
          }}
        >
          Enviar Documento
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentPreviewModal;
