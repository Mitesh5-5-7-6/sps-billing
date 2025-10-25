export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  export const formatCurrencyShort = (amount: number): string => {
    const lakhs = amount / 100000;
    return `₹${lakhs.toFixed(1)}L`;
  };
  
  export const calculatePercentage = (part: number, total: number): string => {
    if (total === 0) return '0.0';
    return ((part / total) * 100).toFixed(1);
  };
  