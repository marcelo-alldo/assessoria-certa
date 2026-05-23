import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

interface AudioPlayerProps {
  audioSrc: string;
  fromMe: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioSrc, fromMe }) => {
  const theme = useTheme();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e: Event) => {
      console.error('Erro no AudioPlayer:', e);
      setIsPlaying(false);
      // Tentar recarregar o áudio uma vez
      if (audio.src && !audio.src.includes('retry=true')) {
        const separator = audio.src.includes('?') ? '&' : '?';
        audio.src = audio.src + separator + 'retry=true';
        audio.load();
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => {
        console.error('Erro ao reproduzir áudio:', error);
        setIsPlaying(false);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);

    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const primaryColor = fromMe ? (theme.palette.mode === 'dark' ? '#4CAF50' : '#25D366') : theme.palette.mode === 'dark' ? '#64B5F6' : '#2196F3';

  const backgroundColor = fromMe ? (theme.palette.mode === 'dark' ? '#144D37' : '#D9FDD3') : theme.palette.mode === 'dark' ? '#242626' : '#FFFFFF';

  const textColor = theme.palette.mode === 'dark' ? '#fff' : '#222';
  const secondaryTextColor = theme.palette.mode === 'dark' ? '#b9bbbe' : '#666';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px',
        backgroundColor,
        borderRadius: '8px',
        minWidth: '280px',
        maxWidth: '320px',
      }}
    >
      <audio ref={audioRef} src={audioSrc} preload="metadata" crossOrigin="anonymous" />

      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        style={{
          background: primaryColor,
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'white',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
      </button>

      {/* Progress and Time */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          style={{
            width: '100%',
            height: '4px',
            background: `linear-gradient(to right, ${primaryColor} 0%, ${primaryColor} ${(currentTime / duration) * 100}%, ${theme.palette.mode === 'dark' ? '#444' : '#ddd'} ${(currentTime / duration) * 100}%, ${theme.palette.mode === 'dark' ? '#444' : '#ddd'} 100%)`,
            borderRadius: '2px',
            outline: 'none',
            cursor: 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none',
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: secondaryTextColor,
          }}
        >
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume Control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          onClick={toggleMute}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: secondaryTextColor,
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isMuted || volume === 0 ? <VolumeOffIcon style={{ fontSize: '18px' }} /> : <VolumeUpIcon style={{ fontSize: '18px' }} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          style={{
            width: '60px',
            height: '3px',
            background: `linear-gradient(to right, ${primaryColor} 0%, ${primaryColor} ${(isMuted ? 0 : volume) * 100}%, ${theme.palette.mode === 'dark' ? '#444' : '#ddd'} ${(isMuted ? 0 : volume) * 100}%, ${theme.palette.mode === 'dark' ? '#444' : '#ddd'} 100%)`,
            borderRadius: '2px',
            outline: 'none',
            cursor: 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none',
          }}
        />
      </div>

      <style>
        {`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: ${primaryColor};
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          
          input[type="range"]::-moz-range-thumb {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: ${primaryColor};
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
        `}
      </style>
    </div>
  );
};

export default AudioPlayer;
