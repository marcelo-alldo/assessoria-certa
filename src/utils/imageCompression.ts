/**
 * Utilitário para compressão e redimensionamento de imagens
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 a 1.0
  maxSizeKB?: number; // Tamanho máximo em KB
}

/**
 * Comprime uma imagem reduzindo sua qualidade e/ou dimensões
 */
export const compressImage = async (file: File, options: ImageCompressionOptions = {}): Promise<File> => {
  const { maxWidth = 1920, maxHeight = 1080, quality = 0.8, maxSizeKB = 500 } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calcula as novas dimensões mantendo a proporção
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        // Desenha a imagem redimensionada no canvas
        ctx?.drawImage(img, 0, 0, width, height);

        // Converte para blob com a qualidade especificada
        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              reject(new Error('Erro ao processar imagem'));
              return;
            }

            // Se ainda está muito grande, reduz a qualidade progressivamente
            let currentQuality = quality;
            let currentBlob = blob;

            while (currentBlob.size > maxSizeKB * 1024 && currentQuality > 0.1) {
              currentQuality -= 0.1;

              const newBlob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob(resolve, file.type, currentQuality);
              });

              if (newBlob) {
                currentBlob = newBlob;
              } else {
                break;
              }
            }

            // Cria um novo arquivo com o blob comprimido
            const compressedFile = new File([currentBlob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          file.type,
          quality,
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Erro ao carregar imagem'));
    };

    // Carrega a imagem
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Verifica se um arquivo é uma imagem
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * Formata o tamanho do arquivo em uma string legível
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Opções padrão para compressão de imagens do WhatsApp
 */
export const WHATSAPP_IMAGE_OPTIONS: ImageCompressionOptions = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.85,
  maxSizeKB: 800, // WhatsApp recomenda até 5MB, mas vamos usar 800KB para ser mais eficiente
};
