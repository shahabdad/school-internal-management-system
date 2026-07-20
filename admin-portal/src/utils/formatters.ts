/**
 * Formats currency values into standard USD representation ($85,000.00).
 */
export function formatCurrency(amount: number, hideCents = true): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: hideCents ? 0 : 2,
  }).format(amount);
}

/**
 * Formats numerical values with thousands separators (4,250).
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Formats seconds into human-readable duration strings (3m 40s).
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}
