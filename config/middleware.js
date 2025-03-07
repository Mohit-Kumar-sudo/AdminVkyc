const morgan = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const passport = require('passport');
const express = require('express'); // Import express for built-in body parsing

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

module.exports = (app) => {
  if (isProd) {
    app.use(compression());
    app.use(helmet());
  }

  // ✅ Use built-in Express body parser instead of body-parser
  app.use(express.json({ limit: '50mb' }));  
  app.use(express.urlencoded({ limit: '50mb', extended: true }));  

  app.use(passport.initialize());

  // CORS Middleware
  app.use((req, res, next) => {
    const methods = "GET, POST";
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", methods);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

    if (req.method === 'OPTIONS') {
      return res.status(204).send();
    }
    next();
  });

  if (isDev) {
    app.use(morgan('dev'));
  }
};
