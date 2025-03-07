const mongoose = require('mongoose');
const constants = require('./constants');

const connectWithRetry = async (retryCount = 5) => {
  try {
    console.log('Connecting to MongoDB with URI:', constants.MONGO_URI);
    await mongoose.connect(constants.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    if (retryCount === 0) {
      console.error('Exhausted all retries. Could not connect to MongoDB:', error);
      process.exit(1);
    } else {
      console.error(`Error connecting to MongoDB. Retrying (${retryCount} retries left):`, error);
      setTimeout(() => connectWithRetry(retryCount - 1), 5000); // Retry after 5 seconds
    }
  }
};

mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

connectWithRetry();
