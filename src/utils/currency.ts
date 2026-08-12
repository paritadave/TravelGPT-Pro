export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  rate: number; // rate relative to 1 USD
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.5 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rate: 1.36 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 155.0 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.52 },
];

export function getCurrencyInfo(code: string): CurrencyInfo {
  return CURRENCIES.find((c) => c.code.toUpperCase() === code.toUpperCase()) || CURRENCIES[0];
}

/**
 * Formats a monetary amount originally in USD into the target currency.
 * @param usdAmount Amount in USD
 * @param targetCurrency Currency code (e.g. 'USD', 'INR', 'CAD', 'EUR', 'JPY', 'GBP', 'AUD')
 * @returns Formatted currency string, e.g. "₹200,400" or "CA$3,264" or "$2,400"
 */
export function formatCurrency(usdAmount: number, targetCurrency: string): string {
  const info = getCurrencyInfo(targetCurrency);
  const converted = usdAmount * info.rate;

  if (info.code === 'JPY' || info.code === 'INR') {
    return `${info.symbol}${Math.round(converted).toLocaleString()}`;
  }

  // Round neatly to whole number if larger or format with locale
  const rounded = Math.round(converted);
  return `${info.symbol}${rounded.toLocaleString()}`;
}

/**
 * Converts value between any source and target currency
 */
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  const fromInfo = getCurrencyInfo(fromCurrency);
  const toInfo = getCurrencyInfo(toCurrency);

  const amountInUSD = amount / fromInfo.rate;
  return amountInUSD * toInfo.rate;
}
