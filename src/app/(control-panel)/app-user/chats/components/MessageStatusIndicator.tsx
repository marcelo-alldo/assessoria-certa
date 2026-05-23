import React from 'react';
import { useTheme } from '@mui/material';

interface MessageStatusIndicatorProps {
  status?: string;
}

const MessageStatusIndicator: React.FC<MessageStatusIndicatorProps> = ({ status }) => {
  const theme = useTheme();

  // Só mostra indicadores para mensagens enviadas por mim
  if (!status) {
    return null;
  }

  const getStatusIcon = () => {
    const baseStyle = {
      width: 16,
      height: 16,
      display: 'inline-block',
      marginLeft: 4,
    };

    switch (status) {
      case 'sent':
        // 1 tick cinza - mensagem enviada
        return (
          <svg {...baseStyle} viewBox="0 0 16 16" fill="none">
            <path d="M6 10.5L3.5 8L2.5 9L6 12.5L13.5 5L12.5 4L6 10.5Z" fill={theme.palette.mode === 'dark' ? '#8696a0' : '#667781'} />
          </svg>
        );

      case 'delivered':
        // 2 ticks cinza - mensagem entregue
        return (
          <svg {...baseStyle} viewBox="0 0 16 16" fill="none">
            <path d="M4.5 10.5L2 8L1 9L4.5 12.5L12 5L11 4L4.5 10.5Z" fill={theme.palette.mode === 'dark' ? '#8696a0' : '#667781'} />
            <path d="M8.5 10.5L6 8L5 9L8.5 12.5L16 5L15 4L8.5 10.5Z" fill={theme.palette.mode === 'dark' ? '#8696a0' : '#667781'} />
          </svg>
        );

      case 'read':
        // 2 ticks azuis - mensagem visualizada
        return (
          <svg {...baseStyle} viewBox="0 0 16 16" fill="none">
            <path d="M4.5 10.5L2 8L1 9L4.5 12.5L12 5L11 4L4.5 10.5Z" fill="#53bdeb" />
            <path d="M8.5 10.5L6 8L5 9L8.5 12.5L16 5L15 4L8.5 10.5Z" fill="#53bdeb" />
          </svg>
        );

      default:
        // Relógio - mensagem pendente
        return (
          <svg {...baseStyle} viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke={theme.palette.mode === 'dark' ? '#8696a0' : '#667781'} strokeWidth="1" fill="none" />
            <path
              d="M8 4V8L11 11"
              stroke={theme.palette.mode === 'dark' ? '#8696a0' : '#667781'}
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
    }
  };

  return <span style={{ display: 'inline-flex', alignItems: 'center' }}>{getStatusIcon()}</span>;
};

export default MessageStatusIndicator;
