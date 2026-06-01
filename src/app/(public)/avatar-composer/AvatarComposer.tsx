import { styled, Typography, Box, Button, Slider } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useCallback, useEffect, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { useSearchParams } from 'react-router';
import PageTitle from '@/components/PageTitle';

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

interface CroppedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const SIZE = 500;

async function getCroppedImg(imageSrc: string, pixelCrop: CroppedArea): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, SIZE, SIZE);

  return canvas.toDataURL('image/png');
}

/**
 * AvatarComposer — página pública para o usuário compor sua foto com o avatar da campanha.
 * Recebe a URL do avatar via query param: ?avatar=<url>
 */
function AvatarComposer() {
  const [searchParams] = useSearchParams();
  const overlayUrl = searchParams.get('avatar');

  // Data URL do overlay — convertida via fetch+blob para evitar CORS no canvas
  const [overlayDataUrl, setOverlayDataUrl] = useState<string | null>(null);
  const [isLoadingOverlay, setIsLoadingOverlay] = useState(false);
  const [overlayError, setOverlayError] = useState(false);

  useEffect(() => {
    if (!overlayUrl) return;

    setIsLoadingOverlay(true);
    setOverlayError(false);

    fetch(`/api/image-proxy?url=${encodeURIComponent(overlayUrl)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao carregar overlay');

        return res.blob();
      })
      .then((blob) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      })
      .then((dataUrl) => setOverlayDataUrl(dataUrl))
      .catch(() => setOverlayError(true))
      .finally(() => setIsLoadingOverlay(false));
  }, [overlayUrl]);

  // Foto do usuário (src para o cropper)
  const [userPhotoSrc, setUserPhotoSrc] = useState<string | null>(null);

  // Estado do crop
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null);

  // Imagem final composta
  const [composedImage, setComposedImage] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_: unknown, pixels: CroppedArea) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleUserPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUserPhotoSrc(reader.result as string);
      setComposedImage(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const handleCompose = async () => {
    if (!userPhotoSrc || !croppedAreaPixels || !overlayDataUrl) return;

    setIsComposing(true);
    try {
      // 1. Recortar a foto do usuário no tamanho 500x500
      const croppedUserPhoto = await getCroppedImg(userPhotoSrc, croppedAreaPixels);

      // 2. Compor: foto recortada + overlay (avatar da campanha)
      const overlay = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = overlayDataUrl;
      });

      const userImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = croppedUserPhoto;
      });

      const canvas = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext('2d')!;

      // Desenha a foto do usuário
      ctx.drawImage(userImg, 0, 0, SIZE, SIZE);
      // Desenha o avatar por cima
      ctx.drawImage(overlay, 0, 0, SIZE, SIZE);

      setComposedImage(canvas.toDataURL('image/png'));
    } finally {
      setIsComposing(false);
    }
  };

  const handleDownload = () => {
    if (!composedImage) return;

    const a = document.createElement('a');
    a.href = composedImage;
    a.download = 'foto-campanha.png';
    a.click();
  };

  return (
    <Root
      scroll="content"
      header={
        <div className="p-6 sm:p-8 w-full flex items-center">
          <PageTitle title="Criar meu avatar da campanha" />
        </div>
      }
      content={
        <div className="flex flex-1 flex-col">
          {!overlayUrl && (
            <Box className="p-8">
              <Typography variant="body1" color="error">
                Link inválido. O parâmetro <strong>avatar</strong> é obrigatório.
              </Typography>
            </Box>
          )}

          {overlayUrl && isLoadingOverlay && (
            <Box className="p-8 flex items-center gap-3">
              <Typography variant="body2" className="text-gray-500">
                Carregando avatar da campanha...
              </Typography>
            </Box>
          )}

          {overlayUrl && !isLoadingOverlay && overlayError && (
            <Box className="p-8">
              <Typography variant="body1" color="error">
                Não foi possível carregar o avatar da campanha. Verifique o link e tente novamente.
              </Typography>
            </Box>
          )}

          {overlayUrl && !isLoadingOverlay && !overlayError && overlayDataUrl && (
            <div className="flex flex-1 flex-col p-8 max-w-3xl gap-8">
              <Typography variant="body1" className="text-gray-600">
                Faça o upload da sua foto, ajuste o enquadramento e baixe a imagem final com o avatar da campanha.
              </Typography>

              <Box className="flex flex-col sm:flex-row gap-8 items-start">
                {/* Área de crop / preview */}
                <Box className="flex flex-col gap-3">
                  <Typography variant="subtitle2" className="text-gray-500">
                    {userPhotoSrc ? 'Ajuste sua foto' : 'Pré-visualização'}
                  </Typography>

                  <Box
                    sx={{ width: SIZE, height: SIZE, position: 'relative', flexShrink: 0, overflow: 'hidden', borderRadius: 2 }}
                    className="border border-gray-200 bg-gray-100"
                  >
                    {userPhotoSrc ? (
                      <>
                        {/* Cropper da foto do usuário */}
                        <Cropper
                          image={userPhotoSrc}
                          crop={crop}
                          zoom={zoom}
                          aspect={1}
                          onCropChange={setCrop}
                          onZoomChange={setZoom}
                          onCropComplete={onCropComplete}
                          style={{
                            containerStyle: { position: 'absolute', inset: 0 },
                            cropAreaStyle: { border: 'none', boxShadow: 'none' },
                          }}
                          showGrid={false}
                        />

                        {/* Avatar da campanha sobreposto (pointer-events:none para não bloquear o crop) */}
                        <Box
                          component="img"
                          src={overlayDataUrl}
                          alt="Avatar da campanha"
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            pointerEvents: 'none',
                            zIndex: 10,
                          }}
                        />
                      </>
                    ) : (
                      /* Sem foto: mostra só o overlay */
                      <>
                        <Box className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <FuseSvgIcon size={64} color="disabled">
                            heroicons-outline:user-circle
                          </FuseSvgIcon>
                        </Box>
                        <Box
                          component="img"
                          src={overlayDataUrl}
                          alt="Avatar da campanha"
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            zIndex: 10,
                          }}
                        />
                      </>
                    )}
                  </Box>

                  {/* Slider de zoom */}
                  {userPhotoSrc && (
                    <Box className="flex items-center gap-3">
                      <FuseSvgIcon size={18} color="action">
                        heroicons-outline:minus
                      </FuseSvgIcon>
                      <Slider value={zoom} min={1} max={3} step={0.05} onChange={(_, v) => setZoom(v as number)} color="secondary" sx={{ flex: 1 }} />
                      <FuseSvgIcon size={18} color="action">
                        heroicons-outline:plus
                      </FuseSvgIcon>
                    </Box>
                  )}
                </Box>

                {/* Coluna de ações */}
                <Box className="flex flex-col gap-4 pt-8">
                  {/* Upload da foto */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleUserPhotoSelect}
                  />
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<FuseSvgIcon size={18}>heroicons-outline:cloud-upload</FuseSvgIcon>}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {userPhotoSrc ? 'Trocar foto' : 'Selecionar minha foto'}
                  </Button>

                  {/* Gerar imagem composta */}
                  {userPhotoSrc && (
                    <Button
                      variant="contained"
                      color="secondary"
                      disabled={isComposing}
                      startIcon={<FuseSvgIcon size={18}>heroicons-outline:sparkles</FuseSvgIcon>}
                      onClick={handleCompose}
                    >
                      {isComposing ? 'Gerando...' : 'Gerar imagem final'}
                    </Button>
                  )}

                  {/* Preview + Download da imagem final */}
                  {composedImage && (
                    <Box className="flex flex-col gap-3 mt-2">
                      <Typography variant="subtitle2" className="text-gray-500">
                        Resultado
                      </Typography>
                      <Box
                        component="img"
                        src={composedImage}
                        alt="Imagem final"
                        sx={{ width: 160, height: 160, borderRadius: 2, objectFit: 'cover', display: 'block' }}
                        className="border border-gray-200"
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<FuseSvgIcon size={18}>heroicons-outline:arrow-down-tray</FuseSvgIcon>}
                        onClick={handleDownload}
                      >
                        Baixar foto
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            </div>
          )}
        </div>
      }
    />
  );
}

export default AvatarComposer;
