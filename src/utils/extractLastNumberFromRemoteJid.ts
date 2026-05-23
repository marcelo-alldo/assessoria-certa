const extractLastNumberFromRemoteJid = (remoteJid: string): string | null => {
  if (!remoteJid) return null;

  // Dividir por hífen e pegar a última parte
  const parts = remoteJid.split('-');

  if (parts.length > 1) {
    let phoneNumber = parts[parts.length - 1];

    // Remover os dois primeiros dígitos "55" se existirem
    if (phoneNumber.startsWith('55') && phoneNumber.length > 2) {
      phoneNumber = phoneNumber.substring(2);
    }

    return phoneNumber;
  }

  return null;
};

export default extractLastNumberFromRemoteJid;
