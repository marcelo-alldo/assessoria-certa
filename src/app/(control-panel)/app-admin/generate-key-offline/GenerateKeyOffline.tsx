import { styled, TextField, Button, Box, Typography, Paper, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FusePageSimple from '@fuse/core/FusePageSimple';
import GenerateKeyOfflineHeader from './GenerateKeyOfflineHeader';
import { useState } from 'react';
import CryptoJS from 'crypto-js';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .container': {
    maxWidth: '100%!important',
  },
  '& .FusePageSimple-header': {
    backgroundColor: theme.vars.palette.background.default,
    borderStyle: 'solid',
    borderColor: theme.vars.palette.divider,
  },
}));

/**
 * The GenerateKeyOffline component.
 */
function GenerateKeyOffline() {
  const [password, setPassword] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [expiredAt, setExpiredAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Função para copiar a chave
  const handleCopyKey = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Função para criar JWT padrão (compatível com navegador)
  const createJWT = (payload: object, secret: string) => {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    // Base64 URL-safe encode
    const base64UrlEncode = (str: string) => {
      return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));

    // Cria assinatura HMAC SHA256
    const signature = CryptoJS.HmacSHA256(`${encodedHeader}.${encodedPayload}`, secret);
    const encodedSignature = signature.toString(CryptoJS.enc.Base64).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
  };

  // Função para criar a chave JWT
  const createKey = () => {
    if (!password || !expiresInDays) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    const expiresIn = parseInt(expiresInDays, 10);

    if (isNaN(expiresIn) || expiresIn <= 0) {
      alert('Por favor, informe um número válido de dias');
      return;
    }

    // Calcula a data de expiração
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + expiresIn);

    // Cria o payload do JWT com campos padrão
    const now = Math.floor(Date.now() / 1000);
    const exp = Math.floor(expirationDate.getTime() / 1000);

    const payload = {
      expires: expirationDate.toISOString(),
      iat: now,
      exp,
    };

    // Gera o JWT usando a senha como chave secreta
    const token = createJWT(payload, password);

    setNewKey(token);
    setExpiredAt(expirationDate.toLocaleString('pt-BR'));
  };

  return (
    <Root
      header={
        <>
          <GenerateKeyOfflineHeader />
        </>
      }
      content={
        <div className="flex flex-1 flex-col overflow-x-auto overflow-y-hidden h-full p-8">
          <Box className="max-w-2xl">
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="h5" className="mb-4">
                Gerar Chave Offline
              </Typography>
              <Box className="flex flex-col gap-4">
                <TextField
                  label="Senha"
                  type="password"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Insira a senha para gerar o JWT"
                />

                <TextField
                  label="Expirar em (dias)"
                  type="number"
                  fullWidth
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  required
                  inputProps={{ min: 1 }}
                  placeholder="Ex: 30"
                />

                <Button variant="contained" color="primary" onClick={createKey} className="mt-8">
                  Gerar Chave
                </Button>
              </Box>
            </Paper>

            {newKey && (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', mt: 3 }}>
                <Box className="flex items-center justify-between mb-4">
                  <Typography variant="h6">Chave Gerada</Typography>
                  <Tooltip title={copied ? 'Copiado!' : 'Copiar chave'}>
                    <IconButton onClick={handleCopyKey} color={copied ? 'success' : 'primary'} size="small">
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Typography variant="body2" className="mb-4 text-gray-600">
                  <strong>Expira em:</strong> {expiredAt}
                </Typography>

                <Box className="p-4 bg-gray-100 rounded overflow-auto">
                  <Typography variant="body2" className="font-mono break-all" style={{ wordBreak: 'break-all' }}>
                    {newKey}
                  </Typography>
                </Box>
              </Paper>
            )}
          </Box>
        </div>
      }
    />
  );
}

export default GenerateKeyOffline;
