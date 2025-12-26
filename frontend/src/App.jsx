import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import WeatherMap from './components/StorageWeatherMap/WeatherMap';
import Leaderboard from './components/Leaderboard/Leaderboard';
import NodeTable from './components/NodeTable/NodeTable';
import AlertManager from './components/AlertManager/AlertManager';
import WatchlistPage from './components/Watchlist/WatchlistPage';
import NodeProfile from './components/NodeProfile/NodeProfile';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './theme.css'; // Import theme variables
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/" />;
};

function AppRoutes() {
  // Remove preload class after initial render
  useEffect(() => {
    document.body.classList.remove('preload');
  }, []);

  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/map" element={
              <ProtectedRoute>
                <WeatherMap />
              </ProtectedRoute>
            } />

            <Route path="/leaderboard" element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } />

            <Route path="/nodes" element={
              <ProtectedRoute>
                <NodeTable />
              </ProtectedRoute>
            } />

            <Route path="/nodes/:nodeId" element={
              <ProtectedRoute>
                <NodeProfile />
              </ProtectedRoute>
            } />

            <Route path="/alerts" element={
              <ProtectedRoute>
                <AlertManager />
              </ProtectedRoute>
            } />

            <Route path="/watchlist" element={
              <ProtectedRoute>
                <WatchlistPage />
              </ProtectedRoute>
            } />

            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />

            <Route path="/signup" element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  // Add preload class on initial mount
  useEffect(() => {
    document.body.classList.add('preload');
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;