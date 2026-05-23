import { useState, useRef, useCallback } from 'react';

export interface AudioRecorderState {
  isRecording: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  recordingTime: number;
  playbackTime: number;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  mimeType?: string; // Formato final gravado
  maxSizeBytes?: number; // Limite configurado
  reachedMaxSize?: boolean; // Se atingiu o limite
}

export interface AudioRecorderActions {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  playAudio: () => void;
  pauseAudio: () => void;
  resetAudio: () => void;
  sendAudio: () => void;
}

interface AudioRecorderOptions {
  maxSizeBytes?: number; // default 16MB
  targetBitsPerSecond?: number; // sugestão de bitrate (estimativa de duração)
  stopAtMax?: boolean; // parar automaticamente ao atingir limite
}

export function useAudioRecorder(onSendAudio: (audioBlob: Blob) => void, options: AudioRecorderOptions = {}) {
  const {
    maxSizeBytes = 14 * 1024 * 1024, // 14MB
    targetBitsPerSecond = 96_000, // bitrate sugerido para voz em MP4 (ajustável)
    stopAtMax = true,
  } = options;
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPlaying: false,
    isPaused: false,
    recordingTime: 0,
    playbackTime: 0,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
    mimeType: undefined,
    maxSizeBytes,
    reachedMaxSize: false,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const totalSizeRef = useRef<number>(0);
  const stoppedBySizeRef = useRef<boolean>(false);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;
      audioChunksRef.current = [];
      totalSizeRef.current = 0;
      stoppedBySizeRef.current = false;

      // Forçar somente MP4. Se não suportar, lançar erro.
      const chosenMime = 'audio/mp4';

      if (!MediaRecorder.isTypeSupported(chosenMime)) {
        throw new Error('Seu navegador não suporta gravação em MP4 (audio/mp4). Considere usar OGG (Opus) como alternativa.');
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType: chosenMime });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          totalSizeRef.current += event.data.size;

          // Se excedeu limite, parar (apenas uma vez)
          if (stopAtMax && totalSizeRef.current >= maxSizeBytes && mediaRecorder.state === 'recording') {
            stoppedBySizeRef.current = true;
            mediaRecorder.stop();
          }
        }
      };

      mediaRecorder.onstop = () => {
        // Usar o mimeType efetivamente utilizado
        const audioBlob = new Blob(audioChunksRef.current, { type: chosenMime });
        const audioUrl = URL.createObjectURL(audioBlob);
        setState((prev) => ({
          ...prev,
          isRecording: false,
          audioBlob,
          audioUrl,
          duration: prev.recordingTime,
          mimeType: chosenMime,
          reachedMaxSize: stoppedBySizeRef.current,
        }));

        // Limpar stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start(100); // Captura dados a cada 100ms

      setState((prev) => ({
        ...prev,
        isRecording: true,
        recordingTime: 0,
        audioBlob: null,
        audioUrl: null,
        mimeType: chosenMime,
        reachedMaxSize: false,
      }));

      // Iniciar contador de tempo de gravação
      recordingIntervalRef.current = setInterval(() => {
        setState((prev) => {
          // Evitar continuar incrementando após parada
          if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return prev;

          return {
            ...prev,
            recordingTime: +(prev.recordingTime + 0.1).toFixed(1),
          };
        });
      }, 100);
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      throw new Error('Não foi possível acessar o microfone. Verifique as permissões.');
    }
  }, [maxSizeBytes, stopAtMax]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  }, [state.isRecording]);

  const playAudio = useCallback(() => {
    if (!state.audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(state.audioUrl);

      audioRef.current.onended = () => {
        setState((prev) => ({
          ...prev,
          isPlaying: false,
          playbackTime: 0,
        }));

        if (playbackIntervalRef.current) {
          clearInterval(playbackIntervalRef.current);
          playbackIntervalRef.current = null;
        }
      };

      audioRef.current.onloadedmetadata = () => {
        if (audioRef.current) {
          setState((prev) => ({
            ...prev,
            duration: audioRef.current!.duration,
          }));
        }
      };
    }

    if (state.isPaused) {
      audioRef.current.play();
      setState((prev) => ({ ...prev, isPlaying: true, isPaused: false }));
    } else {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setState((prev) => ({ ...prev, isPlaying: true, playbackTime: 0 }));
    }

    // Iniciar contador de tempo de reprodução
    playbackIntervalRef.current = setInterval(() => {
      if (audioRef.current) {
        setState((prev) => ({
          ...prev,
          playbackTime: audioRef.current!.currentTime,
        }));
      }
    }, 100);
  }, [state.audioUrl, state.isPaused]);

  const pauseAudio = useCallback(() => {
    if (audioRef.current && state.isPlaying) {
      audioRef.current.pause();
      setState((prev) => ({ ...prev, isPlaying: false, isPaused: true }));

      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
    }
  }, [state.isPlaying]);

  const resetAudio = useCallback(() => {
    // Parar gravação se estiver gravando
    if (state.isRecording) {
      stopRecording();
    }

    // Parar reprodução se estiver tocando
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Limpar intervalos
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }

    // Limpar URL do áudio
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }

    // Limpar stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setState({
      isRecording: false,
      isPlaying: false,
      isPaused: false,
      recordingTime: 0,
      playbackTime: 0,
      duration: 0,
      audioBlob: null,
      audioUrl: null,
      mimeType: undefined,
      maxSizeBytes,
      reachedMaxSize: false,
    });
  }, [state.isRecording, state.audioUrl, stopRecording, maxSizeBytes]);

  const sendAudio = useCallback(() => {
    if (state.audioBlob) {
      onSendAudio(state.audioBlob);
      resetAudio();
    }
  }, [state.audioBlob, onSendAudio, resetAudio]);

  return {
    state,
    actions: {
      startRecording,
      stopRecording,
      playAudio,
      pauseAudio,
      resetAudio,
      sendAudio,
    },
    helpers: {
      // Tamanho acumulado atual em bytes
      getCurrentSize: () => totalSizeRef.current,
      // Estimativa simples de segundos máximos para limite no bitrate alvo
      getEstimatedMaxDurationSeconds: () => Math.floor((maxSizeBytes * 8) / targetBitsPerSecond),
    },
  };
}
