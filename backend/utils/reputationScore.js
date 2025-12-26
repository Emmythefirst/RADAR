function calculateReputationScore(node) {
  let score = 0;

  // Uptime (40%)
  const uptime = node.performance?.uptime ?? 0;
  score += Math.min(uptime, 100) * 0.4;

  //  SLA percentile (25%)
  const percentile = node.performance?.slaPercentile ?? 0;
  score += percentile * 0.25;

  //  Availability (20%)
  if (node.status === 'online') score += 20;

  // Longevity (15%)
  if (node.firstSeen) {
    const days =
      (Date.now() - new Date(node.firstSeen)) / (1000 * 60 * 60 * 24);

    if (days > 365) score += 15;
    else if (days > 180) score += 10;
    else if (days > 90) score += 5;
  }

  return Number(score.toFixed(2));
}

/**
 * Assign badges based on already-calculated metrics
 * PURE FUNCTION
 */
function assignBadges(node) {
  const badges = [];

  const uptime = node.performance?.uptime ?? 0;
  const percentile = node.performance?.slaPercentile ?? 0;

  // Map metrics to enum values allowed in schema
  if (uptime >= 99.9) badges.push('highReputation'); // uptime badge
  if (percentile >= 99) badges.push('top_1_percent');        // percentile badge
  if (node.operator?.verified) badges.push('trustedNode'); // verified operator badge

  return badges;
}

module.exports = {
  calculateReputationScore,
  assignBadges
};
