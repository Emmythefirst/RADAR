/**
 * Returns an emoji badge based on uptime percentage
 */
export const getUptimeBadge = (uptime) => {
  if (typeof uptime !== 'number') return '🆕';

  if (uptime >= 99) return '🟢';   // Excellent
  if (uptime >= 95) return '🟡';   // Good
  if (uptime > 0) return '🔴';     // Poor
  return '🆕';                     // New / no data
};
