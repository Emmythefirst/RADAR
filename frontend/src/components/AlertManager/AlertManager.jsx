import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Power } from 'lucide-react';
import api from '../../services/api';
import './AlertManager.css';

const AlertManager = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'node_offline',
    nodeId: '',
    email: '',
    webhook: ''
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/alerts?userId=default-user');
      if (response.data.success) {
        setAlerts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/alerts/subscribe', {
        userId: 'default-user',
        ...formData,
        destination: {
          email: formData.email,
          webhook: formData.webhook
        }
      });

      if (response.data.success) {
        fetchAlerts();
        setShowForm(false);
        setFormData({ type: 'node_offline', nodeId: '', email: '', webhook: '' });
      }
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  };

  const toggleAlert = async (alertId) => {
    try {
      await api.patch(`/alerts/${alertId}/toggle`);
      fetchAlerts();
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  const deleteAlert = async (alertId) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;
    
    try {
      await api.delete(`/alerts/${alertId}`);
      fetchAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const alertTypes = [
    { value: 'node_offline', label: 'Node Offline' },
    { value: 'capacity_warning', label: 'Storage Capacity Warning' },
    { value: 'new_node', label: 'New Node Joined' },
    { value: 'performance_degradation', label: 'Performance Degradation' }
  ];

  return (
    <div className="alert-manager-container">
      <div className="alert-header">
        <div>
          <h1 className="alert-title">Alert Manager</h1>
          <p className="alert-subtitle">Configure notifications for network events</p>
        </div>
        
        <button onClick={() => setShowForm(!showForm)} className="add-alert-btn">
          <Plus size={20} />
          New Alert
        </button>
      </div>

      {showForm && (
        <div className="alert-form-container">
          <form onSubmit={handleSubmit} className="alert-form">
            <h3>Create New Alert</h3>
            
            <div className="form-group">
              <label>Alert Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                {alertTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Node ID (optional)</label>
              <input
                type="text"
                value={formData.nodeId}
                onChange={(e) => setFormData({ ...formData, nodeId: e.target.value })}
                placeholder="Leave empty for network-wide alerts"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Webhook URL (optional)</label>
              <input
                type="url"
                value={formData.webhook}
                onChange={(e) => setFormData({ ...formData, webhook: e.target.value })}
                placeholder="https://your-webhook-url.com"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">Create Alert</button>
              <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="alert-loading">
          <div className="spinner"></div>
          <p>Loading alerts...</p>
        </div>
      ) : (
        <div className="alerts-list">
          {alerts.length === 0 ? (
            <div className="no-alerts">
              <Bell size={48} className="no-alerts-icon" />
              <p>No alerts configured yet</p>
              <p className="no-alerts-subtitle">Create your first alert to get started</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert._id} className={`alert-card ${!alert.enabled ? 'disabled' : ''}`}>
                <div className="alert-info">
                  <div className="alert-type">
                    <Bell size={20} />
                    <span>{alertTypes.find(t => t.value === alert.type)?.label}</span>
                  </div>
                  {alert.nodeId && (
                    <div className="alert-node">
                      Node: <code>{alert.nodeId.substring(0, 12)}...</code>
                    </div>
                  )}
                  <div className="alert-destination">
                    📧 {alert.destination.email}
                  </div>
                  {alert.triggerCount > 0 && (
                    <div className="alert-stats">
                      Triggered {alert.triggerCount} times
                    </div>
                  )}
                </div>

                <div className="alert-actions">
                  <button
                    onClick={() => toggleAlert(alert._id)}
                    className={`toggle-btn ${alert.enabled ? 'active' : ''}`}
                    title={alert.enabled ? 'Disable' : 'Enable'}
                  >
                    <Power size={18} />
                  </button>
                  <button
                    onClick={() => deleteAlert(alert._id)}
                    className="delete-btn"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AlertManager;