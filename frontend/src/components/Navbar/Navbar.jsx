import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Activity, Bell, LogOut, Star, Sun, Moon } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications } = useApp();
  const { user, logout, isAuthenticated } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Activity },
    { path: '/map', label: 'Network Map' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/nodes', label: 'All Nodes' },
    { path: '/alerts', label: 'Alerts' },
  ];

  // Add watchlist to nav items if user is authenticated
  if (isAuthenticated) {
    navItems.push({ path: '/watchlist', label: 'Watchlist', icon: Star });
  }

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <Activity className="brand-icon" />
          <span>RADAR</span>
        </Link>

        {/* Desktop Menu */}
        <div className="navbar-menu desktop-menu">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="navbar-actions">
          {/* Notifications */}
          <div className="navbar-notifications">
            <button 
              className="notification-button"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                {notifications.length === 0 ? (
                  <p className="empty">No alerts</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="notification-item">
                      {n.message}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* User Menu or Auth Buttons */}
          {isAuthenticated ? (
            <div className="user-menu-container">
              <button 
                className="user-menu-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="user-avatar" />
                ) : (
                  <div className="user-avatar-placeholder">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <p className="user-name">{user?.name}</p>
                    <p className="user-email">{user?.email}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  
                  {/* Theme Toggle */}
                  <button 
                    onClick={() => {
                      toggleTheme();
                    }}
                    className="dropdown-item theme-toggle"
                  >
                    {isDark ? (
                      <>
                        <Sun size={18} />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon size={18} />
                        Dark Mode
                      </>
                    )}
                  </button>

                  <div className="dropdown-divider"></div>

                  <button 
                    onClick={() => {
                      navigate('/watchlist');
                      setShowUserMenu(false);
                    }}
                    className="dropdown-item"
                  >
                    <Star size={18} />
                    Watchlist
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="dropdown-item logout"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-btn login">
                Login
              </Link>
              <Link to="/signup" className="auth-btn signup">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          
          {!isAuthenticated && (
            <>
              <div className="mobile-divider"></div>
              <Link
                to="/login"
                className="mobile-nav-link"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="mobile-nav-link"
                onClick={() => setIsOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Theme Toggle in Mobile Menu */}
          {isAuthenticated && (
            <>
              <div className="mobile-divider"></div>
              <button 
                onClick={() => {
                  toggleTheme();
                  setIsOpen(false);
                }}
                className="mobile-nav-link theme-toggle-mobile"
              >
                {isDark ? (
                  <>
                    <Sun size={18} />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon size={18} />
                    Dark Mode
                  </>
                )}
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;