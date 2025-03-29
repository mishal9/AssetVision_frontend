/**
 * Calculates the compound annual growth rate (CAGR)
 * @param startValue - The initial investment value
 * @param endValue - The final investment value
 * @param years - The number of years
 * @returns The CAGR as a decimal (e.g., 0.08 for 8%)
 */
export function calculateCAGR(startValue: number, endValue: number, years: number): number {
  if (startValue <= 0 || years <= 0) return 0;
  return Math.pow(endValue / startValue, 1 / years) - 1;
}

/**
 * Calculates the standard deviation of an array of numbers
 * @param values - Array of numeric values
 * @returns The standard deviation
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length <= 1) return 0;
  
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
  
  return Math.sqrt(avgSquareDiff);
}

/**
 * Calculates the Sharpe ratio
 * @param portfolioReturn - The portfolio return (decimal)
 * @param riskFreeRate - The risk-free rate (decimal)
 * @param standardDeviation - The standard deviation of portfolio returns
 * @returns The Sharpe ratio
 */
export function calculateSharpeRatio(
  portfolioReturn: number,
  riskFreeRate: number,
  standardDeviation: number
): number {
  if (standardDeviation === 0) return 0;
  return (portfolioReturn - riskFreeRate) / standardDeviation;
}

/**
 * Calculates the maximum drawdown from a series of values
 * @param values - Array of portfolio values over time
 * @returns The maximum drawdown as a decimal (e.g., 0.25 for 25%)
 */
export function calculateMaxDrawdown(values: number[]): number {
  if (values.length <= 1) return 0;
  
  let maxDrawdown = 0;
  let peak = values[0];
  
  for (let i = 1; i < values.length; i++) {
    if (values[i] > peak) {
      peak = values[i];
    } else {
      const drawdown = (peak - values[i]) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
  }
  
  return maxDrawdown;
}
