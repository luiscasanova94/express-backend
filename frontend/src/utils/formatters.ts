export const formatPhoneNumber = (phoneString: string | undefined | null): string => {
    if (!phoneString || typeof phoneString !== 'string') {
      return '';
    }
  
    const cleaned = phoneString.replace(/\D/g, '');
  
    if (cleaned.length === 10) {
      const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
      }
    }
  
    return phoneString;
};


export const formatIsoToLongEnglish = (isoDate: string) =>  {
  
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!m) throw new Error('Fecha inválida. Usa "YYYY-MM-DD".');

  const [_, y, mo, d] = m;
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));

  if (
    date.getUTCFullYear() !== Number(y) ||
    date.getUTCMonth() !== Number(mo) - 1 ||
    date.getUTCDate() !== Number(d)
  ) {
    throw new Error('La fecha no existe.');
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
  
}

export const formatCurrency = (value: any): string => {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  const cleanedValue = stringValue.replace(/\D/g, '');
  const number = parseInt(cleanedValue, 10);
  
  if (isNaN(number)) {
    return stringValue; 
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
  };