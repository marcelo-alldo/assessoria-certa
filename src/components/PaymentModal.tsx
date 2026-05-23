import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
  IconButton,
  Grid,
  InputAdornment,
} from '@mui/material';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import { BillingType, TypeSource, CreatePaymentType, TypeDiscount, PaymentType, UpdatePaymentType } from '@/store/api/paymentApi';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (payment: CreatePaymentType | UpdatePaymentType) => Promise<void>;
  userUid: string;
  subscriptionUid?: string;
  loading?: boolean;
  defaultValue?: number;
  payment?: PaymentType; // Se fornecido, é edição
}

const Transition = React.forwardRef(function Transition(props: TransitionProps & { children: React.ReactElement }, ref: React.Ref<unknown>) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  onConfirm,
  userUid,
  subscriptionUid,
  loading = false,
  defaultValue = 0,
  payment,
}) => {
  const isEditing = !!payment;
  const [formData, setFormData] = useState<CreatePaymentType | UpdatePaymentType>(
    payment
      ? {
          uid: payment.uid,
          alldoPaymentUid: payment.alldoPaymentUid,
          status: payment.status,
          type: payment.type,
          value: parseFloat(payment.value.toString()),
          description: payment.description,
          dueDate: payment.dueDate.split('T')[0],
          discount: payment.discount,
          discountType: payment.discountType,
          source: payment.source,
          userSubscriptionUid: payment.userSubscriptionUid,
        }
      : {
          userUid,
          type: 'CREDIT_CARD',
          value: defaultValue,
          description: 'Pagamento de parcela da assinatura.',
          dueDate: new Date().toISOString().split('T')[0],
          source: 'DIRECT',
          userSubscriptionUid: subscriptionUid,
          discount: undefined,
          discountType: undefined,
          remoteIp: '',
          status: 'PENDING',
        },
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Atualiza o formulário quando o payment mudar
  useEffect(() => {
    if (payment) {
      setFormData({
        uid: payment.uid,
        alldoPaymentUid: payment.alldoPaymentUid,
        status: payment.status,
        type: payment.type,
        value: parseFloat(payment.value.toString()),
        description: payment.description,
        dueDate: payment.dueDate.split('T')[0],
        discount: payment.discount,
        discountType: payment.discountType,
        source: payment.source,
        userSubscriptionUid: payment.userSubscriptionUid,
      });
    } else {
      setFormData({
        userUid,
        type: 'CREDIT_CARD',
        value: defaultValue,
        description: 'Pagamento de parcela da assinatura.',
        dueDate: new Date().toISOString().split('T')[0],
        source: 'DIRECT',
        userSubscriptionUid: subscriptionUid,
        discount: undefined,
        discountType: undefined,
        remoteIp: '',
        status: 'PENDING',
      });
    }
  }, [payment, userUid, subscriptionUid, defaultValue]);

  // Busca o IP do usuário quando o modal abre
  useEffect(() => {
    if (open && !isEditing) {
      // Só busca IP para novos pagamentos
      fetch('https://api.ipify.org?format=json')
        .then((res) => res.json())
        .then((data) => {
          setFormData((prev) => ({
            ...prev,
            remoteIp: data.ip,
          }));
        })
        .catch(() => {
          // Se falhar, usa um IP padrão
          setFormData((prev) => ({
            ...prev,
            remoteIp: '0.0.0.0',
          }));
        });
    }
  }, [open, isEditing]);

  const handleChange = (field: keyof CreatePaymentType, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpa o erro do campo quando o usuário altera
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.type) {
      newErrors.type = 'Tipo de pagamento é obrigatório';
    }

    if (!formData.value || formData.value <= 0) {
      newErrors.value = 'Valor deve ser maior que zero';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Data de vencimento é obrigatória';
    }

    if (!formData.source) {
      newErrors.source = 'Origem é obrigatória';
    }

    if (formData.discount && formData.discount < 0) {
      newErrors.discount = 'Desconto não pode ser negativo';
    }

    if (formData.discount && !formData.discountType) {
      newErrors.discountType = 'Tipo de desconto é obrigatório quando há desconto';
    }

    if (!isEditing && !formData.remoteIp) {
      newErrors.remoteIp = 'IP remoto é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onConfirm(formData);
  };

  const handleClose = () => {
    if (!loading) {
      // Reseta o form ao fechar
      setFormData({
        userUid,
        type: 'CREDIT_CARD',
        value: defaultValue,
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        source: 'DIRECT',
        userSubscriptionUid: subscriptionUid,
        discount: undefined,
        discountType: undefined,
        remoteIp: '',
        status: 'PENDING',
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth TransitionComponent={Transition}>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        disabled={loading}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
          zIndex: 1,
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogTitle>{isEditing ? 'Editar Pagamento' : 'Criar Novo Pagamento'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Tipo de Pagamento"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value as BillingType)}
                error={!!errors.type}
                helperText={errors.type}
                disabled={loading}
                required
              >
                <MenuItem value="CREDIT_CARD">Cartão de Crédito</MenuItem>
                <MenuItem value="DEBIT_CARD">Cartão de Débito</MenuItem>
                <MenuItem value="BOLETO">Boleto</MenuItem>
                <MenuItem value="PIX">PIX</MenuItem>
                <MenuItem value="TRANSFER">Transferência</MenuItem>
                <MenuItem value="DEPOSIT">Depósito</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Status"
                value={formData.status || 'PENDING'}
                onChange={(e) => handleChange('status', e.target.value)}
                disabled={loading}
              >
                <MenuItem value="PENDING">Pendente</MenuItem>
                <MenuItem value="RECEIVED">Recebido</MenuItem>
                <MenuItem value="CONFIRMED">Confirmado</MenuItem>
                <MenuItem value="CANCELED">Cancelado</MenuItem>
                <MenuItem value="OVERDUE">Vencido</MenuItem>
                <MenuItem value="REFUSED">Recusado</MenuItem>
                <MenuItem value="REFUNDED">Reembolsado</MenuItem>
                <MenuItem value="RECEIVED_IN_CASH">Recebido em dinheiro</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Valor"
                value={formData.value || ''}
                onChange={(e) => handleChange('value', parseFloat(e.target.value) || 0)}
                error={!!errors.value}
                helperText={errors.value}
                disabled={loading}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Data de Vencimento"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                error={!!errors.dueDate}
                helperText={errors.dueDate}
                disabled={loading}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Origem"
                value={formData.source}
                onChange={(e) => handleChange('source', e.target.value as TypeSource)}
                error={!!errors.source}
                helperText={errors.source}
                disabled={loading}
                required
              >
                <MenuItem value="DIRECT">Direto</MenuItem>
                <MenuItem value="ASAAS">Asaas</MenuItem>
                <MenuItem value="IZIPAY">IziPay</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="ID da Transação Externa (opcional)"
                value={formData.alldoPaymentUid || ''}
                onChange={(e) => handleChange('alldoPaymentUid', e.target.value || undefined)}
                disabled={loading}
                placeholder="UUID da transação no gateway"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Descrição"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={loading}
                placeholder="Digite uma descrição para o pagamento..."
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Desconto (opcional)"
                value={formData.discount || ''}
                onChange={(e) => handleChange('discount', e.target.value ? parseFloat(e.target.value) : undefined)}
                error={!!errors.discount}
                helperText={errors.discount}
                disabled={loading}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Tipo de Desconto"
                value={formData.discountType || ''}
                onChange={(e) => handleChange('discountType', e.target.value ? (e.target.value as TypeDiscount) : undefined)}
                error={!!errors.discountType}
                helperText={errors.discountType}
                disabled={loading || !formData.discount}
              >
                <MenuItem value="">Nenhum</MenuItem>
                <MenuItem value="PERCENTAGE">Percentual (%)</MenuItem>
                <MenuItem value="FIXED">Valor Fixo (R$)</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="secondary" disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : isEditing ? 'Salvar Alterações' : 'Criar Pagamento'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;
