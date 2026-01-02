# 🎯 RADAR – Xandeum pNode Analytics Platform

Real-time monitoring and analytics dashboard for Xandeum’s decentralized storage network.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Capabilities](#key-capabilities)
- [Features](#features)
- [Features in Detail](#features-in-detail)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Initial Setup](#initial-setup)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Performance Optimization](#performance-optimization)
- [Security Features](#security-features)
- [Troubleshooting](#troubleshooting)
- [Testing](#testing)
- [Contributing](#contributing)
- [Author](#author)
- [Acknowledgments](#acknowledgments)
- [Support](#support)
- [Roadmap](#roadmap)

---

## Overview

RADAR is a comprehensive analytics and monitoring platform for the Xandeum decentralized storage network. It provides real-time insights into pNode (personal node) performance, network health, storage capacity, and SLA compliance tracking.

---

## Key Capabilities

- 📊 Real-time dashboard with live network metrics  
- 🗺️ Interactive global storage weather map  
- 🏆 Leaderboards based on reputation and uptime  
- ⚡ Performance and SLA monitoring  
- 🔔 Configurable alerts and notifications  
- ⭐ Persistent node watchlist  
- 🔐 Secure authentication (Email & Google OAuth)  
- 🌗 Dark and light theme support  

---

## Features

### Dashboard
- Network-wide statistics (total nodes, online nodes, storage capacity)
- Health distribution pie charts
- Performance trend charts
- WebSocket auto-refresh every 30 seconds

### Storage Weather Map
- Leaflet-based interactive world map
- Real-time node markers
- Health-based color coding
- Status filtering and clustering

### Leaderboard
- Top 50 nodes by reputation score
- Time windows: 24h, 7d, 30d
- Badge system and SLA tiers
- Live updates

### All Nodes
- Advanced filtering and search
- Sorting by uptime, reputation, storage
- One-click watchlist actions
- Real-time updates

### Node Profile
- Detailed node metrics
- Uptime history (24h, 7d, 30d)
- SLA percentile ranking
- Performance trends and badges

### Watchlist
- Persistent user watchlist
- Quick access to favorite nodes
- Account-synced data

### Alert Manager
- Custom alerts for:
  - Node offline events
  - Storage capacity warnings
  - Performance degradation
  - New node detection
- Email and webhook notifications
- Alert history and toggles

### Authentication
- Email/password login
- Google OAuth
- JWT-based authentication (7-day expiry)
- Protected routes and APIs

---

## Features in Detail

### Reputation Scoring Algorithm

```javascript
Reputation Score =
  (Uptime × 0.4) +
  (SLA Percentile × 0.25) +
  (Availability × 0.2) +
  (Longevity × 0.15)

Scoring Components
	•	Uptime (40%) – 24-hour uptime (capped at 100%)
	•	SLA Percentile (25%) – Relative ranking
	•	Availability (20%) – Online status
	•	Longevity (15%) – Time on network

⸻

SLA Percentile System

Fast Hybrid Mode
	•	Cached percentiles (<100ms)
	•	Auto-refresh every 5 minutes
	•	Admin-triggered recalculation

Accuracy Mode

cd backend
node updatePercentiles.js

	•	Full metric recalculation
	•	Takes 2–5 minutes for 100+ nodes
	•	Recommended weekly

⸻

Badge System
	•	🟢 High Reputation – 99.9%+ uptime
	•	🏆 Top 1% – SLA percentile ranking
	•	✅ Trusted Node – Verified operator

SLA Tiers
	•	🥇 GOLD – 99.9%+ uptime
	•	🥈 SILVER – 99.5%+ uptime
	•	🥉 BRONZE – 99.0%+ uptime

⸻

Tech Stack

Frontend
	•	React 18
	•	React Router 6
	•	Recharts
	•	Leaflet
	•	Axios
	•	Socket.io Client

Backend
	•	Node.js
	•	Express.js
	•	MongoDB (TTL indexes)
	•	Mongoose
	•	Socket.io
	•	JWT
	•	Winston
	•	Node-cron

⸻

Prerequisites
	•	Node.js >= 16
	•	npm >= 8
	•	MongoDB >= 5
	•	Git

⸻

Installation

git clone https://github.com/Emmythefirst/RADAR.git
cd RADAR

Backend

cd backend
npm install

Frontend

cd ../frontend
npm install


⸻

Configuration

Backend .env

PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/xandeum-analytics
JWT_SECRET=your-secret-key

Frontend .env

REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000


⸻

Running the Application

# Terminal 1
cd backend
npm start

# Terminal 2
cd frontend
npm start

Open: http://localhost:3000

⸻

Initial Setup
	1.	Start MongoDB

mongod

	2.	Create an account via the web UI
	3.	Begin monitoring nodes

⸻

Project Structure

RADAR/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
├── README.md
└── .gitignore


⸻

API Documentation

Authentication
	•	POST /api/auth/signup
	•	POST /api/auth/signin
	•	POST /api/auth/google
	•	GET /api/auth/me

Nodes
	•	GET /api/pnodes
	•	GET /api/pnodes/:nodeId
	•	GET /api/pnodes/stats/network
	•	GET /api/pnodes/leaderboard/top

Watchlist
	•	POST /api/watchlist
	•	DELETE /api/watchlist
	•	GET /api/watchlist

Alerts
	•	GET /api/alerts
	•	POST /api/alerts/subscribe
	•	PATCH /api/alerts/:id/toggle
	•	DELETE /api/alerts/:id

⸻

Performance Optimization
	•	SLA percentile caching
	•	Indexed MongoDB queries
	•	TTL-based metric cleanup
	•	WebSocket real-time updates
	•	Frontend data caching

⸻

Security Features
	•	JWT authentication
	•	Password hashing (bcrypt)
	•	Rate limiting
	•	Input validation
	•	CORS protection

⸻

Troubleshooting

MongoDB Connection Error

mongod

Port Already in Use

lsof -ti:5000 | xargs kill -9


⸻

Testing

Manual Checklist
	•	Authentication
	•	Dashboard loads
	•	Map renders nodes
	•	Watchlist functions
	•	Alerts trigger

⸻

Contributing
	1.	Fork the repository
	2.	Create a feature branch

git checkout -b feature/amazing-feature

	3.	Commit changes
	4.	Push and open a Pull Request

⸻

Author

Emmy – @Emmythefirst

⸻

Acknowledgments
	•	Xandeum team
	•	React & Node.js communities

⸻

Support
	•	Open a GitHub issue
	•	Email: ehonemmanuel7@gmail.com

⸻

Roadmap

Completed
	•	Dark/Light theme
	•	SLA caching
	•	Watchlist fixes
	•	Performance optimizations

⸻

Built with ❤️ for the Xandeum community