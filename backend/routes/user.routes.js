// Import required modules
const express = require('express');
const router = express.Router();

// Import controllers and middleware
const { register, login, logout, resetEmail, resetPassword, resetUsername, deleteUser } = require('../controller/user.controller.js');
const { verifyToken } = require('../middleware/verifytokendata.js');

// Define routes
/**
 * Register a new user
 */
router.post('/register', register);

/**
 * Login an existing user
 */
router.post('/login', login);

/**
 * Logout the current user
 */
router.get('/logout', verifyToken, logout);

/**
 * Reset email address
 */
//router.patch('/reset-email', verifyToken, resetEmail);

/**
 * Reset password
 */
//router.patch('/reset-password', verifyToken, resetPassword);

/**
 * Reset username
 */
//router.patch('/reset-username', verifyToken, resetUsername);

/**
 * Delete user account
 */
router.delete('/delete-account', verifyToken, deleteUser);

/**
 * Protected route
 */
router.get('/protected', verifyToken, (req, res) => {
  res.send('Hello, ' + req.user.name);
});

// Export the router
module.exports = router;