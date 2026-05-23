// Função para formatar telefone (modificada para suportar números internacionais)
export function formatPhone(phone: string): string {
  if (!phone) return '';

  // Remove todos os caracteres não numéricos
  const cleanNumber = phone.replace(/\D/g, '');

  // Números internacionais (EUA/Canadá com código 1) - PRIORIDADE ALTA
  if (cleanNumber.startsWith('1') && cleanNumber.length === 11) {
    const areaCode = cleanNumber.slice(1, 4);
    const firstPart = cleanNumber.slice(4, 7);
    const secondPart = cleanNumber.slice(7, 11);
    return `+1 ${areaCode} ${firstPart} ${secondPart}`;
  }

  // Números brasileiros com DDI (55)
  if (cleanNumber.startsWith('55') && (cleanNumber.length === 13 || cleanNumber.length === 12)) {
    const withoutDDI = cleanNumber.slice(2);
    const ddd = withoutDDI.slice(0, 2);
    const rest = withoutDDI.slice(2);

    // Celular com 9 dígitos
    if (rest.length === 9) {
      return `+55 (${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
    }

    // Celular com 8 dígitos
    if (rest.length === 8) {
      return `+55 (${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
    }
  }

  // Números brasileiros sem DDI (10 ou 11 dígitos)
  if ((cleanNumber.length === 10 || cleanNumber.length === 11) && !cleanNumber.startsWith('55') && !cleanNumber.startsWith('1')) {
    const ddd = cleanNumber.slice(0, 2);
    const rest = cleanNumber.slice(2);

    // Celular com 9 dígitos
    if (rest.length === 9) {
      return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
    }

    // Celular com 8 dígitos
    if (rest.length === 8) {
      return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
    }
  }

  // Outros números internacionais (formato genérico)
  if (cleanNumber.length >= 10 && cleanNumber.length <= 15) {
    // Tenta identificar código do país (1-4 dígitos) e formatar adequadamente
    if (cleanNumber.length >= 12) {
      // Assume código de país de 2-3 dígitos
      const countryCode = cleanNumber.slice(0, cleanNumber.length - 10);
      const remaining = cleanNumber.slice(-10);
      const areaCode = remaining.slice(0, 3);
      const firstPart = remaining.slice(3, 6);
      const secondPart = remaining.slice(6, 10);
      return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
    } else if (cleanNumber.length === 10) {
      // Número sem código de país
      const areaCode = cleanNumber.slice(0, 3);
      const firstPart = cleanNumber.slice(3, 6);
      const secondPart = cleanNumber.slice(6, 10);
      return `(${areaCode}) ${firstPart}-${secondPart}`;
    }
  }

  // Fallback: adiciona + se parecer internacional
  if (cleanNumber.length > 10) {
    return `+${cleanNumber}`;
  }

  // Fallback final
  return phone;
}
