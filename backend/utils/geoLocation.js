const axios = require('axios');
const logger = require('./logger');

// Cache to avoid repeated API calls
const locationCache = new Map();

async function getLocationFromIP(ip) {
  try {
    // Check cache first
    if (locationCache.has(ip)) {
      return locationCache.get(ip);
    }

    // Use ip-api.com (free, no key required, 45 req/min)
    const response = await axios.get(`http://ip-api.com/json/${ip}`, {
      timeout: 5000
    });

    if (response.data.status === 'success') {
      const location = {
        country: response.data.country,
        city: response.data.city,
        latitude: response.data.lat,
        longitude: response.data.lon
      };

      // Cache the result
      locationCache.set(ip, location);
      
      return location;
    }

    return null;
  } catch (error) {
    logger.error(`Error getting location for IP ${ip}: ${error.message}`);
    return null;
  }
}

module.exports = { getLocationFromIP };