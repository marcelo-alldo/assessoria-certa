/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, Box, Typography, useTheme } from '@mui/material';
import { format, isThisWeek, isToday, isYesterday } from 'date-fns';
import { useNavigate, useParams } from 'react-router';
import { ptBR } from 'date-fns/locale';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useEffect, useState } from 'react';
import { useGetLeadsQuery } from '@/store/api/leadsApi';
import { useGetClientsQuery } from '@/store/api/clientsApi';

interface ChatsProps {
  chats: any[];
  total: number;
  setChatsLimit: (limit: number) => void;
  chatsLimit: number;
  isLoading?: boolean;
}

function getDateLabel(date: Date) {
  if (isToday(date)) return format(new Date(date), 'HH:mm');

  if (isYesterday(date)) return 'Ontem';

  if (isThisWeek(date, { weekStartsOn: 0 })) {
    return format(date, 'EEEE', { locale: ptBR });
  }

  return format(date, 'dd/MM/yyyy');
}

function ChatsDefault({ chats, total, setChatsLimit, chatsLimit, isLoading }: ChatsProps) {
  const { remoteJid } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [phonesClients, setPhonesClients] = useState<string | null>(null);
  const [phonesLeads, setPhonesLeads] = useState<string | null>(null);
  const [localChats, setLocalChats] = useState<any[]>([]);

  //Busca lista de leads e clientes para exibir na listagem de chats
  const {
    data: leads,
    isLoading: isLoadingLeads,
    isFetching: isFetchingLeads,
  } = useGetLeadsQuery(`pageSize=${chatsLimit}&phones=${phonesLeads}`, { refetchOnMountOrArgChange: true, skip: !phonesLeads });

  const {
    data: clients,
    isLoading: isLoadingClients,
    isFetching: isFetchingClients,
  } = useGetClientsQuery(`&pageSize=${chatsLimit}&phones=${phonesClients}`, { refetchOnMountOrArgChange: true, skip: !phonesClients });

  useEffect(() => {
    if (chats?.length > 0) {
      let tempPhonesClients = '';
      let tempPhonesLeads = '';
      chats.forEach((chat) => {
        if (chat?.type === 'client') {
          const phone = chat?.id?.split('-')[1];
          tempPhonesClients = tempPhonesClients ? tempPhonesClients + ',' + phone : phone;
        }

        if (chat?.type === 'lead') {
          const phone = chat?.id?.split('-')[1];
          tempPhonesLeads = tempPhonesLeads ? tempPhonesLeads + ',' + phone : phone;
        }
      });
      setPhonesClients(tempPhonesClients || null);
      setPhonesLeads(tempPhonesLeads || null);
    }

    setLocalChats(chats);
  }, [chats]);

  useEffect(() => {
    if (clients?.data.length || leads?.data.length) {
      const updatedChats = chats.map((chat) => {
        if (chat?.type === 'client') {
          const phone = chat?.id?.split('-')[1];
          const rawPhone = phone.startsWith('55') ? phone.slice(2) : phone;
          const ddd = rawPhone.slice(0, 2);
          const local = rawPhone.slice(2);
          const localWith9 = local.length === 8 ? '9' + local : local;
          const localWithout9 = local.length === 9 ? local.slice(1) : local;
          const formattedPhone1 = `(${ddd}) ${localWithout9.slice(0, 4)}-${localWithout9.slice(4)}`;
          const formattedPhone2 = `(${ddd}) ${localWith9.slice(0, 5)}-${localWith9.slice(5)}`;

          const matchedClient = clients?.data.find(
            (client) =>
              client.clientProfile?.phone?.includes(formattedPhone1) ||
              client.clientProfile?.phone?.includes(formattedPhone2) ||
              client.clientProfile?.phone?.includes(phone),
          );

          if (matchedClient) {
            return {
              ...chat,
              name: matchedClient.clientProfile?.name || chat?.name,
              tags: matchedClient?.clientTags || [],
            };
          }
        }

        if (chat?.type === 'lead') {
          const phone = chat?.id?.split('-')[1];
          const rawPhone = phone.startsWith('55') ? phone.slice(2) : phone;
          const ddd = rawPhone.slice(0, 2);
          const local = rawPhone.slice(2);
          const localWith9 = local.length === 8 ? '9' + local : local;
          const localWithout9 = local.length === 9 ? local.slice(1) : local;
          const formattedPhone1 = `(${ddd}) ${localWithout9.slice(0, 4)}-${localWithout9.slice(4)}`;
          const formattedPhone2 = `(${ddd}) ${localWith9.slice(0, 5)}-${localWith9.slice(5)}`;
          const matchedLead = leads?.data.find(
            (lead) => lead.phone?.includes(formattedPhone1) || lead.phone?.includes(formattedPhone2) || lead.phone?.includes(phone),
          );

          if (matchedLead) {
            return {
              ...chat,
              name: matchedLead.name || chat?.name,
              // tags: matchedLead?.leadTags || [],
            };
          }
        }

        return chat;
      });
      setLocalChats(updatedChats);
    }
  }, [clients, leads, chats]);

  console.log('chats originais', chats);
  console.log('chats para exibição', localChats);

  const isDark = theme.palette.mode === 'dark';

  if (isLoadingLeads || isFetchingLeads || isLoadingClients || isFetchingClients) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <FuseSvgIcon size={24} className="animate-spin" color="disabled">
          material-outline:autorenew
        </FuseSvgIcon>
        <Typography variant="subtitle1" sx={{ ml: 1, color: isDark ? '#b9bbbe' : '#888' }}>
          Carregando contatos...
        </Typography>
      </div>
    );
  }

  const avatarColors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
  const getAvatarColor = (name: string) => {
    if (!name) return avatarColors[0];

    const nameString = String(name);
    const idx = nameString?.charCodeAt(0) % avatarColors.length;
    return avatarColors[idx];
  };

  const lastMsgIcon: Record<string, string> = {
    'Mensagem de áudio': 'material-outline:mic',
    Imagem: 'material-outline:image',
    Vídeo: 'material-outline:videocam',
    Documento: 'material-outline:description',
    Figurinha: 'material-outline:sticker',
    Contato: 'material-outline:contact_page',
    'Troca de atendente': 'material-outline:swap_horiz',
  };

  function renderLastMsg(lastMsg: any) {
    if (!lastMsg) return <span style={{ fontStyle: 'italic', opacity: 0.5 }}>sem mensagens</span>;

    if (typeof lastMsg === 'string' && lastMsgIcon[lastMsg]) {
      return (
        <>
          <FuseSvgIcon size={14} style={{ color: isDark ? '#b9bbbe' : '#888', flexShrink: 0 }}>
            {lastMsgIcon[lastMsg]}
          </FuseSvgIcon>
          <span>{lastMsg}</span>
        </>
      );
    }

    return <span>{lastMsg}</span>;
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', height: '100%', background: isDark ? '#161717' : '#f7f8fa' }}>
      {chats?.length ? (
        <>
          {localChats?.map((chat) => {
            const isActive = chat?.id === remoteJid;
            const displayName = chat?.name || (chat?.id ? chat?.id.split('-')[1] : '');
            const avatarLetter = displayName?.[0]?.toUpperCase() || '?';
            const avatarColor = getAvatarColor(displayName);
            const unread = chat?.unReadMessages ?? 0;

            return (
              <Box
                key={chat?.id}
                onClick={() => navigate(`/chats/${chat?.id}`)}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  position: 'relative',
                  borderLeft: isActive ? `3px solid ${isDark ? theme.palette.secondary.main : theme.palette.primary.main}` : '3px solid transparent',
                  background: isActive ? (isDark ? 'rgba(255,255,255,0.06)' : '#eef2ff') : 'transparent',
                  borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                  transition: 'background 0.15s, border-left-color 0.15s',
                  '&:hover': {
                    background: isActive ? (isDark ? 'rgba(255,255,255,0.08)' : '#e8eeff') : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  },
                }}
              >
                {/* Avatar */}
                <Avatar
                  sx={{
                    width: 46,
                    height: 46,
                    flexShrink: 0,
                    fontSize: 18,
                    fontWeight: 700,
                    bgcolor: avatarColor,
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                >
                  {avatarLetter}
                </Avatar>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Row 1: name + date */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div
                      style={{
                        fontWeight: unread > 0 ? 700 : 600,
                        fontSize: 14,
                        color: isDark ? '#f1f3f5' : '#1a1a2e',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: 1,
                      }}
                    >
                      {displayName}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: unread > 0 ? 600 : 400,
                        color: unread > 0 ? (isDark ? '#21C063' : '#1DAA61') : isDark ? '#6b7280' : '#9ca3af',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {getDateLabel(new Date(chat?.updatedAt * 1000))}
                    </div>
                  </div>

                  {/* Row 2: last message + badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 2 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: unread > 0 ? 500 : 400,
                        color: isDark ? '#9ca3af' : '#6b7280',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        flex: 1,
                      }}
                    >
                      {renderLastMsg(chat?.lastMessage)}
                    </div>
                    {unread > 0 && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isDark ? '#21C063' : '#1DAA61',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 10,
                          minWidth: 18,
                          height: 18,
                          borderRadius: 9,
                          padding: '0 4px',
                          flexShrink: 0,
                          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                        }}
                      >
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </div>

                  {/* Row 3: type chip + tags */}
                  {(chat?.type || chat?.tags?.length > 0) && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                      {chat?.type && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: 10,
                            background: chat.type === 'lead' ? `${theme.palette.secondary.main}` : `${theme.palette.primary.main}`,
                            color: '#fff',
                            letterSpacing: '0.3px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {chat.type === 'client' ? 'Apoiador' : 'Eleitor'}
                        </span>
                      )}
                      {chat?.tags?.map((tag: any) => (
                        <span
                          key={tag?.uid ?? tag}
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: 10,
                            background: tag?.tag?.color ? `${tag.tag.color}` : 'rgba(156,163,175,0.2)',
                            color: theme.palette.mode === 'dark' ? 'black' : 'white',
                            letterSpacing: '0.3px',
                          }}
                        >
                          {tag?.tag?.name ?? tag?.tagUid ?? tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Box>
            );
          })}

          {chats?.length < total && chatsLimit < total ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                gap: 1,
                opacity: isLoading ? 0.5 : 1,
                pointerEvents: isLoading ? 'none' : 'auto',
                color: isDark ? '#9ca3af' : '#6b7280',
                fontSize: 13,
                fontWeight: 500,
                transition: 'opacity 0.2s',
                '&:hover': { opacity: 0.75 },
              }}
              onClick={() => setChatsLimit(chatsLimit + 25)}
            >
              <FuseSvgIcon size={18}>material-outline:expand_more</FuseSvgIcon>
              Carregar mais
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px',
                color: isDark ? '#4b5563' : '#d1d5db',
                fontSize: 12,
                gap: 0.5,
              }}
            >
              <FuseSvgIcon size={14} color="disabled">
                material-outline:check_circle
              </FuseSvgIcon>
              Todos os contatos carregados
            </Box>
          )}
        </>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 12,
            color: isDark ? '#4b5563' : '#d1d5db',
          }}
        >
          <FuseSvgIcon size={48} color="disabled">
            material-outline:chat_bubble_outline
          </FuseSvgIcon>
          <span style={{ fontSize: 14 }}>Nenhum contato encontrado</span>
        </div>
      )}
    </div>
  );
}

export default ChatsDefault;
