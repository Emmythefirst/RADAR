import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Server, Activity, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import NodeBadges from '../NodeBadges/NodeBadges';
import SLAHistory from '../SLAHistory/SLAHistory';
import { formatUptime, formatBytes } from '../../utils/formatters';
import { getUptimeBadge } from '../../utils/uptimeBadge';
import './NodeProfile.css';

const NodeProfile = () => {
  const { nodeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const [node, setNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const previousPage = location.state?.from || '/leaderboard';

  useEffect(() => {
    const fetchNode = async () => {
      if (!nodeId) {
        setError('No node ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const decodedNodeId = decodeURIComponent(nodeId);
        
        console.log('🔍 Fetching node:', decodedNodeId);
        
        // Increased timeout to 30 seconds for slow backend
        const res = await api.get(`/pnodes/${decodedNodeId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: 30000 
        });

        console.log('✅ API Response:', res.data);

        if (res.data?.success && res.data.data) {
          setNode(res.data.data);
          console.log('✅ Node loaded:', res.data.data);
        } else {
          console.error('❌ Invalid response format:', res.data);
          setError('Node not found');
          setNode(null);
        }
      } catch (err) {
        console.error('❌ Error loading node profile:', err);
        console.error('Error response:', err.response?.data);
        
        if (err.code === 'ECONNABORTED') {
          setError('Request timeout - Backend is taking too long. Please try again.');
        } else if (err.response?.status === 401) {
          setError('Authentication required. Please log in.');
          setTimeout(() => navigate('/login'), 2000);
        } else if (err.response?.status === 404) {
          setError('Node not found in database');
        } else {
          setError(err.response?.data?.error || 'Failed to load node profile');
        }
        
        setNode(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNode();
  }, [nodeId, token, navigate]);

  const handleGoBack = () => {
    navigate(previousPage);
  };

  if (loading) {
    return (
      <div className="node-profile-container">
        <div className="node-profile-loading">
          <div className="spinner"></div>
          <p>Loading node profile...</p>
          <p className="loading-hint">This may take a moment...</p>
        </div>
      </div>
    );
  }

  if (error || !node) {
    return (
      <div className="node-profile-container">
        <div className="node-profile-error">
          <div className="error-icon">❌</div>
          <h2>{error || 'Node not found'}</h2>
          <p className="error-description">
            {error === 'Request timeout - Backend is taking too long. Please try again.' 
              ? 'The server is responding slowly. This might be due to backend processing or network issues.'
              : 'The node you\'re looking for doesn\'t exist or couldn\'t be loaded.'}
          </p>
          <p className="error-details">
            Node ID: <code>{nodeId}</code>
          </p>
          <div className="error-actions">
            <button onClick={handleGoBack} className="back-button">
              <ArrowLeft size={20} />
              Back to {previousPage === '/leaderboard' ? 'Leaderboard' : 'All Nodes'}
            </button>
            <button onClick={() => window.location.reload()} className="retry-button">
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const uptime24h = node.sla?.uptime24h ?? 0;
  const uptime7d = node.sla?.uptime7d ?? 0;
  const percentile = node.sla?.percentile ?? null;
  const isTopOnePercent = node.sla?.top1Percent === true;

  const uptimeHistory = {
    '24h': uptime24h,
    '7d': uptime7d,
    '30d': node.sla?.uptime30d ?? 0
  };

  return (
    <div className="node-profile-container">
      <div className="node-profile-header">
        <button onClick={handleGoBack} className="back-button">
          <ArrowLeft size={20} />
          Back to {previousPage === '/leaderboard' ? 'Leaderboard' : 'All Nodes'}
        </button>
        <h1>Node Profile</h1>
      </div>

      <div className="node-profile-card">
        <div className="node-header-section">
          <div className="node-title-area">
            <div className="uptime-badge-large">
              {getUptimeBadge(uptime24h)}
            </div>
            <div className="node-info">
              <h2>{node.operator?.name || 'Anonymous Node'}</h2>
              <code className="node-id-full">{node.nodeId}</code>
            </div>
          </div>

          <NodeBadges
            badges={node.badges || []}
            slaTier={node.performance?.slaPercentile >= 99 ? 'GOLD' : 
                     node.performance?.slaPercentile >= 95 ? 'SILVER' : 'BRONZE'}
            isTopOnePercent={isTopOnePercent}
          />
        </div>

        <div className="node-stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Activity size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">24h Uptime</span>
              <strong className="stat-value">{formatUptime(uptime24h)}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Activity size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">7-Day Uptime</span>
              <strong className="stat-value">{formatUptime(uptime7d)}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">SLA Percentile</span>
              <strong className="stat-value">
                {percentile !== null ? `Top ${percentile}%` : '—'}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Reputation Score</span>
              <strong className="stat-value">{node.reputationScore?.toFixed(1) || 'N/A'}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Server size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Status</span>
              <strong className={`stat-value status-${node.status}`}>
                {node.status || 'Unknown'}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <MapPin size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Location</span>
              <strong className="stat-value">
                {node.location?.city 
                  ? `${node.location.city}, ${node.location.country}`
                  : 'Unknown'}
              </strong>
            </div>
          </div>
        </div>

        <div className="node-details-section">
          <div className="details-card">
            <h3>Storage Information</h3>
            <div className="detail-row">
              <span>Total Storage:</span>
              <strong>{formatBytes(node.storage?.total || 0)}</strong>
            </div>
            <div className="detail-row">
              <span>Used Storage:</span>
              <strong>{formatBytes(node.storage?.used || 0)}</strong>
            </div>
            <div className="detail-row">
              <span>Available Storage:</span>
              <strong>{formatBytes(node.storage?.available || 0)}</strong>
            </div>
          </div>

          <div className="details-card">
            <h3>Network Information</h3>
            <div className="detail-row">
              <span>Gossip Address:</span>
              <code>{node.gossipAddress || 'N/A'}</code>
            </div>
            <div className="detail-row">
              <span>RPC Address:</span>
              <code>{node.rpcAddress || 'N/A'}</code>
            </div>
            <div className="detail-row">
              <span>Version:</span>
              <strong>{node.version || 'Unknown'}</strong>
            </div>
          </div>
        </div>

        <section className="sla-section">
          <SLAHistory uptime={uptimeHistory} />
        </section>
      </div>
    </div>
  );
};

export default NodeProfile;