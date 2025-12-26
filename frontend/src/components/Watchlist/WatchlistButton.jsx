import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Watchlist.css';

const WatchlistButton = ({ nodeId }) => {
  const { user, token, updateWatchlist, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Wait for auth to load
  if (authLoading) {
    return (
      <button className="watchlist-btn loading" disabled>
        <Star size={18} />
      </button>
    );
  }

  // If not authenticated, show login prompt
  if (!isAuthenticated || !user) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate('/login', { 
            state: { 
              from: window.location.pathname,
              message: 'Please login to use watchlist feature' 
            } 
          });
        }}
        className="watchlist-btn login-required"
        title="Login to use watchlist"
      >
        <Star size={18} />
      </button>
    );
  }

  // SAFE check for watchlist - ensure it exists and is an array
  const watchlist = Array.isArray(user?.watchlist) ? user.watchlist : [];
  const isInWatchlist = watchlist.includes(nodeId);

  const handleToggle = async (e) => {
    e.stopPropagation();

    if (!token) {
      console.error('No auth token available');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      if (isInWatchlist) {
        // Remove from watchlist
        console.log('🗑️ Removing from watchlist:', nodeId);
        const response = await api.delete('/watchlist', {
          data: { nodeId },
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data?.success) {
          console.log('✅ Removed from watchlist');
          // Ensure watchlist is an array before updating
          const newWatchlist = Array.isArray(response.data.watchlist) 
            ? response.data.watchlist 
            : [];
          updateWatchlist(newWatchlist);
        }
      } else {
        // Add to watchlist
        console.log('⭐ Adding to watchlist:', nodeId);
        const response = await api.post(
          '/watchlist',
          { nodeId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data?.success) {
          console.log('✅ Added to watchlist');
          // Ensure watchlist is an array before updating
          const newWatchlist = Array.isArray(response.data.watchlist) 
            ? response.data.watchlist 
            : [];
          updateWatchlist(newWatchlist);
        }
      }
    } catch (error) {
      console.error('❌ Watchlist error:', error);
      
      // Better error handling
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        navigate('/login', { state: { from: window.location.pathname } });
      } else {
        alert(error.response?.data?.error || 'Failed to update watchlist. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`watchlist-btn ${isInWatchlist ? 'active' : ''} ${loading ? 'loading' : ''}`}
      title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
      disabled={loading}
    >
      <Star size={18} fill={isInWatchlist ? '#fbbf24' : 'none'} />
    </button>
  );
};

export default WatchlistButton;