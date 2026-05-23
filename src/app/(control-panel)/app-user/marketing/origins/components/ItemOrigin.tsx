import { Box, Button, Chip, Paper, Typography } from '@mui/material';
import { OriginType } from '../../../../../../store/api/originsApi';

interface ItemOriginProps {
  data: OriginType;
  updateOrigin: (uid: string) => void;
  openModalDelete: (uid: string) => void;
}

function ItemOrigin({ data, updateOrigin, openModalDelete }: ItemOriginProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mb-4">
      <Paper sx={{ marginY: 1 }} className="w-full rounded-lg shadow-lg overflow-hidden">
        <Box className="p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Box>
            <Typography variant="h6">{data.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              Palavra-chave: {data.key}
            </Typography>
          </Box>

          {data.tag ? (
            <Chip
              label={data.tag.name}
              size="small"
              sx={{
                backgroundColor: data.tag.color,
                color: '#fff',
                fontWeight: 500,
                maxWidth: '100%',
              }}
            />
          ) : (
            <Typography variant="caption" color="text.secondary">
              Sem tag associada
            </Typography>
          )}
        </Box>
      </Paper>
      <div className="flex-shrink-0 pl-2 flex items-center gap-2 flex-col">
        <Button fullWidth variant="outlined" color="primary" onClick={() => updateOrigin(data.uid)}>
          Editar
        </Button>
        <Button fullWidth variant="outlined" color="error" onClick={() => openModalDelete(data.uid)}>
          Excluir
        </Button>
      </div>
    </div>
  );
}

export default ItemOrigin;
