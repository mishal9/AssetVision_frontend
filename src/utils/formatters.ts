/**
 * Formats a number as currency
 * @param value - The number to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @param currency - The currency to use (default: 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, locale = 'en-US', currency = 'USD'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Formats a percentage value
 * @param value - The number to format as percentage
 * @param decimalPlaces - Number of decimal places to show (default: 2)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimalPlaces = 2): string {
  return `${(value * 100).toFixed(decimalPlaces)}%`;
}

/**
 * Formats a date
 * @param date - The date to format
 * @param format - The format to use (default: 'medium')
 * @param locale - The locale to use (default: 'en-US')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  format: 'short' | 'medium' | 'long' = 'medium',
  locale = 'en-US'
): string {
  const dateObj = typeof date === 'object' ? date : new Date(date);
  
  const options: Intl.DateTimeFormatOptions = 
    format === 'short' ? { month: 'numeric', day: 'numeric', year: '2-digit' } :
    format === 'medium' ? { month: 'short', day: 'numeric', year: 'numeric' } :
    { month: 'long', day: 'numeric', year: 'numeric' };
    
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}
