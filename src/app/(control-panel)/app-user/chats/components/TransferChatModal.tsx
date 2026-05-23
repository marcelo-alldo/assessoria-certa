import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Radio,
  Typography,
  CircularProgress,
  Box,
  InputAdornment,
} from '@mui/material';
import { useGetCollaboratorsQuery, CollaboratorType } from '../../collaborators/collaboratorsApi';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface TransferChatModalProps {
  open: boolean;
  onClose: () => void;
  onTransfer: (userUid: string) => void;
  loading?: boolean;
  chatName?: string;
}

function TransferChatModal({ open, onClose, onTransfer, loading = false, chatName = '' }: TransferChatModalProps) {
  const [selectedCollaborator, setSelectedCollaborator] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: collaboratorsResponse,
    isLoading: isLoadingCollaborators,
    error: collaboratorsError,
  } = useGetCollaboratorsQuery('', {
    skip: !open,
    refetchOnMountOrArgChange: true,
  });

  const collaborators = collaboratorsResponse?.data || [];

  // Filtrar colaboradores ativos e por termo de busca
  const filteredCollaborators = collaborators.filter((collaborator: CollaboratorType) => {
    const name = collaborator.user?.profile?.name || '';
    const email = collaborator.user?.profile?.email || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || email.toLowerCase().includes(searchTerm.toLowerCase());
    return collaborator.enable && matchesSearch;
  });

  const handleTransfer = () => {
    if (selectedCollaborator) {
      onTransfer(selectedCollaborator);
    }
  };

  const handleClose = () => {
    setSelectedCollaborator('');
    setSearchTerm('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { minHeight: 400 },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <FuseSvgIcon size={24}>material-outline:multiple_stop</FuseSvgIcon>
          <Typography variant="h6">Transferir Chat</Typography>
        </Box>
        {chatName && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Chat: {chatName}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent dividers>
        <TextField
          fullWidth
          placeholder="Buscar colaborador..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FuseSvgIcon size={20}>material-outline:search</FuseSvgIcon>
              </InputAdornment>
            ),
          }}
        />

        {isLoadingCollaborators ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : collaboratorsError ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <Typography color="error">Erro ao carregar colaboradores</Typography>
          </Box>
        ) : filteredCollaborators.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <Typography color="text.secondary">{searchTerm ? 'Nenhum colaborador encontrado' : 'Nenhum colaborador disponível'}</Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {filteredCollaborators.map((collaborator: CollaboratorType) => (
              <ListItem key={collaborator.uid} disablePadding>
                <ListItemButton
                  onClick={() => setSelectedCollaborator(collaborator.userUid)}
                  selected={selectedCollaborator === collaborator.userUid}
                >
                  <ListItemAvatar>
                    <Avatar src={collaborator.user?.profile?.avatar || undefined} alt={collaborator.user?.profile?.name || 'Colaborador'}>
                      {(collaborator.user?.profile?.name || 'C').charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={collaborator.user?.profile?.name || 'Nome não disponível'}
                    secondary={collaborator.user?.profile?.email || 'Email não disponível'}
                  />
                  <Radio checked={selectedCollaborator === collaborator.userUid} value={collaborator.userUid} name="collaborator-radio" />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleTransfer}
          variant="contained"
          disabled={!selectedCollaborator || loading}
          startIcon={loading ? <CircularProgress size={16} /> : <FuseSvgIcon size={16}>material-outline:multiple_stop</FuseSvgIcon>}
        >
          {loading ? 'Transferindo...' : 'Transferir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TransferChatModal;
