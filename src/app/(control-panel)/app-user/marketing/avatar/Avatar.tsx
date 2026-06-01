import { styled, Typography, LinearProgress, Box, IconButton, Button, Tooltip } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useGetConfigsQuery } from '../../../../../store/api/configsApi';
import AvatarHeader from './AvatarHeader';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
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

const fileSchema = z
  .object({
    name: z.string(),
    mimeType: z.string(),
    size: z.number().optional(),
    media: z.string().optional(),
    s3Key: z.string().optional(),
    url: z.string().optional(),
    uploadStatus: z.enum(['pending', 'success', 'error']).optional(),
    error: z.string().optional(),
  })
  .nullable();

const schema = z.object({
  file: fileSchema,
});

type FormType = z.infer<typeof schema>;

const defaultValues: FormType = {
  file: null,
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * The Avatar component for uploading a single profile image.
 */
function Avatar() {
  const [localLoading, setLocalLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [copied, setCopied] = useState(false);

  const [getPresignedUrl] = useGetPresignedUrlMutation();

  const {
    data: configs,
    isLoading: isLoadingConfigs,
    refetch: refetchConfigs,
  } = useGetConfigsQuery('key=AVATAR', { refetchOnMountOrArgChange: true });

  const methods = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  });

  const { reset, watch } = methods;

  useEffect(() => {
    let fileData = defaultValues.file;
    const configData = configs?.data?.data;

    if (configData) {
      try {
        const parsed = JSON.parse(configData);

        if (parsed?.file) {
          // Limpar url (não assinada, inválida após reload); displayUrl usará media (base64)
          fileData = { ...parsed.file, url: undefined };
        }
      } catch {
        // Intentionally ignore JSON parse errors
      }
    }

    reset({ file: fileData });
    setHasChanges(false);
  }, [configs, reset]);

  useEffect(() => {
    const subscription = watch(() => {
      setHasChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

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
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Erro ao fazer upload para S3: ${response.status} - ${response.statusText}`);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files || files.length === 0) return;

    const file = files[0];

    if (file.size > MAX_FILE_SIZE) {
      alert(`Arquivo excede o tamanho máximo de 10MB`);
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      alert(`Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.`);
      return;
    }

    const fileData: FormType['file'] = {
      name: file.name,
      mimeType: file.type,
      size: file.size,
      uploadStatus: 'pending',
    };

    try {
      // Converter para base64 para exibição imediata e após reload
      const base64Data = await fileToBase64(file);
      fileData.media = base64Data;

      const response = await getPresignedUrl({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      }).unwrap();

      const { uploadUrl, s3Key } = response.data;
      await uploadToS3(file, uploadUrl);

      fileData.s3Key = s3Key;
      fileData.url = uploadUrl.split('?')[0]; // URL pública S3 — salva no value
      fileData.uploadStatus = 'success';
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      fileData.uploadStatus = 'error';
      fileData.error = 'Erro ao fazer upload da imagem';
    }

    methods.setValue('file', fileData, { shouldDirty: true, shouldValidate: true });
    setHasChanges(true);
  };

  const handleRemoveFile = () => {
    methods.setValue('file', null, { shouldDirty: true, shouldValidate: true });
    setHasChanges(true);
  };

  const currentFile = watch('file');
  const displayUrl = currentFile?.media ? `data:${currentFile.mimeType};base64,${currentFile.media}` : currentFile?.url || null;

  const handleCopyShareLink = () => {
    const s3Url = configs?.data?.value;

    if (!s3Url) return;

    const shareUrl = `${window.location.origin}/criar-avatar?avatar=${encodeURIComponent(s3Url)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <FormProvider {...methods}>
      <Root
        scroll="content"
        header={
          <AvatarHeader
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
              <form className="flex flex-1 flex-col p-8 max-w-2xl">
                <Typography variant="body1" className="mb-2">
                  Faça o upload da imagem de avatar que será utilizada nas comunicações da campanha.
                </Typography>
                <Typography variant="caption" className="text-gray-500 mb-6 block">
                  Esta imagem será sobreposta à foto do usuário. O exemplo abaixo demonstra como ficará o resultado final.
                </Typography>
                <Typography variant="body2" className=" mb-6 block">
                  Envie uma imagem com fundo transparente em formato PNG, com dimensões quadradas (recomendada: 500x500px) para melhor resultado.
                </Typography>

                <Box className="flex flex-col md:flex-row gap-10 items-start">
                  {/* Preview composto: foto de exemplo + overlay do avatar */}
                  <Box className="flex flex-col items-center gap-3">
                    <Typography variant="subtitle2" className="text-gray-500">
                      Pré-visualização
                    </Typography>
                    <Box className="relative overflow-hidden rounded-lg border border-gray-200" sx={{ width: 300, height: 300, flexShrink: 0 }}>
                      {/* Foto de demonstração (simulando a foto do usuário) */}
                      <Box
                        component="img"
                        src="/assets/images/avatars/male-15.jpg"
                        alt="Foto do usuário (exemplo)"
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />

                      {/* Overlay do avatar enviado */}
                      {displayUrl && (
                        <Box
                          component="img"
                          src={displayUrl}
                          alt="Overlay do avatar"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      )}

                      {/* Placeholder quando não há avatar */}
                      {!displayUrl && (
                        <Box className="absolute inset-0 flex items-center justify-center" sx={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
                          <Typography variant="caption" className="text-white text-center px-4">
                            Nenhum avatar enviado
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Typography variant="caption" className="text-gray-400 text-center">
                      Foto de exemplo · Avatar sobreposto
                    </Typography>
                  </Box>

                  {/* Coluna de upload */}
                  <Box className="flex flex-col gap-4 flex-1">
                    <Typography variant="subtitle2" className="text-gray-500">
                      Avatar enviado
                    </Typography>

                    {displayUrl ? (
                      <Box className="relative w-fit">
                        <Box
                          component="img"
                          src={displayUrl}
                          alt="Avatar"
                          className="rounded-lg border border-gray-200"
                          sx={{ width: 160, height: 160, objectFit: 'cover', display: 'block' }}
                        />
                        <IconButton
                          size="small"
                          onClick={handleRemoveFile}
                          color="error"
                          className="absolute top-1 right-1"
                          sx={{ backgroundColor: 'white', '&:hover': { backgroundColor: '#fee2e2' } }}
                        >
                          <FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>
                        </IconButton>
                      </Box>
                    ) : (
                      <Box
                        className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50"
                        sx={{ width: 160, height: 160 }}
                      >
                        <FuseSvgIcon size={40} color="disabled">
                          heroicons-outline:photo
                        </FuseSvgIcon>
                      </Box>
                    )}

                    {/* Informações do arquivo */}
                    {currentFile && (
                      <Box>
                        <Typography variant="body2" className="font-medium truncate max-w-xs">
                          {currentFile.name}
                        </Typography>
                        {currentFile.size && (
                          <Typography variant="caption" className="text-gray-500">
                            {currentFile.size < 1024 * 1024
                              ? (currentFile.size / 1024).toFixed(1) + ' KB'
                              : (currentFile.size / (1024 * 1024)).toFixed(1) + ' MB'}
                          </Typography>
                        )}
                        {currentFile.uploadStatus === 'error' && (
                          <Typography variant="caption" className="text-red-500 block mt-1">
                            {currentFile.error}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Botão de upload */}
                    <input
                      accept={ACCEPTED_IMAGE_TYPES.join(',')}
                      style={{ display: 'none' }}
                      id="avatar-upload"
                      type="file"
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="avatar-upload">
                      <Box
                        component="span"
                        className="flex items-center gap-2 px-4 py-2 rounded border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors text-sm"
                      >
                        <FuseSvgIcon size={18}>heroicons-outline:cloud-upload</FuseSvgIcon>
                        {currentFile ? 'Trocar imagem' : 'Selecionar imagem'}
                      </Box>
                    </label>

                    <Typography variant="caption" className="text-gray-400">
                      Formatos aceitos: JPEG, PNG, WebP. Tamanho máximo: 10MB.
                    </Typography>

                    {/* Botão de compartilhar link público */}
                    {configs?.data?.value && (
                      <Tooltip title={copied ? 'Link copiado!' : 'Copiar link público para criação do avatar'} placement="top">
                        <Button
                          variant="outlined"
                          color={copied ? 'success' : 'secondary'}
                          size="small"
                          startIcon={<FuseSvgIcon size={16}>{copied ? 'heroicons-outline:check' : 'heroicons-outline:link'}</FuseSvgIcon>}
                          onClick={handleCopyShareLink}
                          sx={{ alignSelf: 'flex-start' }}
                        >
                          {copied ? 'Copiado!' : 'Copiar link de compartilhamento'}
                        </Button>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </form>
            )}
          </div>
        }
      />
    </FormProvider>
  );
}

export default Avatar;
