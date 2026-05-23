import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Slide, CircularProgress } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IMaskInput } from 'react-imask';
import _ from 'lodash';
import { useAppDispatch } from '@/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useCreateClientMutation } from '@/store/api/clientsApi';

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

interface CreateClientModalProps {
  open: boolean;
  onClose: () => void;
  refetch: () => void;
}

const Transition = React.forwardRef(function Transition(props: TransitionProps & { children: React.ReactElement }, ref: React.Ref<unknown>) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CreateClientModal({ open, onClose, refetch }: CreateClientModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields, isValid },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [createClient] = useCreateClientMutation();
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    reset();
    onClose();
  };

  const dispatch = useAppDispatch();

  const submit = (data: FormData) => {
    setIsLoading(true);
    createClient({
      name: data.name,
      phone: data.phone,
      email: data.email,
    })
      .unwrap()
      .then((response) => {
        refetch();
        handleClose();
        setIsLoading(false);
        dispatch(
          showMessage({
            message: response?.msg,
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
            message: error?.data?.msg,
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
    <Dialog open={open} onClose={handleClose} TransitionComponent={Transition}>
      <DialogTitle>Novo Cliente</DialogTitle>
      <form onSubmit={handleSubmit(submit)}>
        <DialogContent>
          <TextField label="Nome" fullWidth margin="normal" required {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
          <TextField
            label="Telefone"
            fullWidth
            margin="normal"
            required
            error={!!errors.phone}
            helperText={errors.phone?.message}
            // InputLabelProps={{ shrink: true }}
            InputProps={{
              inputComponent: IMaskInput,
              inputProps: {
                mask: ['(00) 0000-0000', '(00) 00000-0000'],
              },
            }}
            {...register('phone')}
          />

          <TextField label="E-mail" fullWidth margin="normal" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            // disabled={_.isEmpty(dirtyFields) || !isValid || resCreateCoupon.isLoading}
            disabled={_.isEmpty(dirtyFields) || !isValid || isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
