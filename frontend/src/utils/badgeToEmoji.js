export const badgeToEmoji = (badge) => {
  switch (badge) {
    case 'highReputation':
      return '🟢';
    case 'top_1_percent':
      return '🏆';
    case 'trustedNode':
      return '✅';
    default:
      return '⭐';
  }
};
