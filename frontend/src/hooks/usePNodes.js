import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

const nodeCache = {
  data: [],
  timestamp: 0,
  filters: ''
};

const CACHE_DURATION = 2 * 60 * 1000; 

export const usePNodes = (filters = {}) => {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const hasLoadedOnce = useRef(false);
  const abortControllerRef = useRef(null);

  const fetchNodes = useCallback(async (silent = false) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setError(null);

      // filters
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});

      const filterString = JSON.stringify(cleanFilters);

      // Check cache
      const isCacheValid = 
        nodeCache.data.length > 0 &&
        nodeCache.filters === filterString &&
        Date.now() - nodeCache.timestamp < CACHE_DURATION;

      if (isCacheValid && !silent) {
        console.log('📦 Using cached pNodes');
        setNodes(nodeCache.data);
        setLoading(false);
        hasLoadedOnce.current = true;
        return;
      }

      if (!hasLoadedOnce.current) {
        setLoading(true);
      } else if (!silent) {
        setRefreshing(true);
      }

      console.log('🌐 Fetching pNodes with filters:', cleanFilters);

      const params = new URLSearchParams(cleanFilters).toString();
      const res = await api.get(`/pnodes?${params}`, {
        signal: abortControllerRef.current.signal,
        timeout: 15000 
      });

      if (res.data?.success) {
        const nodeData = Array.isArray(res.data.data) ? res.data.data : [];
        setNodes(nodeData);

        // Update cache
        nodeCache.data = nodeData;
        nodeCache.timestamp = Date.now();
        nodeCache.filters = filterString;

        console.log('✅ pNodes loaded:', nodeData.length);
      }

      hasLoadedOnce.current = true;
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        console.log('Request cancelled');
        return;
      }

      console.error('Error fetching pNodes:', err);
      setError('Failed to load nodes');

      if (nodeCache.data.length > 0 && nodeCache.filters === JSON.stringify(filters)) {
        console.log('⚠️ Using cached data due to error');
        setNodes(nodeCache.data);
      }
    } finally {
      setLoading(false);
      if (!silent) {
        setTimeout(() => {
          setRefreshing(false);
        }, 500);
      } else {
        setRefreshing(false);
      }
    }
  }, [filters]);

  useEffect(() => {
    fetchNodes(false);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchNodes]);

  return {
    nodes,
    loading,
    refreshing,
    error,
    refreshNodes: () => fetchNodes(false)
  };
};