import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Slide, CircularProgress } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { useAppDispatch } from '@/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useUploadLeadsFileMutation } from '@/store/api/leadsApi';

const Transition = React.forwardRef(function Transition(props: TransitionProps & { children: React.ReactElement }, ref: React.Ref<unknown>) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ImportLeadsFileModalProps {
  open: boolean;
  onClose: () => void;
  refetch: () => void;
}

export default function ImportLeadsFileModal({ open, onClose, refetch }: ImportLeadsFileModalProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleClose = () => {
    setSelectedFile(null);
    setFileName(null);
    onClose();
  };

  const [uploadLeadsFile] = useUploadLeadsFileMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file && !file.name.endsWith('.xlsx')) {
      dispatch(
        showMessage({
          message: 'Por favor, selecione um arquivo .xlsx',
          autoHideDuration: 3000,
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        }),
      );
      setSelectedFile(null);
      setFileName(null);
      return;
    }

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        // Extrai apenas o base64 puro
        const base64 = dataUrl.split(',')[1];
        setSelectedFile(base64);
        setFileName(file.name);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setFileName(null);
    }
  };

  const handleConfirm = () => {
    if (!selectedFile) return;

    setIsLoading(true);
    uploadLeadsFile(selectedFile)
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
        setIsLoading(false);
        handleClose();
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
    <Dialog open={open} onClose={handleClose} TransitionComponent={Transition} maxWidth="xs" fullWidth>
      <DialogTitle>Importar Leads (.xlsx)</DialogTitle>
      <form>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minHeight: 120 }}>
          <label htmlFor="import-leads-file-input">
            <input id="import-leads-file-input" type="file" accept=".xlsx" onChange={handleFileChange} style={{ display: 'none' }} />
            <Button variant="outlined" component="span" color="primary" sx={{ mb: 1 }}>
              Selecionar arquivo
            </Button>
          </label>
          {fileName && (
            <div style={{ fontSize: 15, color: '#333', wordBreak: 'break-all', textAlign: 'center' }}>
              <b>Arquivo selecionado:</b>
              <br />
              {fileName}
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={handleClose} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} variant="contained" color="secondary" disabled={!selectedFile || isLoading} sx={{ minWidth: 120 }}>
            {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Confirmar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
