import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Star, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatBytes, formatUptime, getStatusBadgeColor } from '../../utils/formatters';
import './Watchlist.css';

const WatchlistPage = () => {
  const { token, isAuthenticated, updateWatchlist } = useAuth();
  const navigate = useNavigate();
  const [watchlistNodes, setWatchlistNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/watchlist', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setWatchlistNodes(response.data.watchlist);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchWatchlist();
  }, [isAuthenticated, fetchWatchlist, navigate]);

  const removeFromWatchlist = async (nodeId) => {
    try {
      const response = await api.delete('/watchlist', {
        data: { nodeId },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        updateWatchlist(response.data.watchlist);
        setWatchlistNodes(prev => prev.filter(node => node.nodeId !== nodeId));
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  // ✅ FIX: Navigate to node profile with correct nodeId
  const handleViewDetails = (nodeId) => {
    navigate(`/nodes/${encodeURIComponent(nodeId)}`, {
      state: { from: '/watchlist' }
    });
  };

  if (loading) {
    return (
      <div className="watchlist-container">
        <div className="watchlist-loading">
          <div className="spinner"></div>
          <p>Loading your watchlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="watchlist-container">
      <div className="watchlist-header">
        <div>
          <h1 className="watchlist-title">
            <Star size={32} fill="#fbbf24" />
            My Watchlist
          </h1>
          <p className="watchlist-subtitle">
            Track your favorite pNodes - {watchlistNodes.length} node{watchlistNodes.length !== 1 ? 's' : ''} saved
          </p>
        </div>
      </div>

      {watchlistNodes.length === 0 ? (
        <div className="watchlist-empty">
          <Star size={64} className="empty-icon" />
          <h3>Your watchlist is empty</h3>
          <p>Start adding pNodes to track their performance</p>
          <button 
            onClick={() => navigate('/nodes')}
            className="browse-btn"
          >
            Browse All Nodes
          </button>
        </div>
      ) : (
        <div className="watchlist-grid">
          {watchlistNodes.map((node) => (
            <div key={node.nodeId} className="watchlist-card">
              <div className="watchlist-card-header">
                <div className="node-info">
                  <h3>{node.operator?.name || 'Anonymous'}</h3>
                  <code className="node-id">{node.nodeId.substring(0, 12)}...</code>
                </div>
                <button
                  onClick={() => removeFromWatchlist(node.nodeId)}
                  className="remove-btn"
                  title="Remove from watchlist"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="watchlist-card-body">
                <div className="stat-row">
                  <span className="stat-label">Status</span>
                  <span className={`status-badge ${getStatusBadgeColor(node.status)}`}>
                    {node.status}
                  </span>
                </div>

                <div className="stat-row">
                  <span className="stat-label">Reputation</span>
                  <span className="stat-value">{node.reputationScore?.toFixed(1) || 'N/A'}</span>
                </div>

                <div className="stat-row">
                  <span className="stat-label">Uptime</span>
                  <span className="stat-value">{formatUptime(node.performance?.uptime || 0)}</span>
                </div>

                <div className="stat-row">
                  <span className="stat-label">Storage</span>
                  <span className="stat-value">{formatBytes(node.storage?.total || 0)}</span>
                </div>

                {node.location?.city && (
                  <div className="stat-row">
                    <span className="stat-label">Location</span>
                    <span className="stat-value">
                      {node.location.city}, {node.location.country}
                    </span>
                  </div>
                )}
              </div>

              <div className="watchlist-card-footer">
                {/* ✅ FIX: Call handleViewDetails with nodeId */}
                <button 
                  onClick={() => handleViewDetails(node.nodeId)}
                  className="view-details-btn"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;