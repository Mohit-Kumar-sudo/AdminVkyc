require('dotenv').config();

const devConfig = {
  MONGO_URI: process.env.DEV_MONGO_URI,
  JWT_SECRET: process.env.DEV_JWT_SECRET,
};

const testConfig = {
  MONGO_URI: process.env.TEST_MONGO_URI,
  JWT_SECRET: process.env.TEST_JWT_SECRET,
};

const prodConfig = {
  MONGO_URI: process.env.PROD_MONGO_URI,
  JWT_SECRET: process.env.PROD_JWT_SECRET,
};

const defaultConfig = {
  PORT: process.env.PORT || 6969,
};

// Function to get the configuration based on the environment
const getConfig = (env) => {
  console.log('Current ENV =>', env);
  switch (env) {
    case 'development':
      return devConfig;
    case 'test':
      return testConfig;
    case 'production':
      return prodConfig;
    default:
      throw new Error(`Unknown environment: ${env}`);
  }
};

// Get the NODE_ENV, default to 'development' if not set
const env = process.env.NODE_ENV || 'development';

// Export the merged configuration using CommonJS syntax
module.exports = {
  ...defaultConfig,
  ...getConfig(env),
};
