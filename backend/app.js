require('dotenv').config(); // Load environment variables from .env file
// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const userRoutes = require('./routes/user.routes.js');
const contactRoutes = require('./routes/contact.routes.js');
const blogRoutes = require('./routes/blogs.routes.js');

// Create an Express app
const app = express();

const AdminDatabase = process.env.DATABASE;
mongoose.connect(AdminDatabase);

// Use body-parser to parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Use body-parser to parse requests of content-type - application/json
app.use(bodyParser.json());

// Enable CORS
app.use(cors());

// Use Express JSON parser
app.use(express.json());
app.use('/images', express.static('uploads'));

// Use authentication routes
app.use('/admin', userRoutes);

// Define a simple route
app.get('/', (req, res) => {
  res.json({
    "message": "Welcome to application."
  });
});

// Use contact routes
contactRoutes(app);

// Use blog routes
blogRoutes(app);

// Start the server on port 5000
const port = process.env.PORT;
const DB = process.env.DATABASE
app.listen(port, () => {
  console.log('DB Connected', DB)
  console.log(`Server started on port ${port}`);
});