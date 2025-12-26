import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import api from '../../services/api';
import './SLAHistoryChart.css';

const SLAHistoryChart = ({ nodeId, window = '30d' }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(
          `/pnodes/${nodeId}/sla/history?window=${window}`
        );

        if (res.data.success) {
          setData(
            res.data.data.map(d => ({
              date: new Date(d.timestamp).toLocaleDateString(),
              uptime: d.uptime
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load SLA history', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [nodeId, window]);

  if (loading) {
    return <div className="chart-loading">Loading SLA trend…</div>;
  }

  return (
    <div className="sla-chart-container">
      <h3>SLA Uptime Trend</h3>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[95, 100]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="uptime"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SLAHistoryChart;
