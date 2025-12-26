import React, { useState, useMemo } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { usePNodes } from '../../hooks/usePNodes';
import {
  formatBytes,
  formatUptime,
  formatRelativeTime,
  getStatusBadgeColor
} from '../../utils/formatters';
import { getUptimeBadge } from '../../utils/uptimeBadge';
import WatchlistButton from '../Watchlist/WatchlistButton';
import './NodeTable.css';

const NodeTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('reputationScore');
  const [sortOrder, setSortOrder] = useState('desc');

  const filters = useMemo(() => ({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    sort: `${sortOrder === 'desc' ? '-' : ''}${sortField}`,
    limit: 100
  }), [statusFilter, sortField, sortOrder]);

  const { nodes, loading, refreshing, refreshNodes } = usePNodes(filters);

  const filteredNodes = useMemo(() => {
    if (!searchTerm) return nodes;

    const search = searchTerm.toLowerCase();
    return nodes.filter(node =>
      node.nodeId?.toLowerCase().includes(search) ||
      node.operator?.name?.toLowerCase().includes(search) ||
      node.location?.city?.toLowerCase().includes(search)
    );
  }, [nodes, searchTerm]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="node-table-container">
      <div className="table-header">
        <div>
          <h1 className="table-title">All pNodes</h1>
          <p className="table-subtitle">Complete list of network nodes</p>
        </div>
      </div>

      <div className="table-controls">
        <div className="search-box">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search by node ID, operator, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="degraded">Degraded</option>
          </select>

          <button
            onClick={refreshNodes}
            className={`refresh-btn ${(loading || refreshing) ? 'refreshing' : ''}`}
            disabled={loading || refreshing}
          >
            <RefreshCw
              size={18}
            />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="table-stats">
        <span>
          Showing {filteredNodes.length} of {nodes.length} nodes
        </span>
      </div>

      {/* TABLE ALWAYS MOUNTED */}
      <div className="table-wrapper">
        <table className="nodes-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}></th>
              <th onClick={() => handleSort('nodeId')} className="sortable">Node ID</th>
              <th onClick={() => handleSort('status')} className="sortable">Status</th>
              <th onClick={() => handleSort('reputationScore')} className="sortable">Score</th>
              <th className="sortable">Uptime</th>
              <th onClick={() => handleSort('storage.total')} className="sortable">Storage</th>
              <th>Location</th>
              <th onClick={() => handleSort('lastSeen')} className="sortable">Last Seen</th>
            </tr>
          </thead>

          <tbody>
            {filteredNodes.map(node => {
              const uptime =
                node.uptime?.uptime24h ??
                node.performance?.uptime ??
                0;

              return (
                <tr key={node.nodeId}>
                  <td>
                    <WatchlistButton nodeId={node.nodeId} />
                  </td>

                  <td>
                    <code className="node-id">
                      {node.nodeId.slice(0, 12)}…
                    </code>
                  </td>

                  <td>
                    <span className={`status-badge ${getStatusBadgeColor(node.status)}`}>
                      {node.status}
                    </span>
                  </td>

                  <td>{node.reputationScore?.toFixed(1)}</td>

                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span>{formatUptime(uptime)}</span>
                      <span style={{ fontSize: '1.2rem' }}>
                        {getUptimeBadge(uptime)}
                      </span>
                    </div>
                  </td>

                  <td>
                    <div className="storage-info">
                      <div>{formatBytes(node.storage?.total || 0)}</div>
                      <div className="storage-detail">
                        {formatBytes(node.storage?.used || 0)} used
                      </div>
                    </div>
                  </td>

                  <td>
                    {node.location?.city
                      ? `${node.location.city}, ${node.location.country}`
                      : 'Unknown'}
                  </td>

                  <td>{formatRelativeTime(node.lastSeen)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!loading && filteredNodes.length === 0 && (
          <div className="no-results">
            <p>No nodes found matching your criteria</p>
          </div>
        )}
      </div>

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="table-loading-overlay">
          <div className="spinner"></div>
          <p>Loading nodes…</p>
        </div>
      )}
    </div>
  );
};

export default NodeTable;
