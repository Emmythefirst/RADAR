export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 Format uptime percentage with 100% cap
 */
export const formatUptime = (uptime) => {
  const value = Number(uptime);
  
  // Handle invalid values
  if (!Number.isFinite(value) || value < 0) return '0.00%';
  
  // Cap at 100% maximum
  const cappedValue = Math.min(100, value);
  
  return `${cappedValue.toFixed(2)}%`;
};

export const formatLatency = (ms) => {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatRelativeTime = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export const getStatusColor = (status) => {
  const colors = {
    online: 'text-green-400',
    offline: 'text-red-400',
    degraded: 'text-yellow-400'
  };
  return colors[status] || 'text-gray-400';
};

export const getStatusBadgeColor = (status) => {
  const colors = {
    online: 'bg-green-500/20 text-green-400 border-green-500/50',
    offline: 'bg-red-500/20 text-red-400 border-red-500/50',
    degraded: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';
};