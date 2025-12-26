import React, { useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Activity, Server, HardDrive, TrendingUp } from 'lucide-react';
import MetricsChart from '../MetricsChart/MetricsChart';
import HealthPieChart from '../HealthPieChart/HealthPieChart';
import { formatBytes, formatUptime } from '../../utils/formatters';
import './Dashboard.css';

/* =========================
   Health helpers (LOCAL)
   ========================= */
const getHealthCategory = (score = 0) => {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'degraded';
  return 'unhealthy';
};

const getHealthGradient = (score = 0) => {
  if (score >= 85)
    return 'linear-gradient(90deg, #059669 0%, #10b981 100%)';
  if (score >= 70)
    return 'linear-gradient(90deg, #65a30d 0%, #84cc16 100%)';
  if (score >= 50)
    return 'linear-gradient(90deg, #ea580c 0%, #f97316 100%)';
  return 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)';
};

const getHealthGlow = (score = 0) => {
  if (score >= 85) return '0 0 12px #10b981';
  if (score >= 70) return '0 0 12px #84cc16';
  if (score >= 50) return '0 0 12px #f97316';
  return '0 0 12px #ef4444';
};

const Dashboard = () => {
  const { networkStats, refreshNetworkStats } = useApp();

  /* =========================
     Initial + polling refresh
     ========================= */
  useEffect(() => {
    refreshNetworkStats();
    const interval = setInterval(refreshNetworkStats, 30000);
    return () => clearInterval(interval);
  }, [refreshNetworkStats]);

  if (!networkStats) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading network statistics...</p>
      </div>
    );
  }

  /* =========================
     Extract stats safely
     ========================= */
  const {
    totalNodes = 0,
    onlineNodes = 0,
    sla = {},
    storage = {},
    avgScore = 0,
    healthDistribution = {}
  } = networkStats;

  const uptimePercentage = sla.uptime7d ?? 0;
  const healthCategory = getHealthCategory(avgScore);

  /* =========================
     Top cards
     ========================= */
  const stats = [
    {
      title: 'Total Nodes',
      value: totalNodes,
      icon: Server,
      color: 'blue'
    },
    {
      title: 'Online Nodes',
      value: onlineNodes,
      icon: Activity,
      color: 'green',
      subtitle: `${formatUptime(uptimePercentage)} uptime`
    },
    {
      title: 'Total Storage',
      value: formatBytes(storage.totalStorage),
      icon: HardDrive,
      color: 'purple',
      subtitle: `${formatBytes(storage.availableStorage)} available`
    },
    {
      title: 'Avg Reputation',
      value: avgScore.toFixed(1),
      icon: TrendingUp,
      color: 'orange',
      subtitle: `${formatUptime(uptimePercentage)} avg uptime`
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Network Overview</h1>
        <p className="dashboard-subtitle">
          Real-time analytics for Xandeum pNode network
        </p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card stat-card-${stat.color}`}>
            <div className="stat-icon">
              <stat.icon size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">{stat.title}</p>
              <h3 className="stat-value">{stat.value}</h3>
              {stat.subtitle && (
                <p className="stat-subtitle">{stat.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-charts">
        <MetricsChart />
      </div>

      <div className="dashboard-info">
        {/* =====================
            Network Health
           ===================== */}
        <div className="info-card">
          <h3>Network Health</h3>

          <div className="health-indicator">
            <div className="health-bar">
              <div
                className="health-bar-fill"
                data-health={healthCategory}
                style={{
                  width: `${avgScore}%`,
                  background: getHealthGradient(avgScore),
                  boxShadow: getHealthGlow(avgScore)
                }}
              />
            </div>

            <span className="health-percentage">
              {avgScore.toFixed(1)}%
            </span>
          </div>

          <HealthPieChart healthDistribution={healthDistribution} />
        </div>

        {/* =====================
            Storage
           ===================== */}
        <div className="info-card">
          <h3>Storage Utilization</h3>
          <div className="storage-breakdown">
            <div className="storage-item">
              <span>Used:</span>
              <strong>{formatBytes(storage.usedStorage)}</strong>
            </div>
            <div className="storage-item">
              <span>Available:</span>
              <strong>{formatBytes(storage.availableStorage)}</strong>
            </div>
            <div className="storage-item">
              <span>Total:</span>
              <strong>{formatBytes(storage.totalStorage)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
