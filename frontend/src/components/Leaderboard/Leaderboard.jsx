import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Medal, Award, TrendingUp, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatUptime, formatRelativeTime } from '../../utils/formatters';
import NodeBadges from '../NodeBadges/NodeBadges';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [window, setWindow] = useState('7d');

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/pnodes/leaderboard/top?window=${window}&limit=50`
      );

      if (res.data?.success) {
        setLeaderboard(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [window]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="rank-icon gold" />;
    if (rank === 2) return <Medal className="rank-icon silver" />;
    if (rank === 3) return <Award className="rank-icon bronze" />;
    return <span className="rank-number">{rank}</span>;
  };

  if (loading) {
    return (
      <div className="leaderboard-loading">
        <div className="spinner"></div>
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1>pNode Leaderboard</h1>

        <div className="timeframe-selector">
          {['24h', '7d', '30d'].map(w => (
            <button
              key={w}
              className={window === w ? 'active' : ''}
              onClick={() => setWindow(w)}
            >
              {w.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Node</th>
            <th>Operator</th>
            <th>Score</th>
            <th>Uptime</th>
            <th>Badges</th>
            <th>Joined</th>
            <th>View</th>
          </tr>
        </thead>

        <tbody>
          {leaderboard.map(node => (
            <tr key={node.nodeId}>
              <td>{getRankIcon(node.rank)}</td>

              <td>
                <code className="node-id-display">
                  {node.nodeId.slice(0, 10)}...
                </code>
              </td>

              <td>{node.operator || 'Anonymous'}</td>

              <td>
                <div className="score-cell">
                  <TrendingUp size={14} />{' '}
                  {(node.rankScore ?? 0).toFixed(1)}
                </div>
              </td>

              <td>{formatUptime(node.uptime7d ?? 0)}</td>

              <td>
                <NodeBadges badges={node.badges || []} />
              </td>

              <td>{formatRelativeTime(node.joinDate)}</td>

              <td>
                <Link 
                  to={`/nodes/${encodeURIComponent(node.nodeId)}`}
                  state={{ from: '/leaderboard' }}
                  className="view-node-btn"
                >
                  <ExternalLink size={16} />
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;