import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Slide, CircularProgress, Box } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import _ from 'lodash';
import { useAppDispatch } from '@/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useUpdateTagMutation } from '@/store/api/tagsApi';

const schema = z.object({
  name: z.string().min(1, 'Nome da tag é obrigatório'),
  color: z.string().min(1, 'Cor é obrigatória'),
});

type FormData = z.infer<typeof schema>;

interface CreateTagModalProps {
  open: boolean;
  onClose: () => void;
  refetch?: () => void;
}

const Transition = React.forwardRef(function Transition(props: TransitionProps & { children: React.ReactElement }, ref: React.Ref<unknown>) {
  return <Slide direction="up" ref={ref} {...props} />;
});

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

export default function CreateTagModal({ open, onClose, refetch }: CreateTagModalProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, dirtyFields, isValid },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      color: colorOptions[0],
    },
  });

  const [updateTag] = useUpdateTagMutation();
  const [isLoading, setIsLoading] = useState(false);
  const selectedColor = watch('color');

  const handleClose = () => {
    reset();
    onClose();
  };

  const dispatch = useAppDispatch();

  const submit = (data: FormData) => {
    setIsLoading(true);
    updateTag({
      name: data.name,
      color: data.color,
    })
      .unwrap()
      .then((response) => {
        if (refetch) refetch();
        handleClose();
        setIsLoading(false);
        dispatch(
          showMessage({
            message: response?.msg || 'Tag criada com sucesso!',
            autoHideDuration: 3000,
            variant: 'success',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
      })
      .catch((error) => {
        handleClose();
        setIsLoading(false);
        dispatch(
          showMessage({
            message: error?.data?.msg || 'Erro ao criar tag',
            autoHideDuration: 3000,
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
      });
  };

  return (
    <Dialog open={open} onClose={handleClose} TransitionComponent={Transition} maxWidth="sm" fullWidth>
      <DialogTitle>Nova Tag</DialogTitle>
      <form onSubmit={handleSubmit(submit)}>
        <DialogContent>
          <TextField
            label="Nome da Tag"
            fullWidth
            margin="normal"
            required
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
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
                        border: selectedColor === color ? '3px solid #333' : '2px solid #ddd',
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

          {selectedColor && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <span style={{ fontSize: '0.875rem', color: '#666' }}>Preview:</span>
              <Box
                sx={{
                  backgroundColor: selectedColor,
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
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" variant="contained" color="secondary" disabled={_.isEmpty(dirtyFields) || !isValid || isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Criar Tag'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
