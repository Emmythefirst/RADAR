import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import './HealthPieChart.css';

const HEALTH_COLORS = {
  excellent: '#22c55e', // green
  good: '#84cc16',      // light green
  degraded: '#f59e0b',  // orange
  unhealthy: '#ef4444'  // red
};

const HEALTH_THRESHOLDS = {
  excellent: '85 – 100',
  good: '70 – 84',
  degraded: '50 – 69',
  unhealthy: '0 – 49'
};

const HealthPieChart = ({ healthDistribution = {}, height = 220 }) => {
  const data = useMemo(() => {
    return Object.keys(HEALTH_COLORS).map(key => ({
      key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: healthDistribution[key] || 0
    }));
  }, [healthDistribution]);

  if (!data.some(d => d.value > 0)) {
    return <p className="health-empty">No health data available</p>;
  }

  return (
    <div className="health-pie-chart">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={4}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={HEALTH_COLORS[entry.key]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      {/* ✅ LEGEND WITH EXPLICIT THRESHOLDS */}
      <div className="health-legend">
        {data.map(item => (
          <div key={item.key} className="legend-item">
            <span
              className="legend-dot"
              style={{ backgroundColor: HEALTH_COLORS[item.key] }}
            />
            <div className="legend-text">
              <span className="legend-label">{item.name}</span>
              <small className="legend-range">
                {HEALTH_THRESHOLDS[item.key]}
              </small>
            </div>
            <strong className="legend-value">{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthPieChart;
