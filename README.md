# Xandeum pNode Analytics Platform

A comprehensive real-time analytics dashboard for monitoring and managing Xandeum pNode network performance, built with React and Node.js.

![Dashboard Preview](./screenshots/dashboard.png)

## 🌟 Features

### Core Functionality
- **Real-time Network Monitoring** - Live updates of network health and performance metrics
- **Interactive Dashboard** - Visual representation of network statistics with dynamic charts
- **Global Node Map** - Geographic visualization of pNode distribution worldwide
- **Performance Leaderboard** - Rankings based on uptime, reputation, and SLA compliance
- **Node Management** - Detailed individual node profiles and metrics
- **Watchlist System** - Track and monitor favorite nodes
- **Alert Management** - Configure custom alerts for network events
- **Dark/Light Theme** - Beautiful beige light mode and dark slate mode

### Technical Features
- **Optimized Performance** - Smart caching system with 5-minute TTL
- **Real-time Updates** - WebSocket integration for live data streaming
- **Responsive Design** - Fully responsive across desktop, tablet, and mobile devices
- **Authentication** - Secure JWT-based authentication with Google OAuth support
- **RESTful API** - Well-structured backend API with MongoDB integration

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **MongoDB** (v5.0 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/xandeum-pnode-analytics.git
cd xandeum-pnode-analytics
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

### Environment Configuration

#### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/xandeum-analytics

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Known pNodes (comma-separated list of pNode endpoints)
KNOWN_PNODES=http://node1-address:port,http://node2-address:port
```

#### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000

# Google OAuth Client ID
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

### Running the Application

#### Development Mode

1. **Start MongoDB** (if running locally)
```bash
mongod
```

2. **Start the backend server**
```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

3. **Start the frontend development server** (in a new terminal)
```bash
cd frontend
npm start
```

The frontend will open automatically at `http://localhost:3000`

#### Production Mode

1. **Build the frontend**
```bash
cd frontend
npm run build
```

2. **Start the backend in production**
```bash
cd backend
NODE_ENV=production npm start
```

3. **Serve the frontend** (use nginx, Apache, or any static file server)

## 📁 Project Structure

```
xandeum-pnode-analytics/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── jobs/
│   │   └── scheduledTasks.js     # Cron jobs for data collection
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT authentication
│   │   └── errorHandler.js       # Global error handling
│   ├── models/
│   │   ├── Metric.js             # Metrics data model
│   │   ├── PNode.js              # pNode data model
│   │   └── User.js               # User data model
│   ├── routes/
│   │   ├── auth.js               # Authentication endpoints
│   │   ├── pnodes.js             # pNode data endpoints
│   │   ├── metrics.js            # Metrics endpoints
│   │   ├── alerts.js             # Alert management
│   │   └── watchlist.js          # Watchlist endpoints
│   ├── services/
│   │   ├── gossipService.js      # pNode gossip protocol integration
│   │   ├── uptimeService.js      # Uptime calculation service
│   │   └── prpcService.js        # pRPC communication service
│   ├── utils/
│   │   ├── logger.js             # Logging utility
│   │   ├── reputationScore.js    # Reputation calculation
│   │   └── slaPercentile.js      # SLA percentile calculation
│   ├── .env                      # Environment variables
│   ├── server.js                 # Main server file
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/             # Login/Signup components
│   │   │   ├── Dashboard/        # Dashboard components
│   │   │   ├── Leaderboard/      # Leaderboard view
│   │   │   ├── NodeTable/        # All nodes table
│   │   │   ├── NodeProfile/      # Individual node details
│   │   │   ├── StorageWeatherMap/# Global map view
│   │   │   ├── Watchlist/        # Watchlist management
│   │   │   ├── AlertManager/     # Alert configuration
│   │   │   └── Navbar/           # Navigation bar
│   │   ├── contexts/
│   │   │   ├── AppContext.jsx    # Global app state
│   │   │   ├── AuthContext.jsx   # Authentication state
│   │   │   └── ThemeContext.jsx  # Theme management
│   │   ├── hooks/
│   │   │   ├── usePNodes.js      # Custom hook for pNode data
│   │   │   └── useWebSocket.js   # WebSocket hook
│   │   ├── services/
│   │   │   └── api.js            # Axios API configuration
│   │   ├── utils/
│   │   │   └── formatters.js     # Utility functions
│   │   ├── App.jsx               # Main app component
│   │   ├── App.css               # Global styles
│   │   ├── theme.css             # Theme variables
│   │   └── index.js              # Entry point
│   ├── .env                      # Environment variables
│   └── package.json
│
└── README.md                     # This file
```

## 🔌 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
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
Login with email and password.

#### POST `/api/auth/google`
Login with Google OAuth.

#### GET `/api/auth/me`
Get current user information (requires authentication).

### pNode Endpoints

#### GET `/api/pnodes`
Get all pNodes with optional filters.

**Query Parameters:**
- `status` - Filter by status (online/offline/degraded)
- `limit` - Number of results (default: 100)
- `skip` - Pagination offset
- `sort` - Sort field (default: -reputationScore)

#### GET `/api/pnodes/:nodeId`
Get detailed information about a specific node.

#### GET `/api/pnodes/leaderboard/top`
Get top-performing nodes.

**Query Parameters:**
- `limit` - Number of results (default: 50)
- `window` - Time window (24h/7d/30d)

#### GET `/api/pnodes/stats/network`
Get aggregated network statistics.

#### GET `/api/pnodes/map/data`
Get node locations for map visualization.

### Metrics Endpoints

#### GET `/api/metrics/:nodeId`
Get historical metrics for a specific node.

**Query Parameters:**
- `timeframe` - Time range (1h/24h/7d/30d)
- `limit` - Number of data points

#### GET `/api/metrics/network/aggregate`
Get aggregated network-wide metrics.

### Watchlist Endpoints

#### GET `/api/watchlist`
Get user's watchlist.

#### POST `/api/watchlist`
Add a node to watchlist.

**Request Body:**
```json
{
  "nodeId": "node-public-key"
}
```

#### DELETE `/api/watchlist`
Remove a node from watchlist.

## 🎨 Features in Detail

### Dashboard
- Live network statistics (total nodes, online nodes, storage, reputation)
- Real-time performance charts
- Network health visualization
- Storage utilization breakdown

### Network Map
- Interactive global map using Leaflet
- Color-coded nodes by health status
- Filter by status and health
- Click nodes for detailed information

### Leaderboard
- Rank nodes by performance metrics
- Configurable time windows (24h, 7d, 30d)
- SLA tier badges (Gold, Silver, Bronze)
- Node reputation scores

### Node Management
- Detailed node profiles
- Historical uptime data
- SLA compliance tracking
- Performance metrics charts

### Watchlist
- Save favorite nodes
- Quick access to monitored nodes
- Real-time status updates

## 🔧 Configuration

### Customizing the Theme

The platform supports light and dark themes. Colors can be customized in `frontend/src/theme.css`:

```css
:root {
  --accent-primary: #f97316;  /* Change primary color */
  --bg-primary: #0f172a;      /* Change background */
  /* ... other variables */
}
```

### Adjusting Data Collection

Modify collection intervals in `backend/jobs/scheduledTasks.js`:

```javascript
// Fetch gossip data every 30 seconds
cron.schedule('*/30 * * * * *', async () => {
  // ...
});
```

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify MongoDB is accessible on the specified port

**Frontend Can't Connect to Backend**
- Verify backend is running on correct port
- Check `REACT_APP_API_URL` in frontend `.env`
- Ensure CORS is properly configured

**Google OAuth Not Working**
- Verify Google Client ID in both `.env` files
- Check Google Cloud Console OAuth configuration
- Ensure authorized redirect URIs are set

**No Nodes Showing**
- Check `KNOWN_PNODES` environment variable
- Verify pNode endpoints are accessible
- Check backend logs for gossip fetch errors

## 📊 Performance Optimization

The platform includes several optimization features:

- **Smart Caching**: 5-minute cache for frequently accessed data
- **Request Batching**: Grouped API calls to reduce server load
- **Lazy Loading**: Components load on demand
- **WebSocket Updates**: Real-time updates without polling
- **Database Indexing**: Optimized MongoDB queries

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure cookie handling
- CORS protection

## 🚀 Deployment

### Deploying to Production

1. **Build the frontend**
```bash
cd frontend
npm run build
```

2. **Set production environment variables**

3. **Deploy backend** (e.g., to Heroku, DigitalOcean, AWS)

4. **Deploy frontend** (e.g., to Netlify, Vercel, S3)

5. **Configure DNS and SSL certificates**

### Recommended Hosting

- **Backend**: Heroku, DigitalOcean, AWS EC2, Railway
- **Frontend**: Netlify, Vercel, AWS S3 + CloudFront
- **Database**: MongoDB Atlas (managed)

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For questions or support, please open an issue on GitHub or contact [your-email@example.com]

## 🙏 Acknowledgments

- Built for the Xandeum pNode network
- Uses Recharts for data visualization
- Map powered by Leaflet and OpenStreetMap
- Icons by Lucide React

---

**Built with ❤️ for the Xandeum Community**