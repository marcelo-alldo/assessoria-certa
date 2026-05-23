import { Box, Typography, Button, IconButton, Paper, Divider, Alert, CircularProgress, Grid, Switch, FormControlLabel } from '@mui/material';
import { useState, useEffect } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import TextField from '@mui/material/TextField';
import { useCreateConfigMutation, useGetConfigsQuery, useDeleteConfigMutation } from '@/store/api/configsApi';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch } from '@/store/hooks';
import { useParams } from 'react-router';

interface Flow {
  id: string;
  name: string;
  configUid?: string;
  markedForDeletion?: boolean;
}

interface GoogleCalendar {
  value: string;
  name: string;
  configUid?: string;
}

interface CacheKey {
  value: string;
  name: string;
  configUid?: string;
}

interface AIAutomatic {
  enabled: boolean;
  configUid?: string;
}

function ConfigsSystemTab() {
  const [flows, setFlows] = useState<Flow[]>([{ id: '', name: '' }]);
  const [googleCalendar, setGoogleCalendar] = useState<GoogleCalendar>({ value: '', name: '' });
  const [cacheKey, setCacheKey] = useState<CacheKey>({ value: '', name: '' });
  const [aiAutomatic, setAiAutomatic] = useState<AIAutomatic>({ enabled: false });
  const [flowsToDelete, setFlowsToDelete] = useState<string[]>([]);
  const [googleCalendarToDelete, setGoogleCalendarToDelete] = useState<string | null>(null);
  const [cacheKeyToDelete, setCacheKeyToDelete] = useState<string | null>(null);
  const [aiAutomaticToDelete, setAiAutomaticToDelete] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [deletingFlowIndex, setDeletingFlowIndex] = useState<number | null>(null);
  const [deletingGoogleCalendar, setDeletingGoogleCalendar] = useState(false);
  const [deletingCacheKey, setDeletingCacheKey] = useState(false);
  const dispatch = useAppDispatch();
  const { uid } = useParams();

  const [createConfig, { isLoading: isCreating }] = useCreateConfigMutation();
  const [deleteConfig, { isLoading: isDeleting }] = useDeleteConfigMutation();
  const {
    data: config,
    isLoading,
    refetch,
  } = useGetConfigsQuery(`uid=${uid}`, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (config) {
      const existingFlows = config.data
        .filter((conf) => conf.key === 'FLOW')
        .map((flow) => ({
          id: flow.value,
          name: flow.name,
          configUid: flow.uid,
        }));

      setFlows(existingFlows.length > 0 ? existingFlows : [{ id: '', name: '' }]);

      const calendarConfig = config.data.find((conf) => conf.key === 'GOOGLE-CALENDAR-WEBHOOK');

      if (calendarConfig) {
        setGoogleCalendar({
          value: calendarConfig.value,
          name: calendarConfig.name,
          configUid: calendarConfig.uid,
        });
      }

      const cacheKeyConfig = config.data.find((conf) => conf.key === 'CACHE-KEY');

      if (cacheKeyConfig) {
        setCacheKey({
          value: cacheKeyConfig.value,
          name: cacheKeyConfig.name,
          configUid: cacheKeyConfig.uid,
        });
      }

      const aiAutomaticConfig = config.data.find((conf) => conf.key === 'AI-AUTOMATIC');

      if (aiAutomaticConfig) {
        setAiAutomatic({
          enabled: aiAutomaticConfig.value === 'true',
          configUid: aiAutomaticConfig.uid,
        });
      }

      setFlowsToDelete([]);
      setGoogleCalendarToDelete(null);
      setCacheKeyToDelete(null);
      setAiAutomaticToDelete(null);
    }
  }, [config]);

  const handleAddFlow = () => {
    setFlows([...flows, { id: '', name: '' }]);
    setHasUnsavedChanges(true);
  };

  const handleFlowChange = (index: number, field: keyof Flow, value: string) => {
    const newFlows = flows.map((flow, i) => (i === index ? { ...flow, [field]: value } : flow));
    setFlows(newFlows);
    setHasUnsavedChanges(true);
  };

  const handleDeleteFlow = (index: number) => {
    setDeletingFlowIndex(index);

    const flowToDelete = flows[index];

    if (flowToDelete.configUid) {
      setFlowsToDelete((prev) => [...prev, flowToDelete.configUid!]);
    }

    const newFlows = flows.filter((_, i) => i !== index);
    setFlows(newFlows.length > 0 ? newFlows : [{ id: '', name: '' }]);
    setHasUnsavedChanges(true);

    setTimeout(() => setDeletingFlowIndex(null), 300);
  };

  const handleGoogleCalendarChange = (field: keyof GoogleCalendar, value: string) => {
    setGoogleCalendar({ ...googleCalendar, [field]: value });
    setHasUnsavedChanges(true);
  };

  const handleDeleteGoogleCalendar = () => {
    setDeletingGoogleCalendar(true);

    if (googleCalendar.configUid) {
      setGoogleCalendarToDelete(googleCalendar.configUid);
    }

    setGoogleCalendar({ value: '', name: '' });
    setHasUnsavedChanges(true);

    setTimeout(() => setDeletingGoogleCalendar(false), 300);
  };

  const handleCacheKeyChange = (field: keyof CacheKey, value: string) => {
    setCacheKey({ ...cacheKey, [field]: value });
    setHasUnsavedChanges(true);
  };

  const handleDeleteCacheKey = () => {
    setDeletingCacheKey(true);

    if (cacheKey.configUid) {
      setCacheKeyToDelete(cacheKey.configUid);
    }

    setCacheKey({ value: '', name: '' });
    setHasUnsavedChanges(true);

    setTimeout(() => setDeletingCacheKey(false), 300);
  };

  const handleAiAutomaticToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEnabled = event.target.checked;

    // Se está desligando e já existe uma config, marcar para deletar
    if (!newEnabled && aiAutomatic.configUid) {
      setAiAutomaticToDelete(aiAutomatic.configUid);
      setAiAutomatic({ enabled: false });
    } else {
      // Se está ligando, remover da lista de exclusão se estava lá
      setAiAutomaticToDelete(null);
      setAiAutomatic({ ...aiAutomatic, enabled: newEnabled });
    }

    setHasUnsavedChanges(true);
  };

  const validateFlows = (): boolean => {
    const validFlows = flows.filter((flow) => flow.name.trim() || flow.id.trim());

    for (const flow of validFlows) {
      if (!flow.name.trim() || !flow.id.trim()) {
        dispatch(
          showMessage({
            message: 'Todos os fluxos devem ter nome e ID preenchidos',
            autoHideDuration: 3000,
            variant: 'warning',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }),
        );
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateFlows()) return;

    setIsSaving(true);

    try {
      for (const configUid of flowsToDelete) {
        try {
          await deleteConfig({ uid: configUid }).unwrap();
        } catch (error: any) {
          dispatch(
            showMessage({
              message: error?.data?.msg || 'Erro ao remover fluxo',
              autoHideDuration: 3000,
              variant: 'error',
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'right',
              },
            }),
          );
          setIsSaving(false);
          return;
        }
      }

      if (googleCalendarToDelete) {
        try {
          await deleteConfig({ uid: googleCalendarToDelete }).unwrap();
        } catch (error: any) {
          dispatch(
            showMessage({
              message: error?.data?.msg || 'Erro ao remover Google Calendar',
              autoHideDuration: 3000,
              variant: 'error',
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'right',
              },
            }),
          );
          setIsSaving(false);
          return;
        }
      }

      if (cacheKeyToDelete) {
        try {
          await deleteConfig({ uid: cacheKeyToDelete }).unwrap();
        } catch (error: any) {
          dispatch(
            showMessage({
              message: error?.data?.msg || 'Erro ao remover Cache Key',
              autoHideDuration: 3000,
              variant: 'error',
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'right',
              },
            }),
          );
          setIsSaving(false);
          return;
        }
      }

      if (aiAutomaticToDelete) {
        try {
          await deleteConfig({ uid: aiAutomaticToDelete }).unwrap();
        } catch (error: any) {
          dispatch(
            showMessage({
              message: error?.data?.msg || 'Erro ao remover AI Automático',
              autoHideDuration: 3000,
              variant: 'error',
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'right',
              },
            }),
          );
          setIsSaving(false);
          return;
        }
      }

      if (googleCalendar.name?.trim() && googleCalendar.value?.trim()) {
        if (!googleCalendar.configUid) {
          await createConfig({
            name: googleCalendar.name,
            key: 'GOOGLE-CALENDAR-WEBHOOK',
            value: googleCalendar.value,
            data: null,
            uid,
          }).unwrap();
        }
      }

      if (cacheKey.name?.trim() && cacheKey.value?.trim()) {
        if (!cacheKey.configUid) {
          await createConfig({
            name: cacheKey.name,
            key: 'CACHE-KEY',
            value: cacheKey.value,
            data: null,
            uid,
          }).unwrap();
        }
      }

      // Salvar AI Automático apenas quando está ligado e não tem configUid
      if (aiAutomatic.enabled && !aiAutomatic.configUid) {
        await createConfig({
          name: 'AI Automático',
          key: 'AI-AUTOMATIC',
          value: 'true',
          data: null,
          uid,
        }).unwrap();
      }

      const flowsToSave = flows.filter((flow) => flow.name.trim() && flow.id.trim() && !flow.configUid);

      for (const flow of flowsToSave) {
        await createConfig({
          name: flow.name,
          key: 'FLOW',
          value: flow.id,
          data: null,
          uid,
        }).unwrap();
      }

      setFlowsToDelete([]);
      setGoogleCalendarToDelete(null);
      setCacheKeyToDelete(null);
      setAiAutomaticToDelete(null);
      await refetch();
      setHasUnsavedChanges(false);

      dispatch(
        showMessage({
          message: 'Configurações salvas com sucesso',
          autoHideDuration: 3000,
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        }),
      );
    } catch (error: any) {
      dispatch(
        showMessage({
          message: error?.data?.msg || 'Erro ao salvar as configurações',
          autoHideDuration: 3000,
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        }),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const isOperationInProgress = isSaving || isCreating || isDeleting;

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center min-h-[400px]">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="600">
          Configurações do Sistema
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure os fluxos e integrações do sistema
        </Typography>
      </Box>

      {hasUnsavedChanges && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Você tem alterações não salvas
        </Alert>
      )}

      {flowsToDelete.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {flowsToDelete.length} fluxo(s) será(ão) excluído(s) quando você salvar as configurações
        </Alert>
      )}

      {googleCalendarToDelete && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Google Calendar será excluído quando você salvar as configurações
        </Alert>
      )}

      {cacheKeyToDelete && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Cache Key será excluído quando você salvar as configurações
        </Alert>
      )}

      {aiAutomaticToDelete && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          AI Automático será excluído quando você salvar as configurações
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Paper do Google Calendar - 1/3 da Largura */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="600">
                Google Calendar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure o webhook do Google Calendar
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nome da Integração"
                value={googleCalendar.name}
                onChange={(e) => handleGoogleCalendarChange('name', e.target.value)}
                size="small"
                fullWidth
                disabled={isOperationInProgress}
                placeholder="Ex: Webhook Principal"
              />
              <TextField
                label="URL do Webhook"
                value={googleCalendar.value}
                onChange={(e) => handleGoogleCalendarChange('value', e.target.value)}
                size="small"
                fullWidth
                disabled={isOperationInProgress}
                placeholder="https://..."
              />
              {googleCalendar.configUid && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    onClick={handleDeleteGoogleCalendar}
                    color="error"
                    disabled={deletingGoogleCalendar}
                    startIcon={deletingGoogleCalendar ? <CircularProgress size={16} color="error" /> : <DeleteIcon />}
                    size="small"
                    variant="outlined"
                  >
                    Excluir
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Paper do Cache Key - 1/3 da Largura */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="600">
                Cache Key
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure a chave de cache do sistema
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nome da Configuração"
                value={cacheKey.name}
                onChange={(e) => handleCacheKeyChange('name', e.target.value)}
                size="small"
                fullWidth
                disabled={isOperationInProgress}
                placeholder="Ex: Cache Principal"
              />
              <TextField
                label="Valor da Cache Key"
                value={cacheKey.value}
                onChange={(e) => handleCacheKeyChange('value', e.target.value)}
                size="small"
                fullWidth
                disabled={isOperationInProgress}
                placeholder="Ex: cache_key_123"
              />
              {cacheKey.configUid && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    onClick={handleDeleteCacheKey}
                    color="error"
                    disabled={deletingCacheKey}
                    startIcon={deletingCacheKey ? <CircularProgress size={16} color="error" /> : <DeleteIcon />}
                    size="small"
                    variant="outlined"
                  >
                    Excluir
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Paper do AI Automático - 1/3 da Largura */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="600">
                AI Automático
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ao ligar todos leads conversarão automaticamente com o Alldo Assistente
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <FormControlLabel
                control={<Switch checked={aiAutomatic.enabled} onChange={handleAiAutomaticToggle} disabled={isOperationInProgress} color="primary" />}
                label={
                  <Box>
                    <Typography variant="body1" fontWeight="500">
                      {aiAutomatic.enabled ? 'Ligado' : 'Desligado'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {aiAutomatic.enabled ? 'Todos os leads estão conversando com IA' : 'Conversão manual com leads'}
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Paper>
        </Grid>

        {/* Paper de Fluxos - Largura Total */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Box className="flex items-center justify-between mb-4">
              <Box>
                <Typography variant="h6" fontWeight="600">
                  Fluxos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gerencie os fluxos de automação
                </Typography>
              </Box>
              <Button startIcon={<AddIcon />} onClick={handleAddFlow} variant="outlined" size="small" disabled={isOperationInProgress}>
                Adicionar
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box className="flex flex-col gap-3">
              {flows.map((flow, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Box className="flex gap-3 items-start">
                    <TextField
                      label="Nome do Fluxo"
                      value={flow.name}
                      onChange={(e) => handleFlowChange(index, 'name', e.target.value)}
                      size="small"
                      fullWidth
                      required
                      disabled={isOperationInProgress}
                      placeholder="Ex: Fluxo de Boas-vindas"
                    />
                    <TextField
                      label="ID do Fluxo"
                      value={flow.id}
                      onChange={(e) => handleFlowChange(index, 'id', e.target.value)}
                      size="small"
                      fullWidth
                      required
                      disabled={isOperationInProgress}
                      placeholder="Ex: flow_123"
                    />
                    <IconButton
                      onClick={() => handleDeleteFlow(index)}
                      color="error"
                      disabled={(flows.length === 1 && !flow.configUid) || deletingFlowIndex === index}
                      sx={{ mt: 0.5 }}
                    >
                      {deletingFlowIndex === index ? <CircularProgress size={20} color="error" /> : <DeleteIcon />}
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Botão de Salvar */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          startIcon={isOperationInProgress ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          disabled={isOperationInProgress}
          size="large"
        >
          {isOperationInProgress ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </Box>
    </Box>
  );
}

export default ConfigsSystemTab;
