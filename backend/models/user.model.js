// Import required modules
const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Define the user schema
const userSchema = new mongoose.Schema({
  // Username field
  username: {
    type: String,
    required: true
  },

  // Email field with validation
  email: {
    type: String,
    required: true,
    unique: true,
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  },

  // Password field
  password: {
    type: String,
    required: true
  }
},
  {
    timestamps: true
  });


// Method to generate JWT token
userSchema.methods.generateToken = async function () {
  const token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY, {
    expiresIn: '1h'
  });
  return token;
};


// Create a mongoose model from the schema
const User = mongoose.model('User', userSchema);

// Export the User model
module.exports = User;