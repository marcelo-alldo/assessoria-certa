import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@mui/material';
import { format } from 'date-fns';
import { useDownloadAndSaveMediaMutation } from '@/store/api/whatsappApi';
import ImageViewModal from './ImageViewModal';
import VideoViewModal from './VideoViewModal';
import MessageStatusIndicator from './MessageStatusIndicator';

interface ChatMessageBubbleProps {
  message: any;
  me: string;
  onMediaLoad?: () => void;
}

const typeLabels: Record<string, string> = {
  audio: 'Mensagem de áudio',
  image: 'Imagem',
  video: 'Vídeo',
  document: 'Documento',
  stickerMessage: 'Figurinha',
  contactMessage: 'Contato',
  reaction: 'Reação',
};

function parseWhatsappFormatting(text: string | null | undefined) {
  if (!text) return '';

  const textString = String(text);

  return textString
    .replace(/```(.+?)```/gs, '<pre>$1</pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*([^*]+)\*/g, '<b>$1</b>')
    .replace(/_([^_]+)_/g, '<i>$1</i>')
    .replace(/~([^~]+)~/g, '<s>$1</s>');
}

function wrapEmojisWithStyle(html: string) {
  // Regex para detectar emojis Unicode (incluindo modificadores de tom de pele)
  const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
  return html.replace(emojiRegex, '<span style="font-size: 24px;">$1</span>');
}

function ChatMessageBubble({ message, me }: ChatMessageBubbleProps) {
  const theme = useTheme();
  const [downloadAndSaveMedia] = useDownloadAndSaveMediaMutation();
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Função para verificar se uma mensagem é de hoje
  const isMessageFromToday = (message: any): boolean => {
    if (!message?.timestamp) return false;

    const messageDate = new Date(Number(message.timestamp) * 1000);
    const today = new Date();

    return (
      messageDate.getDate() === today.getDate() && messageDate.getMonth() === today.getMonth() && messageDate.getFullYear() === today.getFullYear()
    );
  };

  // Função para gerar o label de horário
  const getTimeLabel = (message: any): string => {
    if (!message?.timestamp || isNaN(Number(message.timestamp))) {
      return '??:??';
    }

    const date = new Date(Number(message.timestamp) * 1000);

    if (isNaN(date.getTime())) {
      return '??:??';
    }

    return format(date, 'HH:mm');
  };

  // Efeito para atualizar o tempo atual do áudio
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  // Efeito para carregar automaticamente imagens
  useEffect(() => {
    // Verifica se a mensagem é de hoje antes de carregar mídia
    if (!isMessageFromToday(message)) return;

    // Carrega imagens automaticamente se for de hoje
    if (message?.type === 'image' && message?.image?.id && !imageUrl && !loadingMedia && !errorMessage) {
      handleLoadMedia('image');
    }

    // Carrega áudios automaticamente se for de hoje
    if (message?.type === 'audio' && message?.audio?.id && !audioUrl && !loadingMedia && !errorMessage) {
      handleLoadMedia('audio');
    }

    // Carrega documentos automaticamente se for de hoje
    if (message?.type === 'document' && message?.document?.id && !documentUrl && !loadingMedia && !errorMessage) {
      handleLoadMedia('document');
    }

    // Carrega vídeos automaticamente se for de hoje
    if (message?.type === 'video' && message?.video?.id && !videoUrl && !loadingMedia && !errorMessage) {
      handleLoadMedia('video');
    }
  }, [message, imageUrl, audioUrl, documentUrl, videoUrl, loadingMedia, errorMessage]);

  // Função para controlar play/pause
  const togglePlayPause = () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    setIsPlaying(!isPlaying);
  };

  // Função para buscar posição no áudio
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;

    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Função para formatar tempo
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Função para carregar mídia usando apenas a nova API
  const handleLoadMedia = async (mediaType: 'audio' | 'image' | 'document' | 'video') => {
    try {
      setLoadingMedia(true);
      setErrorMessage(null);

      const mediaId =
        mediaType === 'audio'
          ? message?.audio?.id
          : mediaType === 'image'
            ? message?.image?.id
            : mediaType === 'document'
              ? message?.document?.id
              : message?.video?.id;

      const downloadResponse = await downloadAndSaveMedia({
        mediaId: mediaId,
      }).unwrap();

      if (downloadResponse.success && downloadResponse.data) {
        const responseData = downloadResponse.data;

        // Novo formato: API retorna URL direta (S3)
        if (responseData.url) {
          if (mediaType === 'audio') {
            setAudioUrl(responseData.url);
          } else if (mediaType === 'image') {
            setImageUrl(responseData.url);
          } else if (mediaType === 'video') {
            setVideoUrl(responseData.url);
          } else {
            setDocumentUrl(responseData.url);
          }
          // Formato legado: API retorna buffer binário
        } else if (responseData.data) {
          const byteArray = new Uint8Array(responseData.data);
          let mimeType = responseData.type || '';

          if (mediaType === 'audio' && !mimeType) {
            mimeType = message?.audio?.mimetype || 'audio/ogg';
          } else if (mediaType === 'video' && !mimeType) {
            mimeType = message?.video?.mimetype || 'video/mp4';
          } else if (mediaType === 'document' && !mimeType) {
            mimeType = message?.document?.mimetype || 'application/pdf';
          } else if (mediaType === 'image') {
            if (!mimeType || mimeType === 'application/octet-stream' || mimeType === 'text/plain') {
              mimeType = message?.image?.mimetype || 'image/jpeg';
            }

            if (!mimeType.startsWith('image/')) {
              mimeType = 'image/jpeg';
            }
          }

          const blobUrl = URL.createObjectURL(new Blob([byteArray], { type: mimeType }));

          if (mediaType === 'audio') {
            setAudioUrl(blobUrl);
          } else if (mediaType === 'image') {
            setImageUrl(blobUrl);
          } else if (mediaType === 'video') {
            setVideoUrl(blobUrl);
          } else {
            setDocumentUrl(blobUrl);
          }
        } else {
          throw new Error('Erro ao processar mídia - dados não encontrados');
        }
      } else {
        throw new Error('Erro ao processar mídia - resposta inválida');
      }
    } catch (error) {
      console.error('Erro ao processar mídia:', error);
      setErrorMessage('Erro ao carregar mídia. Tente novamente.');
    }

    setLoadingMedia(false);
  };

  // Função para obter ícone baseado no tipo de arquivo
  const getDocumentIcon = (filename: string, mimetype: string) => {
    const extension = filename?.toLowerCase().split('.').pop() || '';
    const type = mimetype?.toLowerCase() || '';

    if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
        </svg>
      );
    } else if (type === 'application/pdf' || extension === 'pdf') {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      );
    } else if (type.startsWith('text/') || ['txt', 'md', 'json', 'xml', 'csv'].includes(extension)) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      );
    } else {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      );
    }
  };

  // Função para obter cor baseada no tipo de arquivo
  const getDocumentColor = (filename: string, mimetype: string) => {
    const extension = filename?.toLowerCase().split('.').pop() || '';
    const type = mimetype?.toLowerCase() || '';

    if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return '#4CAF50'; // Verde para imagens
    } else if (type === 'application/pdf' || extension === 'pdf') {
      return '#F44336'; // Vermelho para PDFs
    } else if (type.startsWith('text/') || ['txt', 'md', 'json', 'xml', 'csv'].includes(extension)) {
      return '#2196F3'; // Azul para textos
    } else {
      return '#9E9E9E'; // Cinza para outros
    }
  };

  if (message?.type === 'document') {
    const filename = message?.document?.filename || 'Documento';
    const mimetype = message?.document?.mimetype || '';
    const iconColor = getDocumentColor(filename, mimetype);

    return (
      <div
        style={{
          alignSelf: message?.from == me ? 'flex-end' : 'flex-start',
          background:
            message?.from == me ? (theme.palette.mode === 'dark' ? '#144D37' : '#D9FDD3') : theme.palette.mode === 'dark' ? '#242626' : '#FFFFFF',
          color: theme.palette.mode === 'dark' ? '#fff' : '#222',
          borderRadius: 8,
          padding: '12px',
          fontSize: 14,
          margin: '4px 0',
          maxWidth: 320,
          minWidth: 200,
          boxShadow: theme.palette.mode === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        {loadingMedia ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}`,
                borderTop: `2px solid ${theme.palette.mode === 'dark' ? '#4CAF50' : '#25D366'}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <span>Carregando documento...</span>
          </div>
        ) : (
          // Sempre mostrar o preview do documento automaticamente
          <div
            onClick={async () => {
              // Se o documento não foi carregado ainda, carrega primeiro
              if (!documentUrl) {
                await handleLoadMedia('document');
                return;
              }

              // Se já foi carregado, faz o download
              const link = document.createElement('a');
              link.href = documentUrl;

              // Garante que o nome do arquivo tenha a extensão correta baseada no MIME type
              let downloadFilename = filename;
              const mimetype = message?.document?.mimetype || '';

              // Se o arquivo não tem extensão ou tem extensão incorreta, corrige baseado no MIME type
              if (mimetype === 'application/pdf' && !downloadFilename.toLowerCase().endsWith('.pdf')) {
                // Remove extensão incorreta se existir
                const nameWithoutExt = downloadFilename.replace(/\.[^/.]+$/, '');
                downloadFilename = `${nameWithoutExt}.pdf`;
              } else if (mimetype.includes('word') && !downloadFilename.toLowerCase().match(/\.(doc|docx)$/)) {
                const nameWithoutExt = downloadFilename.replace(/\.[^/.]+$/, '');
                downloadFilename = `${nameWithoutExt}.docx`;
              } else if (mimetype.includes('excel') && !downloadFilename.toLowerCase().match(/\.(xls|xlsx)$/)) {
                const nameWithoutExt = downloadFilename.replace(/\.[^/.]+$/, '');
                downloadFilename = `${nameWithoutExt}.xlsx`;
              } else if (mimetype.includes('powerpoint') && !downloadFilename.toLowerCase().match(/\.(ppt|pptx)$/)) {
                const nameWithoutExt = downloadFilename.replace(/\.[^/.]+$/, '');
                downloadFilename = `${nameWithoutExt}.pptx`;
              }

              link.download = downloadFilename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              borderRadius: '8px',
              padding: '8px',
              background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: `linear-gradient(135deg, ${iconColor}20, ${iconColor}30)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: iconColor,
                }}
              >
                {getDocumentIcon(filename, mimetype)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: '14px' }}>{filename}</div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>{documentUrl ? 'Clique para baixar' : 'Clique para carregar e baixar'}</div>
              </div>
            </div>

            {(message?.document?.caption || message?.caption) && (
              <div
                style={{
                  fontSize: '14px',
                  color: theme.palette.mode === 'dark' ? '#fff' : '#222',
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                  marginTop: '4px',
                }}
                dangerouslySetInnerHTML={{
                  __html: parseWhatsappFormatting(message?.document?.caption || message?.caption),
                }}
              />
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#666',
                opacity: 0.8,
                marginTop: '4px',
              }}
            >
              <span style={{ marginLeft: 'auto', fontWeight: 500 }}>{getTimeLabel(message)}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Tipos especiais (apenas label)
  if (typeLabels[message?.type]) {
    if (message?.type === 'audio') {
      return (
        <div
          style={{
            alignSelf: message?.from == me ? 'flex-end' : 'flex-start',
            background:
              message?.from == me ? (theme.palette.mode === 'dark' ? '#144D37' : '#D9FDD3') : theme.palette.mode === 'dark' ? '#242626' : '#FFFFFF',
            color: theme.palette.mode === 'dark' ? '#fff' : '#222',
            borderRadius: 12,
            borderTopRightRadius: message?.from == me ? 4 : 12,
            borderTopLeftRadius: message?.from == me ? 12 : 4,
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            padding: '12px 16px',
            fontSize: 14,
            margin: '4px 0',
            maxWidth: 320,
            minWidth: 200,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {loadingMedia ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                fontSize: 13,
                color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#666',
                background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                borderRadius: '12px',
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid transparent',
                  borderTop: `2px solid ${theme.palette.mode === 'dark' ? '#4CAF50' : '#25D366'}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontWeight: 500 }}>Carregando áudio...</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>Aguarde um momento</div>
              </div>
            </div>
          ) : errorMessage ? (
            <div
              style={{
                padding: '16px',
                fontSize: 13,
                color: '#ff6b6b',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'center',
                background: theme.palette.mode === 'dark' ? 'rgba(255,107,107,0.05)' : 'rgba(255,107,107,0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255,107,107,0.2)',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  background: 'rgba(255,107,107,0.1)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ⚠️
              </div>
              <div style={{ fontWeight: 500 }}>{errorMessage}</div>
              <button
                onClick={() => handleLoadMedia('audio')}
                style={{
                  backgroundColor: 'rgba(255,107,107,0.1)',
                  color: '#ff6b6b',
                  border: '1px solid rgba(255,107,107,0.3)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,107,107,0.15)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,107,107,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Tentar novamente
              </button>
            </div>
          ) : audioUrl ? (
            // Player de áudio funcional
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <audio ref={audioRef} src={audioUrl} preload="metadata" />

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  onClick={togglePlayPause}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.palette.mode === 'dark' ? '#4CAF50' : '#25D366'}, ${theme.palette.mode === 'dark' ? '#45A049' : '#20B358'})`,
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: `0 4px 12px ${theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(37, 211, 102, 0.3)'}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 6px 20px ${theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.4)' : 'rgba(37, 211, 102, 0.4)'}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1) translateY(0)';
                    e.currentTarget.style.boxShadow = `0 4px 12px ${theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(37, 211, 102, 0.3)'}`;
                  }}
                >
                  {isPlaying ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                {/* Barra de progresso e tempo */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div
                    onClick={handleSeek}
                    style={{
                      height: '6px',
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        background: `linear-gradient(90deg, ${theme.palette.mode === 'dark' ? '#4CAF50' : '#25D366'}, ${theme.palette.mode === 'dark' ? '#45A049' : '#20B358'})`,
                        borderRadius: '3px',
                        width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          right: '-6px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '12px',
                          height: '12px',
                          backgroundColor: theme.palette.mode === 'dark' ? '#4CAF50' : '#25D366',
                          borderRadius: '50%',
                          border: '2px solid white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          opacity: duration > 0 ? 1 : 0,
                          transition: 'opacity 0.2s ease',
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#666',
                      fontWeight: 500,
                      fontFamily: 'monospace',
                    }}
                  >
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#666',
                  opacity: 0.8,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span>Mensagem de áudio</span>
                <span style={{ marginLeft: 'auto', fontWeight: 500 }}>{getTimeLabel(message)}</span>
              </div>
            </div>
          ) : (
            <div
              onClick={() => handleLoadMedia('audio')}
              style={{
                padding: '16px',
                fontSize: 13,
                color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#666',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                borderRadius: '12px',
                border: `2px dashed ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                e.currentTarget.style.borderColor = theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(37, 211, 102, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
                e.currentTarget.style.borderColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(37, 211, 102, 0.2)'}, ${theme.palette.mode === 'dark' ? 'rgba(69, 160, 73, 0.2)' : 'rgba(32, 179, 88, 0.2)'})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  color: theme.palette.mode === 'dark' ? '#4CAF50' : '#25D366',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontWeight: 500 }}>Clique para carregar áudio</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>Mensagem de áudio do WhatsApp</div>
              </div>
            </div>
          )}

          <ImageViewModal
            open={showImageModal}
            onClose={() => setShowImageModal(false)}
            imageUrl={imageUrl}
            alt="Imagem do WhatsApp"
            caption={message?.image?.caption || message?.caption}
          />
        </div>
      );
    }

    if (message?.type === 'video') {
      return (
        <div
          style={{
            alignSelf: message?.from == me ? 'flex-end' : 'flex-start',
            background:
              message?.from == me ? (theme.palette.mode === 'dark' ? '#144D37' : '#D9FDD3') : theme.palette.mode === 'dark' ? '#242626' : '#FFFFFF',
            color: theme.palette.mode === 'dark' ? '#fff' : '#222',
            borderRadius: 12,
            borderTopRightRadius: message?.from == me ? 4 : 12,
            borderTopLeftRadius: message?.from == me ? 12 : 4,
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            padding: '12px 16px',
            fontSize: 14,
            margin: '4px 0',
            maxWidth: 420,
            minWidth: 200,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {loadingMedia ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                fontSize: 13,
                color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#666',
                background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                borderRadius: '12px',
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid transparent',
                  borderTop: `2px solid ${theme.palette.mode === 'dark' ? '#4CAF50' : '#25D366'}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontWeight: 500 }}>Carregando vídeo...</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>Aguarde um momento</div>
              </div>
            </div>
          ) : errorMessage ? (
            <div
              style={{
                padding: '16px',
                fontSize: 13,
                color: '#ff6b6b',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'center',
                background: theme.palette.mode === 'dark' ? 'rgba(255,107,107,0.05)' : 'rgba(255,107,107,0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255,107,107,0.2)',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  background: 'rgba(255,107,107,0.1)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ⚠️
              </div>
              <div style={{ fontWeight: 500 }}>{errorMessage}</div>
              <button
                onClick={() => handleLoadMedia('video')}
                style={{
                  backgroundColor: 'rgba(255,107,107,0.1)',
                  color: '#ff6b6b',
                  border: '1px solid rgba(255,107,107,0.3)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,107,107,0.15)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,107,107,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Tentar novamente
              </button>
            </div>
          ) : videoUrl ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <video
                src={videoUrl}
                controls
                style={{
                  width: '100%',
                  height: 'auto',
                  minHeight: '150px',
                  maxHeight: '400px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  objectFit: 'cover',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: theme.palette.mode === 'dark' ? '#000' : '#f5f5f5',
                }}
                onClick={() => setShowVideoModal(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
              />
              {(message?.video?.caption || message?.caption) && (
                <div
                  style={{
                    fontSize: '14px',
                    color: theme.palette.mode === 'dark' ? '#fff' : '#222',
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                    marginTop: '4px',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: parseWhatsappFormatting(message?.video?.caption || message?.caption),
                  }}
                />
              )}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#666',
                  opacity: 0.8,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z" />
                </svg>
                <span>Clique para ampliar</span>
                <span style={{ marginLeft: 'auto', fontWeight: 500 }}>{getTimeLabel(message)}</span>
              </div>
            </div>
          ) : (
            <div
              onClick={() => handleLoadMedia('video')}
              style={{
                padding: '16px',
                fontSize: 13,
                color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#666',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                borderRadius: '12px',
                border: `2px dashed ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                e.currentTarget.style.borderColor = theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(37, 211, 102, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
                e.currentTarget.style.borderColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(37, 211, 102, 0.2)'}, ${theme.palette.mode === 'dark' ? 'rgba(69, 160, 73, 0.2)' : 'rgba(32, 179, 88, 0.2)'})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  color: theme.palette.mode === 'dark' ? '#4CAF50' : '#25D366',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z" />
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontWeight: 500 }}>Clique para carregar vídeo</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>Vídeo do WhatsApp</div>
              </div>
            </div>
          )}

          <VideoViewModal
            open={showVideoModal}
            onClose={() => setShowVideoModal(false)}
            videoUrl={videoUrl}
            alt="Vídeo do WhatsApp"
            caption={message?.video?.caption || message?.caption}
          />
        </div>
      );
    }

    if (message?.type === 'image') {
      return (
        <div
          style={{
            alignSelf: message?.from == me ? 'flex-end' : 'flex-start',
            background:
              message?.from == me ? (theme.palette.mode === 'dark' ? '#144D37' : '#D9FDD3') : theme.palette.mode === 'dark' ? '#242626' : '#FFFFFF',
            color: theme.palette.mode === 'dark' ? '#fff' : '#222',
            borderRadius: 12,
            borderTopRightRadius: message?.from == me ? 4 : 12,
            borderTopLeftRadius: message?.from == me ? 12 : 4,
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            padding: '12px 16px',
            fontSize: 14,
            margin: '4px 0',
            maxWidth: 320,
            minWidth: 200,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {loadingMedia ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                fontSize: 13,
                color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#666',
                background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                borderRadius: '12px',
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid transparent',
                  borderTop: `2px solid ${theme.palette.mode === 'dark' ? '#4CAF50' : '#25D366'}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontWeight: 500 }}>Carregando imagem...</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>Aguarde um momento</div>
              </div>
            </div>
          ) : errorMessage ? (
            <div
              style={{
                padding: '16px',
                fontSize: 13,
                color: '#ff6b6b',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'center',
                background: theme.palette.mode === 'dark' ? 'rgba(255,107,107,0.05)' : 'rgba(255,107,107,0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255,107,107,0.2)',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  background: 'rgba(255,107,107,0.1)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ⚠️
              </div>
              <div style={{ fontWeight: 500 }}>{errorMessage}</div>
              <button
                onClick={() => handleLoadMedia('image')}
                style={{
                  backgroundColor: 'rgba(255,107,107,0.1)',
                  color: '#ff6b6b',
                  border: '1px solid rgba(255,107,107,0.3)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,107,107,0.15)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,107,107,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Tentar novamente
              </button>
            </div>
          ) : imageUrl ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <img
                src={imageUrl}
                alt="Imagem do WhatsApp"
                onClick={() => setShowImageModal(true)}
                style={{
                  width: '100%',
                  height: 'auto',
                  minHeight: '150px',
                  maxHeight: '400px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  objectFit: 'cover',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
              />
              {(message?.image?.caption || message?.caption) && (
                <div
                  style={{
                    fontSize: '14px',
                    color: theme.palette.mode === 'dark' ? '#fff' : '#222',
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                    marginTop: '4px',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: parseWhatsappFormatting(message?.image?.caption || message?.caption),
                  }}
                />
              )}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#666',
                  opacity: 0.8,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
                <span>Clique para ampliar</span>
                <span style={{ marginLeft: 'auto', fontWeight: 500 }}>{getTimeLabel(message)}</span>
              </div>
            </div>
          ) : (
            <div
              onClick={() => handleLoadMedia('image')}
              style={{
                padding: '16px',
                fontSize: 13,
                color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#666',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                borderRadius: '12px',
                border: `2px dashed ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                e.currentTarget.style.borderColor = theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(37, 211, 102, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
                e.currentTarget.style.borderColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(37, 211, 102, 0.2)'}, ${theme.palette.mode === 'dark' ? 'rgba(69, 160, 73, 0.2)' : 'rgba(32, 179, 88, 0.2)'})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  color: theme.palette.mode === 'dark' ? '#4CAF50' : '#25D366',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontWeight: 500 }}>Clique para carregar imagem</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>Imagem do WhatsApp</div>
              </div>
            </div>
          )}

          <ImageViewModal
            open={showImageModal}
            onClose={() => setShowImageModal(false)}
            imageUrl={imageUrl}
            alt="Imagem do WhatsApp"
            caption={message?.image?.caption || message?.caption}
          />
        </div>
      );
    }

    if (message?.type === 'reaction') {
      const emoji = message?.reaction?.emoji || message?.message?.reactionMessage?.emoji || ' - ';

      return (
        <div
          style={{
            alignSelf: message?.key?.fromMe ? 'flex-end' : 'flex-start',
            background: message?.key?.fromMe
              ? theme.palette.mode === 'dark'
                ? '#144D37'
                : '#D9FDD3'
              : theme.palette.mode === 'dark'
                ? '#242626'
                  ? '#144D37'
                  : '#D9FDD3'
                : theme.palette.mode === 'dark'
                  ? '#242626'
                  : '#FFFFFF',
            color: theme.palette.mode === 'dark' ? '#fff' : '#222',
            borderRadius: 12,
            borderTopRightRadius: message?.key?.fromMe ? 4 : 12,
            borderTopLeftRadius: message?.key?.fromMe ? 12 : 4,
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            padding: '8px 16px',
            fontSize: 14,
            margin: '4px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            maxWidth: 'fit-content',
          }}
        >
          <span style={{ fontSize: 11, color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#888', fontStyle: 'italic' }}>Reagiu com:</span>
          <span style={{ fontSize: 24 }}>{emoji}</span>
          <span
            style={{
              fontSize: 11,
              color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#888',
              fontStyle: 'italic',
            }}
          >
            {getTimeLabel(message)}
          </span>
        </div>
      );
    }

    return (
      <div
        style={{
          alignSelf: message?.key?.fromMe ? 'flex-end' : 'flex-start',
          background: theme.palette.mode === 'dark' ? '#23272a' : '#f5f5f5',
          color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#888',
          borderRadius: 8,
          padding: '6px 18px',
          fontSize: 14,
          margin: '4px 0',
          fontStyle: 'italic',
          maxWidth: 320,
        }}
      >
        {loadingMedia ? 'Carregando mídia...' : typeLabels[message?.type]}
      </div>
    );
  }

  // Mensagens de histórico de atendimento
  if (message?.type === 'attendantHistory') {
    switch ((message as any)?.status) {
      case 'FINALIZED':
        return (
          <div
            style={{
              alignSelf: 'center',
              background: theme.palette.mode === 'dark' ? '#1D1F1F' : '#fff',
              color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#888',
              borderRadius: 8,
              padding: '4px 16px',
              fontSize: 13,
              margin: '8px 0',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              fontStyle: 'italic',
            }}
          >
            {(message as any)?.user ? `Atendimento finalizado por ${(message as any).user.profile.name}` : 'Atendimento finalizado por um atendente.'}
          </div>
        );
      case 'IN_PROGRESS':
        return (
          <div
            style={{
              alignSelf: 'center',
              background: theme.palette.mode === 'dark' ? '#1D1F1F' : '#fff',
              color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#888',
              borderRadius: 8,
              padding: '4px 16px',
              fontSize: 13,
              margin: '8px 0',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              fontStyle: 'italic',
            }}
          >
            {(message as any)?.user
              ? `Contato está sendo atendido por ${(message as any)?.user?.profile?.name}`
              : 'Contato está sendo atendido por um atendente.'}
          </div>
        );
      case 'TRANSFERRED':
        return (
          <div
            style={{
              alignSelf: 'center',
              background: theme.palette.mode === 'dark' ? '#1D1F1F' : '#fff',
              color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#888',
              borderRadius: 8,
              padding: '4px 16px',
              fontSize: 13,
              margin: '8px 0',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              fontStyle: 'italic',
            }}
          >
            {(message as any)?.user && (message as any)?.userTransfered
              ? `Atendimento transferido de ${(message as any)?.user?.profile?.name} para ${(message as any)?.userTransfered?.profile?.name}`
              : 'Atendimento transferido de atendente para outro atendente'}
          </div>
        );
      case 'CONVERTED':
        return (
          <div
            style={{
              alignSelf: 'center',
              background: theme.palette.mode === 'dark' ? '#1D1F1F' : '#fff',
              color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#888',
              borderRadius: 8,
              padding: '4px 16px',
              fontSize: 13,
              margin: '8px 0',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              fontStyle: 'italic',
            }}
          >
            {(message as any)?.user
              ? ` Eleitor convertido para apoiador por  ${(message as any)?.user?.profile?.name}`
              : ' Eleitor convertido para apoiador.'}
          </div>
        );
      default:
        return (
          <div
            style={{
              alignSelf: 'center',
              background: theme.palette.mode === 'dark' ? '#1D1F1F' : '#fff',
              color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#888',
              borderRadius: 8,
              padding: '4px 16px',
              fontSize: 13,
              margin: '8px 0',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              fontStyle: 'italic',
            }}
          >
            {(message as any)?.user ? `Contato está sendo atendido por ${(message as any)?.user}` : 'Contato está sendo atendido por um atendente.'}
          </div>
        );
    }
  }

  // Mensagem padrão (texto)
  // Protege contra timestamp inválido
  let timeLabel = '??:??';

  if (message?.timestamp && !isNaN(Number(message.timestamp))) {
    const date = new Date(Number(message.timestamp) * 1000);

    if (!isNaN(date.getTime())) {
      timeLabel = format(date, 'HH:mm');
    }
  }

  // Mensagem modelo (template)
  if (message?.name === 'TEMPLATE') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: message?.from == me ? 'flex-end' : 'flex-start',
        }}
      >
        <div
          style={{
            background: theme.palette.mode === 'dark' ? '#1A2E3D' : '#E8F4FD',
            color: theme.palette.mode === 'dark' ? '#C8E6FA' : '#1565C0',
            borderRadius: 12,
            borderTopRightRadius: message?.from == me ? 4 : 12,
            borderTopLeftRadius: message?.from == me ? 12 : 4,
            boxShadow:
              theme.palette.mode === 'dark'
                ? '0 1px 4px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(100,181,246,0.15)'
                : '0 1px 4px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(21,101,192,0.15)',
            padding: 0,
            maxWidth: 320,
            minWidth: 60,
            wordBreak: 'break-word',
            fontSize: 15,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Badge de template */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              background: theme.palette.mode === 'dark' ? 'rgba(100,181,246,0.12)' : 'rgba(21,101,192,0.08)',
              borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(100,181,246,0.15)' : 'rgba(21,101,192,0.12)'}`,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.5px',
              color: theme.palette.mode === 'dark' ? '#90CAF9' : '#1565C0',
              textTransform: 'uppercase',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
            </svg>
            Mensagem modelo
          </div>

          {/* Imagem do template */}
          {message?.imageUrl && (
            <img
              src={message.imageUrl}
              alt="Imagem do template"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: 200,
                objectFit: 'cover',
                display: 'block',
              }}
            />
          )}

          {/* Corpo do texto */}
          <div style={{ padding: '10px 14px 4px 14px' }}>
            <span
              style={{ whiteSpace: 'pre-line', color: theme.palette.mode === 'dark' ? '#E3F2FD' : '#1A237E' }}
              dangerouslySetInnerHTML={{
                __html: message?.body
                  ? wrapEmojisWithStyle(parseWhatsappFormatting(message?.body))
                  : '<span style="font-size:12px;opacity:0.6">mensagem indisponível</span>',
              }}
            />
          </div>

          {/* Rodapé com horário e status */}
          <div
            style={{
              fontSize: 11,
              color: theme.palette.mode === 'dark' ? '#90CAF9' : '#1565C0',
              opacity: 0.8,
              textAlign: 'right',
              padding: '2px 14px 8px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 4,
            }}
          >
            {timeLabel}
            <MessageStatusIndicator status={message?.status} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: message?.from == me ? 'flex-end' : 'flex-start',
      }}
    >
      <div
        style={{
          background:
            message?.from == me ? (theme.palette.mode === 'dark' ? '#144D37' : '#D9FDD3') : theme.palette.mode === 'dark' ? '#242626' : '#FFFFFF',
          color: theme.palette.mode === 'dark' ? '#fff' : '#222',
          borderRadius: 12,
          borderTopRightRadius: message?.key?.fromMe ? 4 : 12,
          borderTopLeftRadius: message?.key?.fromMe ? 12 : 4,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          padding: '10px 16px',
          maxWidth: 420,
          minWidth: 60,
          wordBreak: 'break-word',
          fontSize: 15,
          position: 'relative',
        }}
      >
        <div>
          <span
            style={{ whiteSpace: 'pre-line' }}
            dangerouslySetInnerHTML={{
              __html:
                message?.body !== ''
                  ? wrapEmojisWithStyle(parseWhatsappFormatting(message?.body))
                  : '<span style="font-size:12px;color:#888">mensagem indisponível</span>',
            }}
          />
        </div>
        <div
          style={{
            fontSize: 11,
            color: theme.palette.mode === 'dark' ? '#b9bbbe' : '#888',
            textAlign: 'right',
            marginTop: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 4,
          }}
        >
          {timeLabel}
          <MessageStatusIndicator status={message?.status} />
        </div>
      </div>
    </div>
  );
}

export default ChatMessageBubble;
