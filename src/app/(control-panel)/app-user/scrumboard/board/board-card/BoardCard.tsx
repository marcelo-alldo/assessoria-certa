import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { Draggable } from '@hello-pangea/dnd';
import { useEffect, useState } from 'react';
import { format } from 'date-fns/format';
import { Avatar, AvatarGroup, Tooltip, useTheme, Chip, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'box-shadow 0.2s ease-in-out, transform 0.15s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-2px)',
  },
}));

type BoardCardProps = {
  card: any;
  index: number;
  boardId: string;
  refetch: () => void;
  setLoading: (loading: boolean) => void;
  type: 'leads' | 'clients';
  // Props centralizadas do Board
  config?: any;
  onChangeOwner?: (cardUid: string, type: 'leads' | 'clients') => Promise<void>;
  onTagSelect?: (cardUid: string, tagUid: string, tagName: string, type: 'leads' | 'clients') => Promise<void>;
  onArchiveToggle?: (cardUid: string, currentArchived: boolean, type: 'leads' | 'clients') => Promise<void>;
  onUpdateNotes?: (cardUid: string, notes: string, type: 'leads' | 'clients') => Promise<void>;
  centralizedLoading?: boolean;
  // Prop para abrir TagsDropdown centralizado
  onTagsClick?: (cardUid: string, event?: React.MouseEvent<HTMLElement>) => void;
  // Prop para abrir Modal de Anotações centralizada
  onNotesClick?: (cardUid: string, type: 'leads' | 'clients') => void;
};

/**
 * The board card component.
 */
function BoardCard(props: BoardCardProps) {
  const { card, index, setLoading, type, config, onChangeOwner, onArchiveToggle, onUpdateNotes, centralizedLoading, onTagsClick, onNotesClick } =
    props;
  const navigate = useNavigate();

  // Local state para menus (modal de anotações agora é centralizada)
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  // Efeito para controlar loading baseado no centralizedLoading
  useEffect(() => {
    if (centralizedLoading !== undefined) {
      setLoading(centralizedLoading);
    }
  }, [centralizedLoading, setLoading]);

  const theme = useTheme();

  const getRemoteJid = () => {
    const phone = card?.phone || card?.clientProfile?.phone;

    if (phone) {
      const digits = phone.replace(/\D/g, '');
      const withDdi = digits.startsWith('55') ? digits : '55' + digits;
      return withDdi;
    }

    return null;
  };

  const phone = getRemoteJid();
  const remoteJid = config?.data?.value + '-' + phone;
  const detailRoute = type === 'leads' ? `/leads/${card?.uid}` : `/clients/${card?.uid}`;
  const displayName = type === 'leads' ? card?.name : card?.clientProfile?.name;
  const displayPhone = card?.phone || card?.clientProfile?.phone;
  const tags = type === 'leads' ? (card?.leadTags || []).map((item: any) => item.tag) : (card?.clientTags || []).map((item: any) => item.tag);

  // Handlers — tags (agora usando função centralizada)
  const handleTagsClick = (event?: React.MouseEvent<HTMLElement>) => {
    if (!onTagsClick) return;

    setMenuAnchorEl(null);
    onTagsClick(card.uid, event);
  };

  // Handlers — archive
  const handleArchiveToggle = async () => {
    if (!onArchiveToggle) return;

    setMenuAnchorEl(null);
    try {
      await onArchiveToggle(card.uid, card.archived, type);
    } catch (error) {
      // Erro já tratado na função centralizada
    }
  };

  // Handlers — change owner
  const handleChangeOwner = async () => {
    if (!onChangeOwner) return;

    setMenuAnchorEl(null);
    try {
      await onChangeOwner(card.uid, type);
    } catch (error) {
      // Erro já tratado na função centralizada
    }
  };

  // Handler para anotações (agora usando função centralizada)
  const handleOpenNotes = () => {
    if (!onNotesClick) return;

    setMenuAnchorEl(null);
    onNotesClick(card.uid, type);
  };

  if (!card || card.archived) {
    return null;
  }

  return (
    <Draggable draggableId={card?.uid} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <StyledCard className={clsx(snapshot.isDragging ? 'shadow-lg' : 'shadow-sm', 'w-full mb-3 rounded-xl overflow-hidden')}>
            <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
              {/* Name */}
              {displayName && (
                <Typography
                  variant="body1"
                  sx={{ fontSize: '1rem', fontWeight: 600, color: theme.palette.text.primary, mb: 1, lineHeight: 1.3 }}
                  noWrap
                >
                  {displayName}
                </Typography>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                  {tags.map((tag: any) => (
                    <Chip
                      key={tag.uid}
                      label={tag.name}
                      size="small"
                      sx={{
                        backgroundColor: tag.color || '#e0e0e0',
                        color: '#fff',
                        fontWeight: 500,
                        fontSize: '0.7rem',
                        height: 20,
                      }}
                    />
                  ))}
                </Box>
              )}

              {/* Phone */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                <PhoneOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {displayPhone || '—'}
                </Typography>
              </Box>

              {/* Dates */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <AccessTimeOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {format(card?.createdAt, 'dd/MM/yyyy')}
                  {' · '}
                  {format(card?.updatedAt, 'dd/MM/yyyy HH:mm')}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mx: 1 }} />

            {/* Footer */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, py: 0.5 }}>
              {/* Owner avatar */}
              <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.7rem' } }}>
                {card?.stepUid === import.meta.env.VITE_APP_START_CONVERSATION_UID && (
                  <Tooltip title="Alldo">
                    <Avatar
                      alt="alldo"
                      src="./assets/images/logo/alldo-sem-fundo-face.png"
                      sx={{ bgcolor: theme.palette.secondary.main, width: 28, height: 28 }}
                    />
                  </Tooltip>
                )}
                {card?.ownerUid && (
                  <Tooltip title={card?.owner?.profile?.name}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem !important', color: theme.palette.secondary.contrastText }}>
                      {card?.owner?.profile?.name
                        ? card.owner.profile.name
                            .split(' ')
                            .map((n: string) => n[0]?.toUpperCase())
                            .join('')
                        : ''}
                    </Avatar>
                  </Tooltip>
                )}
              </AvatarGroup>

              {/* Actions */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {card?.conversation === 'not_working' && (
                  <Tooltip title="Não foi possível iniciar a conversa">
                    <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: theme.palette.error.main, mr: 0.5 }} />
                  </Tooltip>
                )}

                <Tooltip title="Abrir chat">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/chats/${remoteJid}`);
                    }}
                  >
                    <ChatOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Ver detalhes">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(detailRoute);
                    }}
                  >
                    <OpenInNewOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>

                {/* Anchor invisível para o TagsDropdown */}
                <span id={`tags-anchor-${card?.uid}`} style={{ width: 0, height: 0, display: 'inline-block' }} />

                <Tooltip title="Mais ações">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuAnchorEl(e.currentTarget);
                    }}
                  >
                    <MoreVertIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </StyledCard>

          {/* More actions menu */}
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={() => setMenuAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{ paper: { sx: { minWidth: 200, borderRadius: 2 } } }}
          >
            <MenuItem onClick={handleChangeOwner} disabled={centralizedLoading}>
              <ListItemIcon>
                <SupervisorAccountOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Assumir atendimento</ListItemText>
            </MenuItem>

            <MenuItem onClick={() => handleTagsClick()}>
              <ListItemIcon>
                <LocalOfferOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Adicionar tags</ListItemText>
            </MenuItem>

            <MenuItem onClick={handleOpenNotes}>
              <ListItemIcon>
                <InfoOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Anotações</ListItemText>
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleArchiveToggle} disabled={centralizedLoading}>
              <ListItemIcon>
                <ArchiveOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{card?.archived ? 'Desarquivar' : 'Arquivar'}</ListItemText>
            </MenuItem>
          </Menu>
        </div>
      )}
    </Draggable>
  );
}

export default BoardCard;
