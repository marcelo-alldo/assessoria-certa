function remoteJidToPhone(remoteJid: string): string {
  // Remove formato de whatsapp, se existir
  if (remoteJid.includes('@')) {
    remoteJid = remoteJid.split('@')[0];
  }

  let clean = remoteJid;

  // Se o número após o DDD tiver 8 dígitos, adiciona o 9 na frente
  if (/^\d{2}\d{8}$/.test(clean)) {
    clean = clean.slice(0, 2) + '9' + clean.slice(2);
  }

  // Formata para (XX) XXXXX-XXXX
  return clean.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
}

export function remoteJidToPhoneNew(remoteJid: string): string {
  // Remove formato de whatsapp, se existir
  if (remoteJid.includes('@')) {
    remoteJid = remoteJid.split('@')[0];
  }

  // Remove apenas um prefixo 55 do início, se existir
  const clean = remoteJid.replace(/^55/, '');

  // Verifica se tem pelo menos DDD (2 dígitos) + número
  if (clean.length < 10) {
    return remoteJid; // Retorna original se muito curto
  }

  // DDD são os dois primeiros dígitos
  const ddd = clean.slice(0, 2);
  const numero = clean.slice(2);

  // Celular com 9 dígitos (começa com 9): (11) 9XXXX-XXXX
  if (numero.length === 9 && numero.startsWith('9')) {
    return `(${ddd}) ${numero.slice(0, 5)}-${numero.slice(5)}`;
  }

  // Celular com 8 dígitos ou 9 dígitos sem o 9 inicial (compatibilidade): (11) XXXX-XXXX
  if (numero.length === 8 || (numero.length === 9 && !numero.startsWith('9'))) {
    const baseNumero = numero.length === 9 ? numero.slice(1) : numero; // Remove primeiro dígito se for 9 dígitos sem começar com 9
    return `(${ddd}) ${baseNumero.slice(0, 4)}-${baseNumero.slice(4)}`;
  }

  // Fallback: retorna o número original
  return clean;
}

/**
 * Converte um telefone formatado para remoteJid do WhatsApp.
 * Exemplo: (11) 91234-5678 => 5511912345678@s.whatsapp.net
 */
export function phoneToRemoteJid(phone: string): string {
  // Remove tudo que não for número
  const digits = phone.replace(/\D/g, '');
  // Adiciona o 55 no início se não tiver
  const withDdi = digits.startsWith('55') ? digits : '55' + digits;
  return withDdi + '@s.whatsapp.net';
}

export default remoteJidToPhone;
