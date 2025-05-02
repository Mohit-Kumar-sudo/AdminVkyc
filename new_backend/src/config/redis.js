const redis = require('redis');

// Create a Redis client
const client = redis.createClient({
    host: '127.0.0.1',
    port: 6379, // default Redis port
  });
  
  // Error handling for Redis connection
  client.on('error', (err) => {
    console.error(`Redis Error: ${err}`);
  });

// Helper function to get data from Redis
const getFromRedis = (key) => {
  return new Promise((resolve, reject) => {
    client.get(key, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data ? JSON.parse(data) : null);
      }
    });
  });
};

// Helper function to set data to Redis with an optional expiration time (in seconds)
const setToRedis = (key, value, expirationTime = null) => {
  return new Promise((resolve, reject) => {
    if (expirationTime) {
      client.setex(key, expirationTime, JSON.stringify(value), (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } else {
      client.set(key, JSON.stringify(value), (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }
  });
};

module.exports = {
  getFromRedis,
  setToRedis,
};
