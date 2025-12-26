export const calculatePercentile = (rank, total) => {
  if (!rank || !total || total === 0) return null;
  return Math.max(0, Math.round(100 - (rank / total) * 100));
};

export const isTopOnePercentNode = ({
  slaPercentile,
  uptime,
  minUptime = 99.9
}) => {
  return slaPercentile >= 99 && uptime >= minUptime;
};
