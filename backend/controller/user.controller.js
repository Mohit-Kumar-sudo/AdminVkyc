// Import required modules
const User = require('../models/user.model.js'); // Import User model
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const jwt = require('jsonwebtoken'); // Import jsonwebtoken for token generation
const Joi = require('joi'); // Import Joi for input validation

// Define input validation schema for registration
const validationSchema = Joi.object().keys({
  username: Joi.string().max(50).required(), // Username must be a string, max 50 characters, and required
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,}$')).required(), // Password must be a string, match the regex pattern (at least 8 characters, alphanumeric), and required
  email: Joi.string().email().required() // Email must be a string, a valid email address, and required
});

// Register user function
const register = async (req, res, next) => {
  try {
    // Extract username, email, and password from request body
    const { username, email, password } = req.body;

        // Validate input data using Joi schema
        const result = validationSchema.validate({ username, email, password });

        if (result.error) {
          // If validation fails, return a 400 error with validation errors
          return res.status(400).send({ error: result.error.details });
        }

    // Check if a user with the same username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      // If a user exists, return a 400 error with a message
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    // Create a new User instance with the request body data
    const user = new User({ username, email, password: hashedPassword });
    console.log(user.password);
    // Save the user to the database
    await user.save();

    // Return a 201 success response with a message
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    // Catch any errors during registration and return a 500 error with a message
    console.error('Error during registration:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Login user function
const login = async (req, res) => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;
    console.log(password);
    // Find a user with the matching email
    const user = await User.findOne({ email });
    console.log(user.password);

    if (!user) {
      // If no user is found, return a 401 error with a message
      return res.status(401).json({ error: 'Invalid email' });
    }

    // Compare the provided password with the stored password using the comparePassword method
    const isValid = await bcrypt.compare(password, user.password);
    console.log(isValid);
    if (!isValid) {
      // If the password is invalid, return a 401 error with a message
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate a JSON Web Token (JWT) with the user's ID, email, and username
    const token = jwt.sign({ _id: user._id, email: user.email, name: user.username }, process.env.SECRET_KEY, { expiresIn: '1h' });

    // Return the generated token in the response
    return res.json({ token , _id: user._id, email: user.email, name: user.username });
  } catch (error) {
    // Catch any errors during login and return a 500 error with a message
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Logout user function
const logout = async (req, res) => {
  try {
    // Check if the user is already logged out
    if (!req.headers.authorization) {
      // If the user is already logged out, return a 401 error with a message
      return res.status(401).json({ error: `User with email ${req.user.email} is already logged out` });
    }

    // Remove the token from the request headers
    req.headers.authorization = null;

    // Return a 200 success response with a message
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    // Catch any errors during logout and return a 500 error with a message
    console.error('Error during logout:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Reset email function
const resetEmail = async (req, res) => {
  try {
    // Extract new email from request body
    const { newEmail } = req.body;

    console.log('newEmail:', newEmail); // Add this line to check the value of newEmail

    // Validate new email using Joi schema
    const result = Joi.string().email().required().validate(newEmail);

    console.log('result:', result); // Add this line to check the result of validation

    if (result.error) {
      // If validation fails, return a 400 error with validation errors
      console.log('Validation error:', result.error); // Add this line to check the error details
      return res.status(400).send({ error: result.error.details });
    }

    // Extract token from request headers
    const token = req.headers.authorization;

    // Verify token using jsonwebtoken
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Find user by ID from token
    const user = await User.findById(decoded._id);

    if (!user) {
      // If no user is found, return a 401 error with a message
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Update user's email
    user.email = newEmail;

    // Save the updated user to the database
    await user.save();

    // Return a 200 success response with a message
    return res.status(200).json({ message: "Email updated successfully" });
  } catch (error) {
    // Catch any errors during email reset and return a 500 error with a message
    console.error('Error during email reset:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Reset password function
const resetPassword = async (req, res) => {
  try {
    // Extract old password, new password, and confirm new password from request body
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    // Validate old password, new password, and confirm new password using Joi schema
    const result = Joi.object().keys({
      oldPassword: Joi.string().required(),
      newPassword: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,}$')).required(),
      confirmNewPassword: Joi.string().required().valid(Joi.ref('newPassword'))
    }).validate({ oldPassword, newPassword, confirmNewPassword });

    if (result.error) {
      // If validation fails, return a 400 error with validation errors
      return res.status(400).send({ error: result.error.details });
    }

    // Extract token from request headers
    const token = req.headers.authorization;

    // Verify token using jsonwebtoken
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Find user by ID from token
    const user = await User.findById(decoded._id);

    if (!user) {
      // If no user is found, return a 401 error with a message
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Compare old password with stored password using bcrypt
    const isValid = await bcrypt.compare(oldPassword, user.password);

    if (!isValid) {
      // If old password is invalid, return a 401 error with a message
      return res.status(401).json({ error: 'Invalid old password' });
    }

    // Hash new password using bcrypt
    const hash = await bcrypt.hash(newPassword, 10);

    // Update user's password
    user.password = hash;

    // Save the updated user to the database
    await user.save();

    // Return a 200 success response with a message
    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    // Catch any errors during password reset and return a 500 error with a message
    console.error('Error during password reset:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Reset username function
const resetUsername = async (req, res) => {
  try {
    // Extract new username from request body
    const { newUsername } = req.body;

    // Validate new username using Joi schema
    const result = Joi.string().max(50).required().validate(newUsername);

    if (result.error) {
      // If validation fails, return a 400 error with validation errors
      return res.status(400).send({ error: result.error.details });
    }

    // Extract token from request headers
    const token = req.headers.authorization;

    // Verify token using jsonwebtoken
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Find user by ID from token
    const user = await User.findById(decoded._id);

    if (!user) {
      // If no user is found, return a 401 error with a message
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Update user's username
    user.username = newUsername;

    // Save the updated user to the database
    await user.save();

    // Return a 200 success response with a message
    return res.status(200).json({ message: "Username updated successfully" });
  } catch (error) {
    // Catch any errors during username reset and return a 500 error with a message
    console.error('Error during username reset:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


// DELETE USER
const deleteUser = async (req, res) => {
  try {
    console.log('Deleting user...');

    // Find user by ID from token
    console.log('Finding user by ID:', req.user._id);
    const user = await User.findById(req.user._id);

    console.log('User found:', user);

    if (!user) {
      // If no user is found, return a 401 error with a message
      console.log('No user found');
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Delete user from database
    console.log('Deleting user from database...');
    await User.deleteOne({ _id: req.user._id });

    console.log('User deleted successfully');

    // Return a 200 success response with a message
    return res.status(200).json({ message: "User account deleted successfully" });
  } catch (error) {
    // Log the error
    console.error('Error during user deletion:', error);

    // Return a 500 error with a message
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Export functions
module.exports = {
  register,
  login,
  logout,
  resetEmail,
  resetPassword,
  resetUsername,
  deleteUser
};