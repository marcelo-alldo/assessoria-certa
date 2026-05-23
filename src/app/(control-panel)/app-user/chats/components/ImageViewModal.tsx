import React from 'react';
import { Dialog, DialogContent, IconButton, useTheme, Box, Fade, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface ImageViewModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string | null;
  alt?: string;
  caption?: string;
}

function parseWhatsappFormatting(text: string | null | undefined) {
  if (!text) return '';

  return text
    .replace(/```(.+?)```/gs, '<pre>$1</pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*([^*]+)\*/g, '<b>$1</b>')
    .replace(/_([^_]+)_/g, '<i>$1</i>')
    .replace(/~([^~]+)~/g, '<s>$1</s>');
}

function ImageViewModal({ open, onClose, imageUrl, alt = 'Imagem', caption }: ImageViewModalProps) {
  const theme = useTheme();

  if (!imageUrl) return null;

  const isDark = theme.palette.mode === 'dark';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: isDark ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'none',
          borderRadius: 0,
          margin: 0,
          maxWidth: '100vw',
          maxHeight: '100vh',
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
        },
      }}
      TransitionComponent={Fade}
      transitionDuration={300}
      BackdropProps={{
        sx: {
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
        },
      }}
    >
      {/* Header simples com botão de fechar */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            color: isDark ? 'white' : 'black',
            width: '40px',
            height: '40px',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              transform: 'scale(1.05)',
            },
          }}
        >
          <FuseSvgIcon size={20}>material-outline:close</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
        }}
        onClick={onClose}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            p: { xs: 2, sm: 4 },
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: caption ? '70vh' : '85vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: caption ? 2 : 0,
            }}
          >
            <img
              src={imageUrl}
              alt={alt}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: isDark
                  ? '0 20px 40px rgba(0, 0, 0, 0.6), 0 8px 16px rgba(0, 0, 0, 0.4)'
                  : '0 20px 40px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.1)',
                cursor: 'default',
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </Box>

          {/* Caption embaixo da imagem */}
          {caption && (
            <Box
              sx={{
                maxWidth: '90vw',
                maxHeight: '20vh',
                overflow: 'auto',
                backgroundColor: isDark ? 'rgba(42, 42, 42, 0.9)' : 'rgba(248, 248, 248, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '16px 20px',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.4)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Typography
                sx={{
                  color: isDark ? '#ffffff' : '#333333',
                  fontSize: '14px',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                  '& pre': {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    margin: '4px 0',
                  },
                  '& code': {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                  },
                }}
                dangerouslySetInnerHTML={{
                  __html: parseWhatsappFormatting(caption),
                }}
              />
            </Box>
          )}
        </Box>

        {/* Indicador de toque/clique no mobile */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
            fontSize: '12px',
            fontWeight: 500,
            display: { xs: 'block', sm: 'none' },
            textAlign: 'center',
            background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(10px)',
            padding: '6px 12px',
            borderRadius: '16px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
          }}
        >
          Toque para fechar
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default ImageViewModal;
