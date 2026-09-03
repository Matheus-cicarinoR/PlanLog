export const formatCurrency = (value: number): string => {
 return new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
 }).format(value || 0);
};

export const formatDate = (dateStr?: string): string => {
 if (!dateStr) return '-';
 try {
  // Caso seja formato YYYY-MM-DD
  const parts = dateStr.split('-');
  if (parts.length === 3) {
   return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('pt-BR');
 } catch {
  return dateStr;
 }
};

export const formatHours = (hours: number): string => {
 if (hours === undefined || hours === null) return '0.0h';
 return `${Number(hours).toFixed(1)}h`;
};
