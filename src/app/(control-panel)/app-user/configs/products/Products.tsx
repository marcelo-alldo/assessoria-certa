import { styled, Typography, TextField, Button, LinearProgress, IconButton, Box, Chip } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { useForm, FormProvider, Controller, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useGetConfigsQuery } from '../../../../../store/api/configsApi';
import ProductsHeader from './ProductsHeader';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FilePreviewModal from './components/FilePreviewModal';
import { useGetPresignedUrlMutation } from '../../../../../store/api/storageApi';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .container': {
    maxWidth: '100%!important',
  },
  '& .FusePageSimple-header': {
    backgroundColor: theme.vars.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.vars.palette.divider,
  },
}));

const schema = z.object({
  products: z
    .array(
      z.object({
        name: z.string().min(1, 'Nome obrigatório'),
        description: z.string().min(1, 'Descrição obrigatória'),
        price: z.string(),
        files: z
          .array(
            z.object({
              name: z.string(),
              type: z.string(),
              mimeType: z.string(),
              size: z.number().optional(),
              media: z.string().optional(), // Base64 dos arquivos novos (< 4MB)
              s3Key: z.string().optional(), // S3 key para arquivos grandes (>= 4MB)
              url: z.string().optional(), // URL local para preview
              mediaId: z.string().optional(), // ID retornado pela Meta após upload
              uploadStatus: z.enum(['pending', 'success', 'error']).optional(),
              error: z.string().optional(),
            }),
          )
          .optional(),
      }),
    )
    .min(1, 'Adicione pelo menos um produto'),
});

type FormType = z.infer<typeof schema>;

const defaultValues: FormType = {
  products: [{ name: '', description: '', price: '', files: [] }],
};

const MAX_FILE_SIZE = 70 * 1024 * 1024; // 70MB
const S3_UPLOAD_THRESHOLD = 5 * 1024 * 1024; // 5MB - arquivos maiores que isso vão para S3
const ACCEPTED_FILE_TYPES = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

const ALL_ACCEPTED_TYPES = [...ACCEPTED_FILE_TYPES.image, ...ACCEPTED_FILE_TYPES.video, ...ACCEPTED_FILE_TYPES.document];

/**
 * The Products component with file upload support.
 */
function Products() {
  const [localLoading, setLocalLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [getPresignedUrl] = useGetPresignedUrlMutation();

  const {
    data: configs,
    isLoading: isLoadingConfigs,
    refetch: refetchConfigs,
  } = useGetConfigsQuery('key=PRODUCTS', { refetchOnMountOrArgChange: true });

  const methods = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  });
  const { reset, control, formState, watch, trigger } = methods;
  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({ name: 'products', control });

  useEffect(() => {
    let productsArr = defaultValues?.products;
    const configData = configs?.data?.data;

    if (configData) {
      try {
        const parsed = JSON.parse(configData);

        if (Array.isArray(parsed?.products)) {
          productsArr = parsed?.products;
        }
      } catch {
        // Intentionally ignore JSON parse errors
      }
    }

    reset({ products: productsArr });
    setHasChanges(false);
  }, [configs, reset]);

  // Marcar mudanças quando o form mudar
  useEffect(() => {
    const subscription = watch(() => {
      setHasChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const getMediaType = (mimeType: string): string => {
    if (ACCEPTED_FILE_TYPES.image.includes(mimeType)) return 'image';

    if (ACCEPTED_FILE_TYPES.video.includes(mimeType)) return 'video';

    if (ACCEPTED_FILE_TYPES.document.includes(mimeType)) return 'document';

    return 'document';
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

  const uploadToS3 = async (file: File, uploadUrl: string): Promise<void> => {
    console.log('📤 Iniciando upload para S3:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadUrl: uploadUrl.substring(0, 100) + '...', // Log parcial da URL
    });

    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
      });

      console.log('📥 Resposta do S3:', {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro ao fazer upload para S3:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(`Erro ao fazer upload para S3: ${response.status} - ${response.statusText}`);
      }

      console.log('✅ Upload para S3 concluído com sucesso');
    } catch (error: any) {
      console.error('❌ Exceção durante upload S3:', {
        message: error.message,
        name: error.name,
        error,
      });
      throw error;
    }
  };

  const handleFileUpload = async (idx: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files || files.length === 0) return;

    const currentFiles = watch(`products.${idx}.files`) || [];
    const newFiles = [];

    for (const file of Array.from(files)) {
      // Validação de tamanho
      if (file.size > MAX_FILE_SIZE) {
        alert(`Arquivo ${file.name} excede o tamanho máximo de 10MB`);
        continue;
      }

      // Validação de tipo
      if (!ALL_ACCEPTED_TYPES.includes(file.type)) {
        alert(`Tipo de arquivo ${file.type} não é suportado`);
        continue;
      }

      try {
        const fileData: any = {
          name: file.name,
          type: getMediaType(file.type),
          mimeType: file.type,
          size: file.size,
          url: URL.createObjectURL(file), // URL local apenas para preview
          uploadStatus: 'pending' as const,
        };

        // Se o arquivo for maior que 4MB, fazer upload via S3
        if (file.size >= S3_UPLOAD_THRESHOLD) {
          try {
            console.log('📄 Arquivo grande detectado, usando S3:', { size: file.size, threshold: S3_UPLOAD_THRESHOLD });

            // Obter URL presigned do backend
            const response = await getPresignedUrl({
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
            }).unwrap();
            console.log('🔑 Resposta completa do backend:', JSON.stringify(response, null, 2));
            console.log('🔑 URL presigned recebida:', {
              hasUploadUrl: !!response.data?.uploadUrl,
              hasS3Key: !!response.data?.s3Key,
              uploadUrl: response.data?.uploadUrl?.substring(0, 100),
              s3Key: response.data?.s3Key,
            });

            const { uploadUrl, s3Key } = response.data;

            // Fazer upload para S3
            await uploadToS3(file, uploadUrl);

            // Adicionar s3Key ao objeto do arquivo
            fileData.s3Key = s3Key;
            fileData.uploadStatus = 'success';
          } catch (error) {
            console.error('Erro ao fazer upload para S3:', error);
            fileData.uploadStatus = 'error';
            fileData.error = 'Erro ao fazer upload do arquivo';
          }
        } else {
          // Arquivo menor que 4MB, converter para base64
          const base64Data = await fileToBase64(file);
          fileData.media = base64Data; // Base64 será enviado para o backend
        }

        newFiles.push(fileData);
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        alert(`Erro ao processar arquivo ${file.name}`);
      }
    }

    methods.setValue(`products.${idx}.files`, [...currentFiles, ...newFiles], {
      shouldDirty: true,
      shouldValidate: true,
    });

    setHasChanges(true);

    // Revalidar o formulário
    await trigger();
  };

  const removeFile = async (productIdx: number, fileIdx: number) => {
    const currentFiles = watch(`products.${productIdx}.files`) || [];
    const fileToRemove = currentFiles[fileIdx];

    // Revogar URL local se existir
    if (fileToRemove?.url) {
      URL.revokeObjectURL(fileToRemove.url);
    }

    const updatedFiles = currentFiles.filter((_, idx) => idx !== fileIdx);
    methods.setValue(`products.${productIdx}.files`, updatedFiles, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setHasChanges(true);

    // Revalidar o formulário
    await trigger();
  };

  const handleFileClick = (file: any) => {
    setSelectedFile(file);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'image' || ACCEPTED_FILE_TYPES.image.includes(fileType)) {
      return 'heroicons-outline:photo';
    }

    if (fileType === 'video' || ACCEPTED_FILE_TYPES.video.includes(fileType)) {
      return 'heroicons-outline:video-camera';
    }

    if (fileType === 'document' || ACCEPTED_FILE_TYPES.document.includes(fileType)) {
      return 'heroicons-outline:document-text';
    }

    return 'heroicons-outline:paper-clip';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';

    if (bytes < 1024) return bytes + ' B';

    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';

    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getUploadStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'pending':
        return 'default';
      default:
        return 'default';
    }
  };

  const getUploadStatusText = (status?: string) => {
    switch (status) {
      case 'success':
        return 'Enviado';
      case 'error':
        return 'Erro no envio';
      case 'pending':
        return 'Aguardando envio';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <FormProvider {...methods}>
      <Root
        scroll="content"
        header={
          <ProductsHeader
            setLoading={setLocalLoading}
            refetch={refetchConfigs}
            uid={configs?.data?.uid}
            hasChanges={hasChanges}
            setHasChanges={setHasChanges}
          />
        }
        content={
          <div className="flex flex-1 flex-col">
            {(isLoadingConfigs || localLoading) && (
              <div className="w-full">
                <LinearProgress color="secondary" />
              </div>
            )}
            {!isLoadingConfigs && (
              <form className="flex flex-1 flex-col overflow-x-auto overflow-y-hidden h-full p-8 max-w-2xl">
                <Typography variant="body1" className="mb-4">
                  Cadastre seus produtos/serviços abaixo. Você pode adicionar quantos quiser. O Alldo usará essas informações para responder clientes.
                </Typography>
                {fields.map((field, idx) => (
                  <div key={field.id} className="mb-6 border-b pb-4 border-gray-200 relative">
                    <Controller
                      name={`products.${idx}.name`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Nome"
                          required
                          fullWidth
                          className="mb-2"
                          error={!!errors.products?.[idx]?.name}
                          helperText={errors.products?.[idx]?.name?.message}
                        />
                      )}
                    />
                    <Controller
                      name={`products.${idx}.description`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Descrição"
                          required
                          fullWidth
                          multiline
                          minRows={2}
                          className="mb-2"
                          error={!!errors.products?.[idx]?.description}
                          helperText={errors.products?.[idx]?.description?.message}
                        />
                      )}
                    />
                    <Controller
                      name={`products.${idx}.price`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Preço"
                          fullWidth
                          className="mb-2"
                          error={!!errors.products?.[idx]?.price}
                          helperText={errors.products?.[idx]?.price?.message}
                          InputProps={{
                            startAdornment: <span style={{ marginRight: 4 }}>R$</span>,
                            inputProps: {
                              inputMode: 'numeric',
                              pattern: '[0-9]*[.,]?[0-9]*',
                              onInput: (e) => {
                                const input = e.target as HTMLInputElement;
                                input.value = input.value.replace(/[^0-9.,]/g, '');
                                field.onChange(e);
                              },
                            },
                          }}
                        />
                      )}
                    />

                    {/* Upload de Arquivos */}
                    <Box className="mb-4">
                      <Typography variant="subtitle2" className="mb-2">
                        Arquivos (imagens, vídeos ou documentos)
                      </Typography>
                      <Typography variant="caption" className="text-gray-500 mb-2 block">
                        Arquivos maiores que 5MB serão enviados via S3. Tamanho máximo: 70MB
                      </Typography>
                      <input
                        accept={ALL_ACCEPTED_TYPES.join(',')}
                        style={{ display: 'none' }}
                        id={`file-upload-${idx}`}
                        multiple
                        type="file"
                        onChange={(e) => handleFileUpload(idx, e)}
                      />
                      <label htmlFor={`file-upload-${idx}`}>
                        <Button
                          variant="outlined"
                          component="span"
                          size="small"
                          startIcon={<FuseSvgIcon size={20}>heroicons-outline:cloud-upload</FuseSvgIcon>}
                        >
                          Adicionar Arquivos
                        </Button>
                      </label>

                      {/* Preview de Arquivos */}
                      {watch(`products.${idx}.files`)?.length > 0 && (
                        <Box className="mt-3 space-y-2">
                          {watch(`products.${idx}.files`)?.map((file, fileIdx) => (
                            <Box
                              key={fileIdx}
                              className="flex items-center gap-2 p-2 border border-gray-200 rounded bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                              onClick={() => handleFileClick(file)}
                            >
                              <FuseSvgIcon size={24} color="action">
                                {getFileIcon(file.type)}
                              </FuseSvgIcon>

                              <Box className="flex-1 min-w-0">
                                <Typography variant="body2" className="truncate">
                                  {file.name}
                                </Typography>
                                <Typography variant="caption" className="text-gray-500">
                                  {formatFileSize(file.size)}
                                </Typography>
                                <Box className="mt-1 flex items-center gap-2">
                                  <Chip
                                    label={getUploadStatusText(file.uploadStatus)}
                                    size="small"
                                    color={getUploadStatusColor(file.uploadStatus)}
                                    className="h-5"
                                  />
                                  {file.s3Key && <Chip label="S3" size="small" variant="outlined" className="h-5" />}
                                  {file.mediaId && (
                                    <Typography variant="caption" className="text-gray-400">
                                      ID: {file.mediaId.substring(0, 12)}...
                                    </Typography>
                                  )}
                                  {file.error && (
                                    <Typography variant="caption" className="text-red-500">
                                      {file.error}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>

                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation(); // Evita abrir o modal ao clicar no delete
                                  removeFile(idx, fileIdx);
                                }}
                                color="error"
                              >
                                <FuseSvgIcon size={20}>heroicons-outline:trash</FuseSvgIcon>
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>

                    {fields.length > 1 && (
                      <Button variant="contained" className="whitespace-nowrap" size="small" color="error" onClick={() => remove(idx)}>
                        <FuseSvgIcon size={20}>heroicons-outline:trash</FuseSvgIcon>
                        <span className="hidden sm:flex mx-2">Remover</span>
                      </Button>
                    )}
                  </div>
                ))}

                <Button
                  variant="contained"
                  className="whitespace-nowrap"
                  color="secondary"
                  onClick={() => append({ name: '', description: '', price: '', files: [] })}
                >
                  <FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>
                  <span className="hidden sm:flex mx-2">Adicionar Produto</span>
                </Button>
              </form>
            )}
          </div>
        }
      />

      {/* Modal de Preview */}
      <FilePreviewModal open={isModalOpen} onClose={handleCloseModal} file={selectedFile} />
    </FormProvider>
  );
}

export default Products;
