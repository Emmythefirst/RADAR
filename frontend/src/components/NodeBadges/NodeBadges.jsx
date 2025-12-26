import React from 'react';
import { badgeToEmoji } from '../../utils/badgeToEmoji';
import './NodeBadges.css';

/**
 * Legacy / descriptive badges (text-based)
 * These are OPTIONAL and still supported
 */
const BADGES = {
  high_uptime: { label: '99.9% SLA', color: 'green' },
  reliable_veteran: { label: 'Veteran', color: 'blue' },
  storage_titan: { label: 'Storage Titan', color: 'purple' },
  speed_demon: { label: 'Low Latency', color: 'orange' },
  early_adopter: { label: 'Early Adopter', color: 'gray' }
};

const NodeBadges = ({
  badges = [],
  slaTier,
  isTopOnePercent = false
}) => {
  if (!badges.length && !slaTier && !isTopOnePercent) {
    return <span className="no-badges">⭐</span>;
  }

  return (
    <div className="node-badges">
      {/* SLA tier badge */}
      {slaTier && (
        <span
          className={`node-badge badge-sla sla-${slaTier}`}
          title={`${slaTier.toUpperCase()} SLA`}
        >
          {slaTier.toUpperCase()}
        </span>
      )}

      {/* Top 1% badge (explicit flag) */}
      {isTopOnePercent && (
        <span
          className="node-badge badge-emoji"
          title="Top 1% node"
        >
          🏆
        </span>
      )}

      {/* Backend badges (emoji-first, text fallback) */}
      {badges.map((badge, index) => {
        const emoji = badgeToEmoji(badge);
        const legacy = BADGES[badge];

        return (
          <span
            key={`${badge}-${index}`}
            className={`node-badge ${legacy ? `badge-${legacy.color}` : 'badge-emoji'}`}
            title={legacy?.label || badge}
          >
            {emoji || legacy?.label || '⭐'}
          </span>
        );
      })}
    </div>
  );
};

export default NodeBadges;
