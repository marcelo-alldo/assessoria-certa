import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, IconButton, CircularProgress } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useDownloadAndSaveMediaMutation } from '@/store/api/whatsappApi';
import { useEffect, useState } from 'react';

interface FilePreviewModalProps {
  open: boolean;
  onClose: () => void;
  file: {
    name: string;
    type: string;
    mimeType: string;
    size?: number;
    url?: string;
    mediaId?: string;
    uploadStatus?: string;
    error?: string;
  } | null;
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';

  if (bytes < 1024) return bytes + ' B';

  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';

  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const getFileIcon = (type: string, mimeType: string) => {
  if (type === 'image') return 'heroicons-outline:photo';

  if (type === 'video') return 'heroicons-outline:video-camera';

  if (type === 'document') return 'heroicons-outline:document-text';

  if (mimeType.includes('pdf')) return 'heroicons-outline:document-text';

  if (mimeType.includes('image')) return 'heroicons-outline:photo';

  if (mimeType.includes('video')) return 'heroicons-outline:video-camera';

  return 'heroicons-outline:paper-clip';
};

const getMimeTypeLabel = (mimeType: string) => {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'JPEG Image',
    'image/jpg': 'JPG Image',
    'image/png': 'PNG Image',
    'image/gif': 'GIF Image',
    'image/webp': 'WebP Image',
    'video/mp4': 'MP4 Video',
    'video/webm': 'WebM Video',
    'video/ogg': 'OGG Video',
    'video/quicktime': 'QuickTime Video',
    'application/pdf': 'PDF Document',
    'application/msword': 'Word Document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document (DOCX)',
  };

  return mimeMap[mimeType] || mimeType;
};

const getStatusInfo = (status?: string) => {
  switch (status) {
    case 'success':
      return { label: 'Enviado para WhatsApp', color: '#4caf50' };
    case 'error':
      return { label: 'Erro no envio', color: '#f44336' };
    case 'pending':
      return { label: 'Aguardando envio', color: '#ff9800' };
    default:
      return { label: 'Status desconhecido', color: '#9e9e9e' };
  }
};

function FilePreviewModal({ open, onClose, file }: FilePreviewModalProps) {
  if (!file) return null;

  const isImage = file.type === 'image';
  const isVideo = file.type === 'video';
  const isDocument = file.type === 'document' || (!isImage && !isVideo);
  const statusInfo = getStatusInfo(file.uploadStatus);

  const [previewUrl, setPreviewUrl] = useState<string | null>(file.url || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadAndSaveMedia] = useDownloadAndSaveMediaMutation();

  useEffect(() => {
    let revokedUrl: string | null = null;
    const loadMedia = async () => {
      if (!open) return;

      setError(null);

      // Se já temos URL direta, não precisa carregar
      if (file?.url) {
        setPreviewUrl(file.url);
        return;
      }

      // Se tiver mediaId, usa a mesma rota do Chat para baixar
      if (file?.mediaId) {
        try {
          setLoading(true);
          const resp = await downloadAndSaveMedia({ mediaId: file.mediaId }).unwrap();

          if (resp?.success && resp?.data) {
            if (resp.data.url) {
              setPreviewUrl(resp.data.url);
              return;
            }

            const byteArray = new Uint8Array(resp.data);
            let mimeType = resp.data.type || file.mimeType;

            // Ajusta MIME conforme tipo esperado
            if (isImage && (!mimeType || mimeType === 'application/octet-stream' || !mimeType.startsWith('image/'))) {
              const ext = file.name.toLowerCase().split('.').pop();
              switch (ext) {
                case 'png':
                  mimeType = 'image/png';
                  break;
                case 'gif':
                  mimeType = 'image/gif';
                  break;
                case 'webp':
                  mimeType = 'image/webp';
                  break;
                case 'bmp':
                  mimeType = 'image/bmp';
                  break;
                default:
                  mimeType = 'image/jpeg';
              }
            } else if (isVideo && (!mimeType || !mimeType.startsWith('video/'))) {
              mimeType = 'video/mp4';
            } else if (isDocument && !mimeType) {
              mimeType = file.mimeType || 'application/pdf';
            }

            const blob = new Blob([byteArray], { type: mimeType });
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            revokedUrl = url;
          } else {
            throw new Error('Falha ao obter dados da mídia');
          }
        } catch (e) {
          console.error('Erro ao carregar mídia no preview:', e);
          setError('Erro ao carregar mídia. Tente novamente.');
        } finally {
          setLoading(false);
        }
      }
    };

    loadMedia();

    return () => {
      if (revokedUrl) URL.revokeObjectURL(revokedUrl);
    };
    // Recarrega quando mudar o arquivo ou abrir
  }, [open, file?.mediaId, file?.url, file?.mimeType, file?.name, isImage, isVideo, isDocument]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 1 }}>
        <FuseSvgIcon size={28} color="action">
          {getFileIcon(file.type, file.mimeType)}
        </FuseSvgIcon>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 600 }}>
            Detalhes do Arquivo
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Preview do arquivo */}
        <Box
          sx={{
            mb: 3,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 200,
            bgcolor: 'action.hover',
            borderRadius: 2,
            p: 2,
          }}
        >
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary">
                Carregando mídia...
              </Typography>
            </Box>
          )}

          {!loading && error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}

          {!loading && isImage && previewUrl && (
            <img
              src={previewUrl}
              alt={file.name}
              style={{
                maxWidth: '100%',
                maxHeight: 400,
                objectFit: 'contain',
                borderRadius: 8,
              }}
            />
          )}

          {!loading && isVideo && previewUrl && (
            <video
              src={previewUrl}
              controls
              style={{
                maxWidth: '100%',
                maxHeight: 400,
                borderRadius: 8,
              }}
            />
          )}

          {!loading && isDocument && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}>
              <FuseSvgIcon size={80} color="action">
                {getFileIcon(file.type, file.mimeType)}
              </FuseSvgIcon>
              <Typography variant="body2" color="text.secondary">
                Pré-visualização não disponível para documentos
              </Typography>
            </Box>
          )}
        </Box>

        {/* Informações do arquivo */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Nome */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>
              Nome do arquivo
            </Typography>
            <Typography variant="body1" sx={{ mt: 0.5, wordBreak: 'break-word' }}>
              {file.name}
            </Typography>
          </Box>

          {/* Tipo */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>
              Tipo
            </Typography>
            <Typography variant="body1" sx={{ mt: 0.5 }}>
              {getMimeTypeLabel(file.mimeType)}
            </Typography>
          </Box>

          {/* Tamanho */}
          {file.size && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>
                Tamanho
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.5 }}>
                {formatFileSize(file.size)}
              </Typography>
            </Box>
          )}

          {/* Status */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>
              Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: statusInfo.color,
                }}
              />
              <Typography variant="body1">{statusInfo.label}</Typography>
            </Box>
          </Box>

          {/* Media ID */}
          {file.mediaId && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>
                WhatsApp Media ID
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, fontFamily: 'monospace', bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                {file.mediaId}
              </Typography>
            </Box>
          )}

          {/* Erro */}
          {file.error && (
            <Box sx={{ bgcolor: 'error.light', p: 2, borderRadius: 1 }}>
              <Typography variant="caption" color="error.dark" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>
                Erro
              </Typography>
              <Typography variant="body2" color="error.dark" sx={{ mt: 0.5 }}>
                {file.error}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {(previewUrl || file.url) && (
          <Button
            variant="outlined"
            startIcon={<FuseSvgIcon size={20}>heroicons-outline:arrow-down-tray</FuseSvgIcon>}
            onClick={() => {
              const urlToDownload = previewUrl || file.url;

              if (urlToDownload) {
                const link = document.createElement('a');
                link.href = urlToDownload;
                link.download = file.name;
                link.click();
              }
            }}
          >
            Download
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} variant="contained" color="secondary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FilePreviewModal;
