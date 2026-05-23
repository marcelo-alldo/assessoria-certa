import { Grid, LinearProgress, styled, useTheme, Tabs, Tab, Tooltip, TextField, Box, InputAdornment, IconButton } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import ChatsFirstScreen from './components/ChatsFirstScreen';
import ChatsDefault from './components/ChatsDefault';
import { useParams } from 'react-router';
import ChatScreen from './components/ChatScreen';
import { useEffect, useState } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useThemeMediaQuery } from '@fuse/hooks';
import { collection, onSnapshot, orderBy, query, getDocs, limit } from 'firebase/firestore';
import { db } from '@/configs/firebase';
import { useGetConfigsQuery } from '@/store/api/configsApi';
import useAuth from '@fuse/core/FuseAuthProvider/useAuth';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .container': {
    maxWidth: '100%!important',
    height: '100%',
    overflowY: 'hidden !important',
  },
  '& .FusePageSimple-content': {
    height: '80vh',
  },
  '& .FusePageSimple-header': {
    backgroundColor: theme.vars.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.vars.palette.divider,
  },
}));

/**
 * The Chats.
 */

function Chats() {
  const { remoteJid } = useParams();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const { authState } = useAuth();

  //DEFAULT 25
  const [chatsLimit, setChatsLimit] = useState(25);
  const [chatsData, setChatsData] = useState([]);
  const [totalChats, setTotalChats] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: config, isLoading } = useGetConfigsQuery('key=WHATSAPP', { refetchOnMountOrArgChange: true });

  useEffect(() => {
    const collectionPath = 'chats/' + (config?.data?.value || '') + '/conversations';

    let unsubChat = () => {};
    let unTotalChat = () => {};

    if (config?.data?.value) {
      try {
        unTotalChat = onSnapshot(collection(db, collectionPath), (snapshot) => {
          setTotalChats(snapshot.size);
        });

        unsubChat = onSnapshot(
          query(collection(db, collectionPath), orderBy('updatedAt', 'desc'), limit(chatsLimit)),
          async (snapshot) => {
            // Se a collection não existe, snapshot.docs estará vazio
            if (snapshot.empty) {
              setChatsData([]);
            } else {
              const chatsDb = snapshot.docs.map((doc) => (doc.id ? { ...doc.data(), id: doc.id } : doc.data()));

              // Processar cada chat para obter a última mensagem
              const chatsWithLastMessage = await Promise.all(
                chatsDb.map(async (chat) => {
                  try {
                    // Buscar a última mensagem do chat
                    const messagesPath = `chats/${config?.data?.value}/conversations/${chat.id}/messages`;
                    const lastMessageQuery = query(collection(db, messagesPath), orderBy('timestamp', 'desc'), limit(1));

                    const lastMessageSnapshot = await getDocs(lastMessageQuery);
                    let lastMessage = null;

                    if (!lastMessageSnapshot.empty) {
                      const lastMessageDoc = lastMessageSnapshot.docs[0];
                      const messageData = lastMessageDoc.data();

                      if (messageData.type === 'text') {
                        let fullText = messageData.body;
                        fullText = fullText.replace(/\*[^*]*\*/g, '');
                        lastMessage = fullText.length > 50 ? `${fullText.substring(0, 50)}...` : fullText;
                      } else if (messageData.type === 'image') {
                        lastMessage = 'Imagem';
                      } else if (messageData.type === 'audio') {
                        lastMessage = 'Mensagem de áudio';
                      } else if (messageData.type === 'document') {
                        lastMessage = 'Documento';
                      } else if (messageData.type === 'attendantHistory') {
                        lastMessage = 'Troca de atendente';
                      } else {
                        lastMessage = 'Mensagem';
                      }
                    }

                    return {
                      ...chat,
                      lastMessage,
                    };
                  } catch (error) {
                    console.error(`Erro ao buscar última mensagem para chat ${chat.id}:`, error);
                    return {
                      ...chat,
                      lastMessage: null,
                    };
                  }
                }),
              );

              setChatsData(chatsWithLastMessage);
            }
          },
          (error) => {
            // Trata erro de collection inexistente ou permissão
            console.error('Erro ao buscar chats:', error);
            setChatsData([]);
          },
        );
      } catch (err) {
        console.error('Erro ao inicializar listener:', err);
        setChatsData([]);
        setTotalChats(0);
      }
    }

    setTimeout(() => {
      setLoading(false);
    }, 2000);

    // Limpeza quando o componente desmonta
    return () => {
      unsubChat();
      unTotalChat();
    };
  }, [config, chatsLimit]);

  const theme = useTheme();
  const [tab, setTab] = useState(0);

  // Filtros dos chats - chats IN_PROGRESS agora aparecem em "Em atendimento"
  const filteredChats = chatsData.filter((chat) => {
    // Primeiro aplica o filtro de busca
    const matchesSearch = searchTerm === '' || chat.name?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (tab === 0) return true; // Todos os chats

    if (tab === 1) return chat.status === 'IN_PROGRESS'; // Em atendimento - chats IN_PROGRESS

    if (tab === 2) return chat.owner === authState?.user?.uid; // Meus atendimentos - apenas chats IN_PROGRESS do usuário logado

    return true;
  });

  return (
    <Root
      header={
        <>
          {(loading || isLoading) && (
            <div className="w-full">
              <LinearProgress color="secondary" />
            </div>
          )}
          {/* <ChatsHeader /> */}
        </>
      }
      content={
        !loading && (
          <Grid container className="flex flex-1 h-full" style={{ height: '100%' }}>
            {(!isMobile || (isMobile && !remoteJid)) && (
              <Grid
                size={{ lg: 3, xs: 12 }}
                style={{
                  height: '100%',
                  overflowY: 'auto',
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRight: `1px solid ${theme.palette.mode === 'dark' ? '#161717' : '#fff'}`,
                  background: theme.palette.mode === 'dark' ? '#161717' : '#fff',
                  padding: 0,
                }}
              >
                {/* Tabs para filtrar chats */}
                <Box
                  sx={{
                    padding: '16px 16px 12px',
                    borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
                    background: theme.palette.mode === 'dark' ? '#1a1c1e' : '#fff',
                  }}
                >
                  <TextField
                    variant="outlined"
                    placeholder="Buscar contato..."
                    fullWidth
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        // borderRadius: '12px',
                        fontSize: 14,
                        background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
                        '& fieldset': { border: 'none' },
                        '&:hover fieldset': { border: 'none' },
                        '&.Mui-focused fieldset': { border: `1.5px solid ${theme.palette.secondary.main}` },
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FuseSvgIcon size={18} color="disabled">
                            material-outline:search
                          </FuseSvgIcon>
                        </InputAdornment>
                      ),
                      endAdornment: searchTerm ? (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setSearchTerm('')}>
                            <FuseSvgIcon size={16} color="disabled">
                              material-outline:close
                            </FuseSvgIcon>
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                    }}
                  />
                </Box>
                <Tabs
                  value={tab}
                  onChange={(_, v) => setTab(v)}
                  variant="fullWidth"
                  sx={{
                    borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#23272a' : '#e0e0e0'}`,
                    color: theme.palette.mode === 'dark' ? '#e0e0e0' : '#23272a',
                    '& .MuiTab-root': {
                      '&.Mui-selected': {
                        color: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.primary.main,
                      },
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.primary.main,
                    },
                  }}
                >
                  <Tab
                    label={
                      <Tooltip title="Todos os chats">
                        <FuseSvgIcon size={28}>material-outline:format_list_bulleted</FuseSvgIcon>
                      </Tooltip>
                    }
                  />
                  <Tab
                    label={
                      <Tooltip title="Em atendimento">
                        <FuseSvgIcon size={28}>material-outline:chat</FuseSvgIcon>
                      </Tooltip>
                    }
                  />
                  <Tab
                    label={
                      <Tooltip title="Meus atendimentos">
                        <FuseSvgIcon size={28}>material-outline:account_circle</FuseSvgIcon>
                      </Tooltip>
                    }
                  />
                </Tabs>
                <ChatsDefault chats={filteredChats} total={totalChats} setChatsLimit={setChatsLimit} chatsLimit={chatsLimit} isLoading={loading} />
              </Grid>
            )}

            {/*  TODO:  */}
            <Grid size={{ lg: 9, xs: 12 }} sx={{ height: '100%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              {remoteJid ? <ChatScreen setLoading={setLoading} config={config} /> : <ChatsFirstScreen />}
            </Grid>
          </Grid>
        )
      }
    />
  );
}

export default Chats;
