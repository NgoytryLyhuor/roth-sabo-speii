export const formatCurrency = (amount: number, currency: 'USD' | 'KHR'): string => {
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: currency === 'USD' ? 2 : 0,
    maximumFractionDigits: currency === 'USD' ? 2 : 0,
  });

  return currency === 'USD' ? `${formattedAmount}$` : `${formattedAmount}៛`;
};

export const parseCurrencyInput = (value: string): number => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
};
