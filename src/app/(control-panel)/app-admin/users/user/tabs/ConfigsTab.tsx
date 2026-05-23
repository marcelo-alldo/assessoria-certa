import { useFormContext } from 'react-hook-form';
import { Box, Typography, Chip, Divider, Paper, Stack } from '@mui/material';
import { format } from 'date-fns';

function ConfigsTab() {
  const { watch } = useFormContext();
  const configs = watch('configs'); // espera-se que o form tenha um campo 'configs' com o array

  if (!Array.isArray(configs) || configs.length === 0) {
    return <Typography color="text.secondary">Nenhuma configuração encontrada.</Typography>;
  }

  // Tradução dos valores conhecidos
  const translateValue = (val: string) => {
    if (val === 'PENDING') return 'PENDENTE';

    if (val === 'CONFIGURATION') return 'CONFIGURANDO';

    if (val === 'FINISHED') return 'FINALIZADO';

    return val;
  };

  // Renderizar valor: chip para status conhecidos, Typography para outros
  interface Product {
    name: string;
    description: string;
    price: string;
  }
  interface DataObj {
    products?: Product[];
    [key: string]: unknown;
  }
  const renderValue = (val: string, dataObj: DataObj, key?: string) => {
    if (!val) return <span style={{ color: '#888' }}>(sem valor)</span>;

    if (['PENDING', 'CONFIGURATION', 'FINISHED'].includes(val)) {
      return <Chip label={translateValue(val)} size="small" color="primary" sx={{ mb: 1 }} />;
    }

    // Se for PRODUCTS e houver products no dataObj, renderiza lista de produtos
    if (key === 'PRODUCTS' && dataObj && Array.isArray(dataObj.products)) {
      return (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Produtos:
          </Typography>
          <Stack spacing={1}>
            {dataObj.products.map((prod, idx) => (
              <Paper key={idx} variant="outlined" sx={{ p: 1, background: '#f8f8f8' }}>
                <Typography variant="body2">
                  <b>Nome:</b> {prod.name}
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  <b>Descrição:</b> {prod.description}
                </Typography>
                <Typography variant="body2">
                  <b>Preço:</b> {prod.price}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Box>
      );
    }

    return <Typography sx={{ whiteSpace: 'pre-wrap' }}>{val}</Typography>;
  };

  return (
    <Box className="flex flex-col gap-4 max-w-xl">
      <Typography variant="h6" gutterBottom>
        Configurações do Usuário
      </Typography>
      <Divider />
      <Stack spacing={3}>
        {configs.map((cfg) => {
          let dataObj = null;
          try {
            dataObj = cfg.data ? JSON.parse(cfg.data) : null;
          } catch {
            dataObj = null;
          }
          return (
            <Paper key={cfg.uid} variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {cfg.name}
              </Typography>
              {/* Renderiza valor/config ou produtos, mas só mostra Dados extras se não for PRODUCTS */}
              {renderValue(cfg.value, dataObj, cfg.key)}
              {dataObj && cfg.key !== 'PRODUCTS' && (
                <Box mt={1}>
                  <Typography variant="body2" fontWeight={500}>
                    Dados extras:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {Object.entries(dataObj).map(([k, v]) => (
                      <Chip key={k} label={`${k}: ${String(v)}`} size="small" />
                    ))}
                  </Stack>
                </Box>
              )}
              <Box mt={2}>
                <Typography variant="caption" color="text.secondary">
                  Criado em: {format(new Date(cfg.createdAt), 'dd/MM/yyyy HH:mm')}
                </Typography>
                <br />
                <Typography variant="caption" color="text.secondary">
                  Atualizado em: {format(new Date(cfg.updatedAt), 'dd/MM/yyyy HH:mm')}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
}

export default ConfigsTab;
