import React, { useState } from 'react';
import {
  Popover,
  Button,
  Typography,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Checkbox,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useGetTagsQuery, useUpdateTagMutation, useDeleteTagMutation } from '../store/api/tagsApi';
import CreateTagModal from './CreateTagModal';
import DefaultConfirmModal from './DefaultConfirmModal';
import { useAppDispatch } from '../store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';

const colorOptions = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
  '#F8C471',
  '#82E0AA',
  '#F1948A',
  '#85C1E9',
  '#D7BDE2',
];

const TagsDropdown = ({ anchorEl, open, onClose, onTagSelect, cardTags = [] }) => {
  const [openCreateTagModal, setOpenCreateTagModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);

  const dispatch = useAppDispatch();

  const { data: tagsResponse, isLoading, refetch } = useGetTagsQuery();
  const [updateTag, { isLoading: isLoadingUpdateTag }] = useUpdateTagMutation();
  const [deleteTag, { isLoading: isLoadingDeleteTag }] = useDeleteTagMutation();

  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      name: '',
      color: colorOptions[0],
    },
  });

  // Extrair as tags da resposta da API
  const tags = tagsResponse?.data || [];

  const handleTagClick = (tag: any) => {
    const isSelected = isTagSelected(tag.uid);
    onTagSelect(tag, isSelected);
  };

  const handleCreateTagClick = () => {
    setOpenCreateTagModal(true);
  };

  const handleCloseCreateTagModal = () => {
    setOpenCreateTagModal(false);
  };

  const handleEditTag = (tag) => {
    setEditingTag(tag);
    reset({
      name: tag.name,
      color: tag.color,
    });
    setOpenEditDialog(true);
  };

  const handleEditTagSave = async (data) => {
    if (editingTag && data.name.trim()) {
      try {
        await updateTag({
          uid: editingTag.uid,
          name: data.name.trim(),
          color: data.color,
          update: true,
        }).unwrap();
        setOpenEditDialog(false);
        setEditingTag(null);
        reset();
        refetch();
      } catch (error) {
        console.error('Erro ao atualizar tag:', error);
      }
    }
  };

  const handleEditTagCancel = () => {
    setOpenEditDialog(false);
    setEditingTag(null);
    reset();
  };

  const handleDeleteTag = async (tagUid) => {
    setTagToDelete(tagUid);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (tagToDelete) {
      try {
        await deleteTag(tagToDelete).unwrap();
        refetch();
        setOpenDeleteModal(false);
        setTagToDelete(null);
        dispatch(
          showMessage({
            message: 'Tag excluída com sucesso!',
            autoHideDuration: 3000,
            variant: 'success',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
      } catch (error) {
        console.error('Erro ao excluir tag:', error);
        setOpenDeleteModal(false);
        setTagToDelete(null);
        dispatch(
          showMessage({
            message: error?.data?.msg || 'Erro ao excluir tag',
            autoHideDuration: 3000,
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
      }
    }
  };

  const handleCancelDelete = () => {
    setOpenDeleteModal(false);
    setTagToDelete(null);
  };

  const isTagSelected = (tagId: string) => {
    return cardTags.some((cardTag) => cardTag.uid === tagId);
  };

  return (
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            width: 280,
            maxHeight: 400,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Tags Disponíveis
          </Typography>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <>
              {tags && tags.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  {tags.map((tag: any) => (
                    <Box key={tag.uid} sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                        <Checkbox
                          checked={isTagSelected(tag.uid)}
                          onChange={() => handleTagClick(tag)}
                          sx={{
                            color: tag.color,
                            '&.Mui-checked': {
                              color: tag.color,
                            },
                            padding: 0,
                            width: '16px',
                            height: '16px',
                            flexShrink: 0,
                          }}
                        />
                        <Chip
                          label={tag.name}
                          title={tag.name}
                          onClick={() => handleTagClick(tag)}
                          sx={{
                            backgroundColor: tag.color,
                            color: '#fff',
                            fontWeight: 500,
                            cursor: 'pointer',
                            flex: 1,
                            justifyContent: 'flex-start',
                            minWidth: 0,
                            '&:hover': {
                              backgroundColor: `${tag.color}dd`,
                            },
                            '& .MuiChip-label': {
                              paddingLeft: '12px',
                              paddingRight: '12px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              width: '100%',
                            },
                          }}
                        />
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTag(tag);
                        }}
                      >
                        <FuseSvgIcon size={16}>heroicons-outline:pencil</FuseSvgIcon>
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTag(tag.uid);
                        }}
                        sx={{ color: 'error.main' }}
                      >
                        <FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  Nenhuma tag encontrada
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Button
                variant="outlined"
                fullWidth
                startIcon={<FuseSvgIcon size={16}>heroicons-outline:plus</FuseSvgIcon>}
                onClick={handleCreateTagClick}
                sx={{
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  py: 1.5,
                  '&:hover': {
                    borderStyle: 'dashed',
                    borderWidth: 2,
                  },
                }}
              >
                Criar Nova Tag
              </Button>
            </>
          )}
        </Box>
      </Popover>

      <CreateTagModal open={openCreateTagModal} onClose={handleCloseCreateTagModal} refetch={refetch} />

      {/* Dialog para editar tag */}
      <Dialog open={openEditDialog} onClose={handleEditTagCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Tag</DialogTitle>
        <form onSubmit={handleSubmit(handleEditTagSave)}>
          <DialogContent>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField {...field} autoFocus margin="dense" label="Nome da Tag" fullWidth variant="outlined" sx={{ mb: 2 }} />
              )}
            />

            <Box sx={{ mt: 2, mb: 1 }}>
              <label style={{ fontSize: '0.875rem', color: '#666', marginBottom: '8px', display: 'block' }}>Cor da Tag</label>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {colorOptions.map((color) => (
                      <Box
                        key={color}
                        onClick={() => field.onChange(color)}
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: color,
                          borderRadius: '50%',
                          cursor: 'pointer',
                          border: watch('color') === color ? '3px solid #333' : '2px solid #ddd',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          },
                        }}
                      />
                    ))}
                  </Box>
                )}
              />
            </Box>

            {watch('color') && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ fontSize: '0.875rem', color: '#666' }}>Preview:</span>
                <Box
                  sx={{
                    backgroundColor: watch('color'),
                    color: '#fff',
                    px: 2,
                    py: 0.5,
                    borderRadius: '16px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  {watch('name') || 'Nome da Tag'}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditTagCancel}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={isLoadingUpdateTag}>
              {isLoadingUpdateTag ? <CircularProgress size={24} /> : 'Salvar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <DefaultConfirmModal
        open={openDeleteModal}
        title="Excluir Tag"
        message="Tem certeza que deseja excluir esta tag?"
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmColor="error"
        loading={isLoadingDeleteTag}
      />
    </>
  );
};

export default TagsDropdown;
