import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  Switch,
  FormControlLabel,
  useTheme,
  Box,
  Typography,
  IconButton,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';
import WhatsAppPreview from '../../../../../components/WhatsAppPreview';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ImageIcon from '@mui/icons-material/Image';
import { useState, useEffect, useMemo, useCallback } from 'react';

const categoryOptions = [
  { value: 'MARKETING', label: 'Marketing', color: '#4CAF50' },
  { value: 'UTILITY', label: 'Utilidade', color: '#FF9800' },
];

interface MessageTemplateFormProps {
  viewOnly?: boolean;
}

function MessageTemplateForm({ viewOnly }: MessageTemplateFormProps) {
  const { register, formState, control, watch, setValue } = useFormContext();
  const theme = useTheme();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // ✅ Melhor abordagem: usar watch() sem argumentos e acessar diretamente
  const watchedValues = watch(); // Observa TODAS as mudanças no form
  const messageContent = watchedValues?.message || '';
  const imageFile = watchedValues?.image || null;
  const imageUrl = watchedValues?.imageUrl || '';

  console.log('MessageTemplateForm renderizado com messageContent:', messageContent, 'e imageFile:', imageFile, 'e imageUrl:', imageUrl);

  useEffect(() => {
    if (imageUrl) {
      setImagePreview(imageUrl);
    }
  }, [imageUrl]);

  const getHelperText = (field) => (typeof field?.message === 'string' ? field.message : undefined);

  const getCategoryColor = (category: string) => {
    const option = categoryOptions.find((opt) => opt.value === category);
    return option?.color || '#757575';
  };

  const getCategoryLabel = (category: string) => {
    const option = categoryOptions.find((opt) => opt.value === category);
    return option?.label || category;
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      // Verifica se é uma imagem
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem');
        return;
      }

      // Verifica o tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB');
        return;
      }

      const base64 = await fileToBase64(file);

      setValue('image', base64);

      // Cria preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setValue('image', null);
    setImagePreview(null);
  };

  // ✅ useCallback para otimizar a função de renderização do preview
  const renderPreview = useCallback(() => {
    return <WhatsAppPreview message={messageContent || ''} image={imagePreview} />;
  }, [messageContent, imagePreview]);

  // ✅ useMemo mais robusto com dependências explícitas
  const previewMemo = useMemo(() => {
    console.log('🔄 Preview atualizado:', { messageContent, imagePreview });
    return renderPreview();
  }, [renderPreview, messageContent, imagePreview]);

  // ✅ useEffect para forçar atualização quando necessário
  useEffect(() => {
    console.log('📝 Form values changed:', { messageContent, imagePreview });
  }, [messageContent, imagePreview]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl">
      <div className="flex-1 p-6">
        <div className="flex flex-col gap-6 max-w-2xl">
          <div className="flex flex-col gap-4">
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 2 }}>
              Informações do Modelo
            </Typography>
            <TextField
              label="Nome do Modelo"
              {...register('name')}
              required
              disabled={viewOnly}
              InputLabelProps={viewOnly ? { shrink: true } : undefined}
              error={!!formState.errors.name}
              helperText={getHelperText(formState.errors.name)}
              fullWidth
              // placeholder="Ex: Mensagem de Boas-vindas"
            />

            <div className="flex gap-4">
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!formState.errors.category} sx={{ minWidth: 200 }}>
                    <InputLabel shrink>Categoria *</InputLabel>
                    <Select
                      {...field}
                      label="Categoria *"
                      displayEmpty
                      disabled={viewOnly}
                      sx={{
                        // Evita que o conteúdo (Chip) fique acinzentado quando o Select estiver desabilitado
                        '& .MuiSelect-select.Mui-disabled': {
                          WebkitTextFillColor: 'unset',
                          color: 'inherit',
                          opacity: 1,
                        },
                        // Garante que o Chip mantenha suas cores
                        '& .MuiChip-root': {
                          opacity: 1,
                          filter: 'none',
                        },
                      }}
                      renderValue={(selected) => {
                        if (!selected) {
                          return <span style={{ color: theme.palette.text.secondary }}>Selecione uma categoria</span>;
                        }

                        return (
                          <Chip
                            label={getCategoryLabel(selected)}
                            size="small"
                            sx={{
                              backgroundColor: getCategoryColor(selected),
                              color: 'white',
                              fontWeight: 500,
                            }}
                          />
                        );
                      }}
                    >
                      {categoryOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Chip
                              label={option.label}
                              size="small"
                              sx={{
                                backgroundColor: option.color,
                                color: 'white',
                                fontWeight: 500,
                              }}
                            />
                          </div>
                        </MenuItem>
                      ))}
                    </Select>
                    {formState.errors.category && <FormHelperText>{getHelperText(formState.errors.category)}</FormHelperText>}
                  </FormControl>
                )}
              />

              <Controller
                name="enable"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    disabled={viewOnly}
                    control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} color="primary" />}
                    label="Ativo"
                    sx={{ minWidth: 150 }}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 2 }}>
              Conteúdo da Mensagem
            </Typography>

            {/* Upload de Imagem */}
            <Box>
              <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                Imagem (Opcional)
              </Typography>

              {!imagePreview ? (
                <Box
                  sx={{
                    border: 2,
                    borderColor: theme.palette.divider,
                    borderStyle: 'dashed',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
                    cursor: viewOnly ? 'default' : 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': viewOnly
                      ? {}
                      : {
                          borderColor: theme.palette.primary.main,
                          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
                        },
                  }}
                  onClick={() => !viewOnly && document.getElementById('image-upload-input')?.click()}
                >
                  <ImageIcon sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 2 }} />
                  <Typography variant="body1" sx={{ color: theme.palette.text.primary, mb: 1 }}>
                    Clique para adicionar uma imagem
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    PNG, JPG ou JPEG até 5MB
                  </Typography>
                  <input
                    id="image-upload-input"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                    disabled={viewOnly}
                  />
                </Box>
              ) : (
                <Card sx={{ maxWidth: 400 }}>
                  <CardMedia component="img" image={imagePreview} alt="Preview da imagem" sx={{ height: 200, objectFit: 'cover' }} />
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {imageFile?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {imageFile?.size ? `${(imageFile.size / 1024).toFixed(2)} KB` : ''}
                      </Typography>
                    </Box>
                    {!viewOnly && (
                      <IconButton size="small" color="error" onClick={handleRemoveImage} sx={{ ml: 2 }}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    )}
                  </CardContent>
                </Card>
              )}
            </Box>

            <TextField
              label="Mensagem"
              {...register('message')}
              disabled={viewOnly}
              required
              InputLabelProps={viewOnly ? { shrink: true } : undefined}
              error={!!formState.errors.message}
              helperText={getHelperText(formState.errors.message) || 'Digite o conteúdo da mensagem que será enviada'}
              fullWidth
              multiline
              minRows={6}
              maxRows={12}
            />
          </div>

          <Box
            sx={{
              backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.info.light,
              p: 3,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: theme.palette.mode === 'dark' ? theme.palette.info.light : theme.palette.info.dark,
                mb: 2,
                fontWeight: 600,
              }}
            >
              Sobre as Categorias:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip label="Marketing" size="small" sx={{ backgroundColor: '#4CAF50', color: 'white', fontSize: '11px' }} />
                <Typography variant="body2" sx={{ color: theme.palette.mode === 'dark' ? theme.palette.info.light : theme.palette.info.dark }}>
                  Promoções, ofertas, campanhas publicitárias, newsletters
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip label="Utilidade" size="small" sx={{ backgroundColor: '#FF9800', color: 'white', fontSize: '11px' }} />
                <Typography variant="body2" sx={{ color: theme.palette.mode === 'dark' ? theme.palette.info.light : theme.palette.info.dark }}>
                  Notificações, lembretes, atualizações de status, informações gerais
                </Typography>
              </Box>
            </Box>
          </Box>
        </div>
      </div>

      <div className="lg:w-96 lg:sticky lg:top-6 lg:self-start">
        <div className="mb-4">
          <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 1 }}>
            Preview da Mensagem
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Veja como sua mensagem aparecerá no WhatsApp
          </Typography>
        </div>
        {previewMemo}
      </div>
    </div>
  );
}

export default MessageTemplateForm;
