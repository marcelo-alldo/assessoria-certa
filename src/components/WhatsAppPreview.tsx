interface WhatsAppPreviewProps {
  message: string;
  senderName?: string;
  image?: string | null;
}

function WhatsAppPreview({ message, image }: WhatsAppPreviewProps) {
  console.log('WhatsAppPreview renderizado com message:', message, 'e image:', image);
  const formatMessage = (text: string) => {
    if (!text) return 'Digite uma mensagem ou adicione uma imagem para ver o preview...';

    return text;
  };

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div
          className="p-6 min-h-[450px] max-h-[600px] overflow-y-auto"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5ddd5' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundColor: '#e5ddd5',
          }}
        >
          <div className="flex justify-start mb-4">
            <div className="max-w-[85%] bg-white text-gray-800 rounded-lg relative shadow-sm overflow-hidden">
              {image && (
                <div className="w-full">
                  <img src={image} alt="Preview" className="w-full h-auto object-cover" style={{ maxHeight: '300px' }} />
                </div>
              )}
              {message && (
                <div className="px-4 py-3">
                  <div className="text-base leading-relaxed" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                    {formatMessage(message)}
                  </div>
                </div>
              )}
              {!message && !image && (
                <div className="px-4 py-3">
                  <div
                    className="text-base leading-relaxed text-gray-400"
                    style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}
                  >
                    {formatMessage(message)}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-end gap-1 px-4 pb-3">
                <span className="text-xs text-gray-500">{formatTime()}</span>
              </div>
              <div className="absolute -left-1 bottom-0 w-0 h-0 border-r-[8px] border-r-white border-b-[8px] border-b-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhatsAppPreview;
