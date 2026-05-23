import { IconButton, Box, Typography, LinearProgress, useTheme } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';

interface AudioRecorderProps {
  onSendAudio: (audioBlob: Blob) => void;
  isLoading?: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function AudioRecorder({ onSendAudio, isLoading = false }: AudioRecorderProps) {
  const theme = useTheme();
  const { state, actions } = useAudioRecorder(onSendAudio);

  const handleStartRecording = async () => {
    try {
      await actions.startRecording();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao iniciar gravação');
    }
  };

  // Se não está gravando e não tem áudio gravado, mostra apenas o botão de microfone
  if (!state.isRecording && !state.audioBlob) {
    return (
      <IconButton
        onClick={handleStartRecording}
        disabled={isLoading}
        sx={{
          color: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: theme.palette.primary.main + '20',
          },
        }}
      >
        <FuseSvgIcon size={24}>material-outline:mic_none</FuseSvgIcon>
      </IconButton>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1,
        borderRadius: 2,
        backgroundColor: theme.palette.mode === 'dark' ? '#2a2d2e' : '#f5f5f5',
        border: `1px solid ${theme.palette.mode === 'dark' ? '#3a3d3e' : '#e0e0e0'}`,
        minWidth: 280,
        maxWidth: 400,
      }}
    >
      {/* Botão de ação principal (gravar/parar/play/pause) */}
      {state.isRecording ? (
        <IconButton
          onClick={actions.stopRecording}
          size="small"
          sx={{
            color: theme.palette.error.main,
            backgroundColor: theme.palette.error.main + '20',
            '&:hover': {
              backgroundColor: theme.palette.error.main + '30',
            },
          }}
        >
          <FuseSvgIcon size={20}>material-outline:stop</FuseSvgIcon>
        </IconButton>
      ) : state.audioBlob && !state.isPlaying ? (
        <IconButton
          onClick={actions.playAudio}
          size="small"
          sx={{
            color: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.main + '20',
            '&:hover': {
              backgroundColor: theme.palette.primary.main + '30',
            },
          }}
        >
          <FuseSvgIcon size={20}>material-outline:play_arrow</FuseSvgIcon>
        </IconButton>
      ) : (
        <IconButton
          onClick={actions.pauseAudio}
          size="small"
          sx={{
            color: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.main + '20',
            '&:hover': {
              backgroundColor: theme.palette.primary.main + '30',
            },
          }}
        >
          <FuseSvgIcon size={20}>material-outline:pause</FuseSvgIcon>
        </IconButton>
      )}

      {/* Visualização de tempo e progresso */}
      <Box flex={1} mx={1}>
        {state.isRecording ? (
          <>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.error.main,
                  animation: 'pulse 1.5s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%': {
                      opacity: 1,
                    },
                    '50%': {
                      opacity: 0.5,
                    },
                    '100%': {
                      opacity: 1,
                    },
                  },
                }}
              />
              <Typography variant="caption" color={theme.palette.error.main} fontWeight={600}>
                Gravando...
              </Typography>
            </Box>
            <Typography variant="caption" color="textSecondary" fontFamily="monospace">
              {formatTime(state.recordingTime)}
            </Typography>
          </>
        ) : (
          <>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" color="textPrimary" fontWeight={500}>
                Áudio
              </Typography>
              <Typography variant="caption" color="textSecondary" fontFamily="monospace">
                {formatTime(state.isPlaying ? state.playbackTime : state.duration)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={state.duration > 0 ? (state.playbackTime / state.duration) * 100 : 0}
              sx={{
                height: 3,
                borderRadius: 2,
                backgroundColor: theme.palette.mode === 'dark' ? '#3a3d3e' : '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: 2,
                },
              }}
            />
          </>
        )}
      </Box>

      {/* Botões de ação (cancelar/enviar) */}
      {!state.isRecording && state.audioBlob && (
        <>
          <IconButton
            onClick={actions.resetAudio}
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <FuseSvgIcon size={18}>material-outline:delete</FuseSvgIcon>
          </IconButton>

          <IconButton
            onClick={actions.sendAudio}
            disabled={isLoading}
            size="small"
            sx={{
              color: theme.palette.primary.main,
              backgroundColor: theme.palette.primary.main + '20',
              '&:hover': {
                backgroundColor: theme.palette.primary.main + '30',
              },
              '&:disabled': {
                backgroundColor: theme.palette.action.disabledBackground,
              },
            }}
          >
            <FuseSvgIcon size={18}>material-outline:send</FuseSvgIcon>
          </IconButton>
        </>
      )}
    </Box>
  );
}

export default AudioRecorder;
