# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

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