import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import './MetricsChart.css';

const MetricsChart = () => {
  const [data, setData] = useState([]);
  const [timeframe, setTimeframe] = useState('24h');
  const [loading, setLoading] = useState(true);


  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/metrics/network/aggregate?timeframe=${timeframe}`);
      
      if (response.data.success) {
        const formattedData = response.data.data.map(item => ({
          time: new Date(item._id).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          responseTime: item.avgResponseTime || 0,
          uptime: item.avgUptime || 0,
          nodes: item.nodeCount || 0
        }));
        setData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return (
    <div className="metrics-chart-container">
      <div className="chart-header">
        <h3>Network Performance</h3>
        <div className="timeframe-selector">
          {['1h', '24h', '7d', '30d'].map(tf => (
            <button
              key={tf}
              className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="chart-loading">
          <div className="spinner"></div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey="time" 
              stroke="#94a3b8"
              style={{ fontSize: '0.75rem' }}
            />
            <YAxis 
              stroke="#94a3b8"
              style={{ fontSize: '0.75rem' }}
            />
            <Tooltip 
              contentStyle={{
                background: 'rgba(30, 41, 59, 0.95)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '0.5rem',
                color: '#e2e8f0'
              }}
            />
            <Legend 
              wrapperStyle={{ color: '#94a3b8' }}
            />
            <Line 
              type="monotone" 
              dataKey="responseTime" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
              name="Response Time (ms)"
            />
            <Line 
              type="monotone" 
              dataKey="uptime" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={false}
              name="Uptime %"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default MetricsChart;