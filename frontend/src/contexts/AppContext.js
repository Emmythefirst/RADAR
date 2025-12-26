import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';
import io from 'socket.io-client';
import api from '../services/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const AppProvider = ({ children }) => {
  const [nodes, setNodes] = useState([]);
  const [networkStats, setNetworkStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Cache management
  const cacheRef = useRef({
    nodes: { data: [], timestamp: 0 },
    stats: { data: null, timestamp: 0 }
  });

  const isInitialLoad = useRef(true);
  const isRefreshing = useRef(false);

  // Check if cache is still valid
  const isCacheValid = (cacheType) => {
    const cache = cacheRef.current[cacheType];
    return Date.now() - cache.timestamp < CACHE_DURATION;
  };

  /* ===========================
     Fetch Functions with Caching
     =========================== */

  const fetchNodes = useCallback(async (silent = false, forceRefresh = false) => {
    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && isCacheValid('nodes') && cacheRef.current.nodes.data.length > 0) {
      console.log('📦 Using cached nodes data');
      setNodes(cacheRef.current.nodes.data);
      return;
    }

    if (isRefreshing.current && silent) return;
    
    try {
      if (!silent && isInitialLoad.current) {
        setLoading(true);
      }

      console.log('🌐 Fetching fresh nodes data...');
      const response = await api.get('/pnodes?limit=200');
      
      if (response.data?.success) {
        const data = response.data.data;
        let nodesData = [];
        
        if (Array.isArray(data)) {
          nodesData = data;
        } else if (Array.isArray(data?.nodes)) {
          nodesData = data.nodes;
        }

        // Update state and cache
        setNodes(nodesData);
        cacheRef.current.nodes = {
          data: nodesData,
          timestamp: Date.now()
        };
        console.log('✅ Nodes cached:', nodesData.length);
      }
    } catch (error) {
      console.error('Error fetching nodes:', error);
      // Use cached data on error if available
      if (cacheRef.current.nodes.data.length > 0) {
        console.log('⚠️ Using stale cache due to error');
        setNodes(cacheRef.current.nodes.data);
      }
    }
  }, []);

  const fetchNetworkStats = useCallback(async (silent = false, forceRefresh = false) => {
    // Return cached stats if valid
    if (!forceRefresh && isCacheValid('stats') && cacheRef.current.stats.data) {
      console.log('📦 Using cached stats data');
      setNetworkStats(cacheRef.current.stats.data);
      return;
    }

    try {
      if (!silent && isInitialLoad.current) {
        setLoading(true);
      }

      console.log('🌐 Fetching fresh stats data...');
      const response = await api.get('/pnodes/stats/network');
      
      if (response.data?.success) {
        // Update state and cache
        setNetworkStats(response.data.data);
        cacheRef.current.stats = {
          data: response.data.data,
          timestamp: Date.now()
        };
        console.log('✅ Stats cached');
      }
    } catch (error) {
      console.error('Error fetching network stats:', error);
      // Use cached data on error if available
      if (cacheRef.current.stats.data) {
        console.log('⚠️ Using stale stats cache due to error');
        setNetworkStats(cacheRef.current.stats.data);
      }
    }
  }, []);

  /* ===========================
     Initial Load
     =========================== */

  useEffect(() => {
    const loadInitialData = async () => {
      // Try to use cache first
      const hasValidCache = isCacheValid('nodes') && isCacheValid('stats');
      
      if (hasValidCache && cacheRef.current.nodes.data.length > 0) {
        console.log('⚡ Loading from cache immediately');
        setNodes(cacheRef.current.nodes.data);
        setNetworkStats(cacheRef.current.stats.data);
        setLoading(false);
        isInitialLoad.current = false;
        return;
      }

      // Fetch fresh data
      setLoading(true);
      await Promise.all([
        fetchNodes(false, false),
        fetchNetworkStats(false, false)
      ]);

      setLoading(false);
      isInitialLoad.current = false;
    };

    loadInitialData();
  }, [fetchNodes, fetchNetworkStats]);

  /* ===========================
     WebSocket Setup
     =========================== */

  useEffect(() => {
    const socketUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';

    const socket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true
    });

    socket.on('connect', () => {
      console.log('🔌 WebSocket connected');
    });

    socket.on('nodes-updated', async () => {
      if (isRefreshing.current || isInitialLoad.current) return;
      isRefreshing.current = true;

      console.log('🔄 WebSocket: Refreshing data...');
      await Promise.all([
        fetchNodes(true, true), // Force refresh
        fetchNetworkStats(true, true)
      ]);

      isRefreshing.current = false;
    });

    socket.on('alert', (data) => {
      addNotification(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchNodes, fetchNetworkStats]);

  /* ===========================
     Notifications
     =========================== */

  const addNotification = (notification) => {
    setNotifications(prev => [
      { id: Date.now(), ...notification },
      ...prev.slice(0, 9)
    ]);
  };

  const removeNotification = (id) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );
  };

  /* ===========================
     Clear Cache (for debugging)
     =========================== */

  const clearCache = useCallback(() => {
    cacheRef.current = {
      nodes: { data: [], timestamp: 0 },
      stats: { data: null, timestamp: 0 }
    };
    console.log('🗑️ Cache cleared');
  }, []);

  /* ===========================
     Context Value
     =========================== */

  const value = {
    nodes,
    networkStats,
    loading,
    notifications,

    // Refresh with optional force
    refreshNodes: (force = false) => fetchNodes(true, force),
    refreshNetworkStats: (force = false) => fetchNetworkStats(true, force),
    clearCache,

    addNotification,
    removeNotification
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};