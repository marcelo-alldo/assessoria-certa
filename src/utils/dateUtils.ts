import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDateToBrazilTimezone(date: string | Date, formatPattern = 'dd/MM/yyyy HH:mm:ss'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const brazilTime = new Date(dateObj.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));

  return format(brazilTime, formatPattern, { locale: ptBR });
}
