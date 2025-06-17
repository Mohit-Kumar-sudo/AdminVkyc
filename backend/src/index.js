/* eslint-disable no-console */
import express from 'express';

import constants from './config/constants';
import './config/database';
import middlewaresConfig from './config/middleware';
import apiRoutes from './modules';
import morgan from 'morgan';
import logger from './logs/logs';

const app = express();

// Passing app object to middle config compoent
app.use(morgan("combined", { stream: logger.stream })); //morgan global error handler
middlewaresConfig(app);

app.get('/', (req, res) => {
  res.send('Hello World');
});

apiRoutes(app);

const PORT = constants.PORT;

const apps = app.listen(PORT, err => {
  if (err) {
    throw err;
  } else {

    console.log(`
            Server running on port ${PORT}
            ----------
            Running on process ${process.env.NODE_ENV}
            ----------
            Lets Restify with Node
        `);
  }
});

apps.setTimeout(300000)
