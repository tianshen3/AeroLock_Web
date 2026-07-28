/**
 * Utility to convert backend INR (Rupees) values into USD ($) and format currency.
 * Standard Exchange Rate: 1 USD = 83.33 INR
 */
export const INR_TO_USD_RATE = 83.33;

/**
 * Converts a price in INR (Rupees) to USD ($).
 */
export function convertRupeesToUSD(amountInRupees?: number | string | null): number {
  if (amountInRupees === undefined || amountInRupees === null || amountInRupees === '') {
    return 0;
  }
  const numericValue = typeof amountInRupees === 'string' ? parseFloat(amountInRupees) : amountInRupees;
  if (isNaN(numericValue)) {
    return 0;
  }
  return numericValue / INR_TO_USD_RATE;
}

/**
 * Formats a numeric price in INR (Rupees) into a formatted USD ($) currency string.
 * Example: 5000 (INR) -> "$60"
 */
export function formatCurrency(
  amountInINR?: number | string | null,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  if (amountInINR === undefined || amountInINR === null || amountInINR === '') {
    return '$0';
  }

  const numericINR = typeof amountInINR === 'string' ? parseFloat(amountInINR) : amountInINR;

  if (isNaN(numericINR)) {
    return '$0';
  }

  // If the value is small (e.g. already converted to USD < 500 and not thousands), keep or convert:
  // Backend stores integer rupees (e.g., 5000, 4500, 4000).
  const usdValue = numericINR > 100 ? numericINR / INR_TO_USD_RATE : numericINR;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(usdValue);
  } catch {
    return `$${Math.round(usdValue).toLocaleString()}`;
  }
}

/**
 * Calculates itemized breakdown for a seat's base price in USD including taxes.
 * Default tax rate is 18% (Aviation Tax & Service Charge).
 */
export function calculatePriceBreakdown(
  basePriceInINR?: number | null,
  taxRatePercent: number = 18
): {
  basePriceUSD: number;
  taxAmountUSD: number;
  totalPriceUSD: number;
  formattedBase: string;
  formattedTax: string;
  formattedTotal: string;
} {
  const rawINR = typeof basePriceInINR === 'number' && !isNaN(basePriceInINR) ? basePriceInINR : 4500;
  const baseINR = rawINR > 100 ? rawINR : rawINR * INR_TO_USD_RATE;
  
  const taxINR = (baseINR * taxRatePercent) / 100;
  const totalINR = baseINR + taxINR;

  const baseUSD = Math.round(baseINR / INR_TO_USD_RATE);
  const taxUSD = Math.round(taxINR / INR_TO_USD_RATE);
  const totalUSD = Math.round(totalINR / INR_TO_USD_RATE);

  return {
    basePriceUSD: baseUSD,
    taxAmountUSD: taxUSD,
    totalPriceUSD: totalUSD,
    formattedBase: formatCurrency(baseINR),
    formattedTax: formatCurrency(taxINR),
    formattedTotal: formatCurrency(totalINR),
  };
}
