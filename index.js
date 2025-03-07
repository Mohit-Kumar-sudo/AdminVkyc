const express = require('express');
const createError = require('http-errors');
const morgan = require('morgan');
require('dotenv').config();
require('./config/database');
const constants = require("./config/constants");
const middlewaresConfig = require("./config/middleware");
const logger = require('./config/logger')
const cors = require('cors');
const app = express();
app.use(cors());
app.use(morgan("combined", { stream: logger.stream }));
middlewaresConfig(app);

// Define your routes here
app.use('/api/v1/users', require('./Routes/User.Route'));
app.use('/api/v1/report', require('./Routes/Reports.Route'));
app.use('/api/v1/reportAccess',require('./Routes/Reports_access.Route'));
app.use('',require('./Routes/stock.Routes'));
app.use('/api/v1/leads/',require('./Routes/leads-db.Routes'));
app.use('/api/v1/chart/',require('./Routes/chart.Routes'));
app.use('',require('./Routes/google_scrapping.Routes'));
app.use('',require('./Routes/Videos.Route'))
app.use('',require('./Routes/stock.Routes'))
app.use('/api/v1/me/',require('./Routes/me.Routes'))
app.use('/api/v1/left_menu/',require('./Routes/sidebar.Routes'))
app.use('/api/v1/', require('./Routes/toc.Routes'));
app.use('/api/v1/company/', require('./Routes/cp.Routes'))

app.get("/", (req, res) => {
  // HTML content as a string
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Access Denied</title>
    <style>
      body {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
      }
    </style>
  </head>
  <body>
    <h1>Access Denied</h1>
  </body>
  </html>
  `;

  // Send HTML as the response
  res.send(htmlContent);
});

// Handle 404 errors
app.use((req, res, next) => {
    next(createError(404, 'This route does not exist'));
});

// Global error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        error: {
            status: err.status || 500,
            message: err.message,
        }
    });
});

// Start the server
const PORT = constants.PORT;
app.listen(PORT, err => {
  if (err) {
    throw err;
  } else {
    console.log(`
      Server running on port ${PORT}
      ----------
      Running on process ${process.env.NODE_ENV || 'unknown'}
      ----------
      Lets Restify with Node
    `);
  }
});
