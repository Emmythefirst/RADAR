import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import api from '../../services/api';
import { formatBytes, getStatusColor } from '../../utils/formatters';
import 'leaflet/dist/leaflet.css';
import './WeatherMap.css';

const WeatherMap = () => {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMapData();
    const interval = setInterval(fetchMapData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMapData = async () => {
    try {
      const response = await api.get('/pnodes/map/data');
      if (response.data.success) {
        setNodes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNodeColor = (node) => {
    if (filter === 'health') {
      if (node.health >= 80) return '#10b981';
      if (node.health >= 50) return '#f59e0b';
      return '#ef4444';
    }
    
    switch (node.status) {
      case 'online': return '#10b981';
      case 'offline': return '#ef4444';
      case 'degraded': return '#f59e0b';
      default: return '#6366f1';
    }
  };

  const filteredNodes = nodes.filter(node => {
    if (filter === 'online') return node.status === 'online';
    if (filter === 'offline') return node.status === 'offline';
    return true;
  });

  if (loading) {
    return (
      <div className="map-loading">
        <div className="spinner"></div>
        <p>Loading network map...</p>
      </div>
    );
  }

  return (
    <div className="weather-map-container">
      <div className="map-header">
        <div>
          <h1 className="map-title">Storage Weather Map</h1>
          <p className="map-subtitle">Global pNode distribution and health status</p>
        </div>
        
        <div className="map-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Nodes
          </button>
          <button
            className={`filter-btn ${filter === 'online' ? 'active' : ''}`}
            onClick={() => setFilter('online')}
          >
            Online
          </button>
          <button
            className={`filter-btn ${filter === 'offline' ? 'active' : ''}`}
            onClick={() => setFilter('offline')}
          >
            Offline
          </button>
          <button
            className={`filter-btn ${filter === 'health' ? 'active' : ''}`}
            onClick={() => setFilter('health')}
          >
            By Health
          </button>
        </div>
      </div>

      <div className="map-stats">
        <div className="stat-item">
          <span className="stat-label">Total Nodes</span>
          <span className="stat-value">{nodes.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Showing</span>
          <span className="stat-value">{filteredNodes.length}</span>
        </div>
      </div>

      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '600px', width: '100%', borderRadius: '1rem' }}
        className="leaflet-map"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />

        {filteredNodes.map((node, index) => (
          <CircleMarker
            key={node.id || index}
            center={[node.latitude, node.longitude]}
            radius={8}
            fillColor={getNodeColor(node)}
            color="#fff"
            weight={2}
            opacity={0.8}
            fillOpacity={0.6}
          >
            <Popup>
              <div className="node-popup">
                <h4>{node.id.substring(0, 8)}...</h4>
                <p><strong>Location:</strong> {node.city}, {node.country}</p>
                <p><strong>Status:</strong> 
                  <span className={getStatusColor(node.status)}> {node.status}</span>
                </p>
                <p><strong>Health:</strong> {node.health}/100</p>
                <p><strong>Capacity:</strong> {formatBytes(node.capacity)}</p>
              </div>
            </Popup>
            <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
              {node.city || 'Unknown'} - {node.status}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="map-legend">
        <h4>Legend</h4>
        {filter === 'health' ? (
          <>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#10b981' }}></span>
              <span>Excellent (80-100)</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#f59e0b' }}></span>
              <span>Good (50-79)</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#ef4444' }}></span>
              <span>Poor (0-49)</span>
            </div>
          </>
        ) : (
          <>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#10b981' }}></span>
              <span>Online</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#f59e0b' }}></span>
              <span>Degraded</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#ef4444' }}></span>
              <span>Offline</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WeatherMap;