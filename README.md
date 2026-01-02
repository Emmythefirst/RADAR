## RADAR - Xandeum pNode Analytics Platform

> Real-time monitoring and analytics dashboard for Xandeum's decentralized storage network

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Features in Detail](#features-in-detail)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🌟 Overview

**RADAR** is a comprehensive analytics and monitoring platform for the Xandeum decentralized storage network. It provides real-time insights into pNode (personal node) performance, network health, storage capacity, and SLA compliance tracking.

### Key Capabilities

- 📊 **Real-time Dashboard** - Live network statistics and performance metrics
- 🗺️ **Interactive Network Map** - Geographic visualization of global pNode distribution
- 🏆 **Leaderboard System** - Rankings based on reputation scores and uptime
- ⚡ **Performance Monitoring** - Track node health, uptime, and SLA compliance
- 🔔 **Alert Management** - Configurable notifications for network events
- ⭐ **Watchlist Feature** - Save and track your favorite nodes
- 🔐 **Authentication** - Secure user accounts with Google OAuth support
-🌗 **Dark/Light Theme** - Beautiful beige light mode and dark slate mode 

---

## ✨ Features

### 🎛️ Dashboard
- Network-wide statistics (total nodes, online nodes, storage capacity)
- Real-time health distribution visualization
- Performance metrics charts (response time, uptime trends)
- Storage utilization breakdown

### 🗺️ Storage Weather Map
- Interactive Leaflet-based world map
- Real-time node location markers
- Color-coded health indicators
- Node status filtering (online/offline/degraded)

### 🏆 Leaderboard
- Top 50 nodes by reputation score
- Multiple time windows (24h, 7d, 30d)
- Badge system (High Reputation, Top 1%, Trusted Node)
- SLA tier classification (Gold, Silver, Bronze)

### 📋 All Nodes
- Comprehensive node listing with advanced filtering
- Search by node ID, operator, or location
- Sort by reputation, uptime, storage, or status
- Watchlist quick-add functionality

### 👤 Node Profile
- Detailed node information and statistics
- 24h, 7d, and 30d uptime history
- SLA percentile ranking
- Storage and network details
- Performance trend visualization

### ⭐ Watchlist
- Personal node tracking
- Quick access to favorite nodes
- One-click add/remove functionality
- Detailed performance cards

### 🔔 Alert Manager
- Create custom alerts for:
  - Node offline events
  - Storage capacity warnings
  - New node detection
  - Performance degradation
- Multiple notification channels (email, webhook, Discord)
- Enable/disable alerts on-demand

### 🔐 Authentication
- Email/password registration and login
- Google OAuth integration
- JWT-based secure authentication
- Protected routes and API endpoints

---

## 🎨 Features in Detail

### Reputation Scoring Algorithm

Nodes are scored based on multiple factors:

```javascript
Reputation Score = 
  (Uptime × 0.4) + 
  (SLA Percentile × 0.25) + 
  (Availability × 0.2) + 
  (Longevity × 0.15)
```

**Components:**
- **Uptime (40%)** - 24-hour uptime percentage
- **SLA Percentile (25%)** - Ranking compared to other nodes
- **Availability (20%)** - Current online status
- **Longevity (15%)** - Time since node joined network

### Badge System

Nodes earn badges based on performance:

- 🟢 **High Reputation** - 99.9%+ uptime
- 🏆 **Top 1%** - In top 1% of all nodes by SLA percentile
- ✅ **Trusted Node** - Verified operator

### SLA Tiers

Nodes are classified into tiers:

- 🥇 **GOLD** - 99.9%+ uptime
- 🥈 **SILVER** - 99.5%+ uptime
- 🥉 **BRONZE** - 99.0%+ uptime

### Theme Support

RADAR supports both dark and light themes:
- Toggle in navbar
- Preference saved to localStorage
- Smooth transitions between themes


## 🛠️ Tech Stack

### Frontend
- **React 18.2** - UI framework
- **React Router 6** - Client-side routing
- **Recharts** - Data visualization
- **Leaflet** - Interactive maps
- **Lucide React** - Icon library
- **Axios** - HTTP client
- **Socket.io Client** - Real-time updates

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - WebSocket server
- **JWT** - Authentication
- **Winston** - Logging
- **Node-cron** - Scheduled tasks

### Additional Tools
- **Google OAuth 2.0** - Social authentication
- **Nodemailer** - Email notifications
- **Express Rate Limit** - API rate limiting
- **Bcrypt** - Password hashing

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 16.0.0 ([Download](https://nodejs.org/))
- **npm** >= 8.0.0 (comes with Node.js)
- **MongoDB** >= 5.0 ([Download](https://www.mongodb.com/try/download/community))
- **Git** ([Download](https://git-scm.com/downloads))

### Optional
- **MongoDB Compass** - GUI for MongoDB ([Download](https://www.mongodb.com/products/compass))

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Emmythefirst/RADAR.git
cd RADAR
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/xandeum-analytics

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Known pNodes (comma-separated list of pNode endpoints)
KNOWN_PNODES=node1.xandeum.io:6000,node2.xandeum.io:6000

# Rate Limiting
RATE_LIMIT_WINDOW MS=900000
RATE_LIMIT_MAX_REQUESTS=100

#Logging
LOG_LEVEL=info

```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

### Setting Up Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000`
   - Your production URL
6. Copy Client ID and Client Secret to `.env` files

---

## 🏃 Running the Application

### Development Mode

**Start MongoDB** (if running locally):
```bash
mongod
```

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The application will open at `http://localhost:3000`

---

## 📁 Project Structure

```
RADAR/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT authentication
│   │   ├── errorHandler.js       # Error handling
│   │   └── rateLimiter.js        # API rate limiting
│   ├── models/
│   │   ├── Alert.js              # Alert schema
│   │   ├── Metric.js             # Metrics schema
│   │   ├── PNode.js              # Node schema
│   │   └── User.js               # User schema
│   ├── routes/
│   │   ├── alerts.js             # Alert endpoints
│   │   ├── auth.js               # Authentication endpoints
│   │   ├── metrics.js            # Metrics endpoints
│   │   ├── pnodes.js             # Node endpoints
│   │   └── watchlist.js          # Watchlist endpoints
│   ├── services/
│   │   ├── alertService.js       # Alert processing
│   │   ├── gossipService.js      # Node data fetching
│   │   ├── metricsCollector.js   # Metrics aggregation
│   │   ├── prpcService.js        # pRPC communication
│   │   └── uptimeService.js      # SLA calculations
│   ├── utils/
│   │   ├── geoLocation.js        # IP geolocation
│   │   ├── logger.js             # Winston logger
│   │   ├── reputationScore.js    # Scoring algorithm
│   │   └── slaPercentile.js      # SLA ranking
│   ├── jobs/
│   │   └── scheduledTasks.js     # Cron jobs
│   ├── .env
│   ├── server.js                 # Entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── AlertManager/
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/
│   │   │   ├── HealthPieChart/
│   │   │   ├── Leaderboard/
│   │   │   ├── MetricsChart/
│   │   │   ├── Navbar/
│   │   │   ├── NodeBadges/
│   │   │   ├── NodeProfile/
│   │   │   ├── NodeTable/
│   │   │   ├── SLAHistory/
│   │   │   ├── StorageWeatherMap/
│   │   │   └── Watchlist/
│   │   ├── contexts/
│   │   │   ├── AppContext.js     # Global app state
│   │   │   ├── AuthContext.js    # Authentication state
│   │   │   └── ThemeContext.js   # Dark/light theme
│   │   ├── hooks/
│   │   │   └── usePNodes.js      # Custom hook for nodes
│   │   ├── services/
│   │   │   └── api.js            # Axios instance
│   │   ├── utils/
│   │   │   ├── badgeToEmoji.js
│   │   │   ├── formatters.js
│   │   │   ├── sla.js
│   │   │   └── uptimeBadge.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── index.css
│   │   └── theme.css
│   ├── .env
│   └── package.json
│
├── .gitignore
├── README.md
```

---

## 📡 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Create a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "watchlist": []
  }
}
```

#### POST `/api/auth/signin`
Login to existing account.

#### POST `/api/auth/google`
Authenticate with Google OAuth.

#### GET `/api/auth/me`
Get current user profile (requires auth).

---

### Node Endpoints

#### GET `/api/pnodes`
Get all pNodes with optional filtering.

**Query Parameters:**
- `status` - Filter by status (online/offline/degraded)
- `limit` - Number of results (default: 100)
- `skip` - Pagination offset
- `sort` - Sort field (e.g., -reputationScore)

**Response:**
```json
{
  "success": true,
  "count": 50,
  "total": 150,
  "data": [
    {
      "nodeId": "node-public-key",
      "status": "online",
      "reputationScore": 95.5,
      "storage": {
        "total": 1099511627776,
        "used": 549755813888,
        "available": 549755813888
      },
      "location": {
        "city": "New York",
        "country": "United States",
        "latitude": 40.7128,
        "longitude": -74.0060
      },
      "uptime": {
        "uptime24h": 99.95,
        "uptime7d": 99.87
      }
    }
  ]
}
```

#### GET `/api/pnodes/:nodeId`
Get detailed information for a specific node.

#### GET `/api/pnodes/stats/network`
Get network-wide statistics.

#### GET `/api/pnodes/leaderboard/top`
Get top-ranked nodes.

#### GET `/api/pnodes/map/data`
Get node location data for map visualization.

---

### Watchlist Endpoints

#### POST `/api/watchlist`
Add a node to user's watchlist (requires auth).

**Request:**
```json
{
  "nodeId": "node-public-key"
}
```

#### DELETE `/api/watchlist`
Remove a node from watchlist (requires auth).

#### GET `/api/watchlist`
Get user's watchlist with node details (requires auth).

---

### Alert Endpoints

#### GET `/api/alerts`
Get all alerts for a user.

#### POST `/api/alerts/subscribe`
Create a new alert.

**Request:**
```json
{
  "type": "node_offline",
  "nodeId": "optional-node-id",
  "destination": {
    "email": "alerts@example.com",
    "webhook": "https://your-webhook-url.com"
  }
}
```

#### PATCH `/api/alerts/:alertId/toggle`
Enable/disable an alert.

#### DELETE `/api/alerts/:alertId`
Delete an alert.

---

### Metrics Endpoints

#### GET `/api/metrics/:nodeId`
Get historical metrics for a node.

**Query Parameters:**
- `timeframe` - 1h, 24h, 7d, 30d
- `limit` - Number of data points

#### GET `/api/metrics/network/aggregate`
Get aggregated network metrics over time.

---

🔐 Security Features
* JWT-based authentication
* Password hashing with bcrypt
* Protected API routes
* Input validation and sanitization
* Rate limiting on API endpoints
* Secure cookie handling
* CORS protection

---

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running:
```bash
mongod
```

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Kill the process using the port:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

#### CORS Error in Browser
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution:** Check that `REACT_APP_API_URL` in frontend `.env` matches your backend URL.

#### JWT Token Expired
**Solution:** Clear localStorage and login again:
```javascript
localStorage.removeItem('token')
```

#### Google OAuth Not Working
**Solution:** 
1. Verify `GOOGLE_CLIENT_ID` matches in both frontend and backend
2. Check authorized redirect URIs in Google Cloud Console
3. Ensure Google+ API is enabled

#### No Nodes Showing
1. Check KNOWN_PNODES environment variable and ensure port is set to :6000
2. Verify pNode endpoints are accessible
3. Check backend logs for gossip fetch errors


---

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Google OAuth login
- [ ] Dashboard loads with correct statistics
- [ ] Network map displays nodes
- [ ] Leaderboard shows ranked nodes
- [ ] All Nodes table loads and filters work
- [ ] Node profile page displays correctly
- [ ] Watchlist add/remove functionality
- [ ] Alert creation and management
- [ ] Theme toggle works
- [ ] WebSocket real-time updates

### API Testing with cURL

```bash
# Test signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'

# Test login
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Test getting nodes (replace TOKEN)
curl http://localhost:5000/api/pnodes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit with descriptive messages**
   ```bash
   git commit -m "Add amazing feature"
   ```
5. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Code Style Guidelines

- Use ES6+ syntax
- Follow Airbnb style guide for JavaScript
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

---

## 🙏 Acknowledgments

- Xandeum team for the decentralized storage network
- React and Node.js communities
- All contributors and testers

---

## 📞 Support

For support, please:
- Open an issue on [GitHub](https://github.com/Emmythefirst/RADAR/issues)
- Contact: ehonemmanuel7@gmail.com

---

## 🗺️ Roadmap

### Planned Features

- [ ] Advanced analytics dashboard
- [ ] Historical performance graphs
- [ ] Node comparison tool
- [ ] Export reports to PDF
- [ ] Mobile app (React Native)
- [ ] Advanced alert conditions
- [ ] Multi-language support
- [ ] Dark/light theme customization
- [ ] API rate limiting dashboard
- [ ] Real-time chat for node operators

---

**Built with ❤️ for the Xandeum community**