// middleware/auth.js
const jwt = require('jsonwebtoken');
const winston = require('winston');
const morgan = require('morgan');

require('dotenv').config(); // Make sure you have dotenv installed

const secretKey = process.env.SECRET_KEY;

if (!secretKey) {
  throw new Error('SECRET_KEY environment variable is not set');
}

// Set up Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/auth.log' }),
  ],
});

// Set up Morgan request logger
const requestLogger = morgan('combined', {
  stream: {
    write: (message) => {
      logger.info(message);
    },
  },
});

const verifyToken = (req, res, next) => {
  requestLogger(req, res, () => {}); // Log the request

  console.log('Headers received:', req.headers); // Log all headers
  const token = req.header('authorization')?.replace('Bearer ', ''); 
  console.log('Token received:', token); // Log the token

  if (!token) {
    logger.error('No token provided');
    return res.status(401).send({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      logger.error('Token has expired:', err);
      return res.status(401).send({ error: 'Token has expired' });
    } else {
      logger.error('Invalid token:', err);
      return res.status(401).send({ error: 'Invalid token' });
    }
  }
};

module.exports = { verifyToken };