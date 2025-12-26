import React from 'react';
import { formatUptime } from '../../utils/formatters';
import './SLAHistory.css';

const SLA_TIERS = [
  { label: 'Excellent', min: 99.9 },
  { label: 'Good', min: 99.0 },
  { label: 'Degraded', min: 95.0 },
  { label: 'Unhealthy', min: 0 }
];

const getTier = (uptime) =>
  SLA_TIERS.find(t => uptime >= t.min)?.label || 'Unknown';

const SLAHistory = ({ uptime }) => {
  return (
    <div className="sla-history">
      <h3>SLA History</h3>

      <table>
        <thead>
          <tr>
            <th>Window</th>
            <th>Uptime</th>
            <th>SLA Tier</th>
          </tr>
        </thead>
        <tbody>
          {['24h', '7d', '30d'].map(window => {
            const uptimeValue = uptime[window] || 0;
            return (
            <tr key={window}>
              <td>{window}</td>
              <td>{formatUptime(uptimeValue)}</td>
              <td className={`sla-${getTier(uptimeValue).toLowerCase()}`}>
                {getTier(uptimeValue)}
              </td>
            </tr>
            );
      })}
        </tbody>
      </table>
    </div>
  );
};

export default SLAHistory;
