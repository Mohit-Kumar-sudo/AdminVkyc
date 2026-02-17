const User = require('../Models/User');
const { hashPassword, comparePassword, signToken } = require('../Helpers/auth');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

async function register(req, res) {
  try {
    const { name, email, password, phone, city, state, pincode } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }
    if (phone) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: 'Please provide a valid 10-digit Indian mobile number starting with 6-9' });
      }
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(409).json({ error: 'This phone number is already registered' });
      }
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, email, password: passwordHash, phone, city, state, pincode });

    const token = signToken({ sub: user._id.toString(), email: user.email }, { expiresIn: '6h' });
    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, permissions: user.permissions || [], phone: user.phone },
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Failed to register' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await comparePassword(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    const token = signToken({ sub: user._id.toString(), email: user.email }, { expiresIn: '6h' });
    return res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, permissions: user.permissions || [] },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to login' });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If this email exists, a password reset link will be sent.' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    console.log('Password reset URL:', resetUrl);

    return res.json({ 
      message: 'If this email exists, a password reset link will be sent.',
      resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    user.password = await hashPassword(newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
}

async function googleLogin(req, res) {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'idToken is required' });

    if (!googleClient) {
      return res.status(500).json({ error: 'Google client not configured on server' });
    }

    const ticket = await googleClient.verifyIdToken({ idToken, audience: googleClientId });
    const payload = ticket.getPayload();
    if (!payload) return res.status(401).json({ error: 'Invalid Google token' });

    const { sub: googleId, email, name, picture } = payload;
    if (!email) return res.status(400).json({ error: 'Google account missing email' });

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (!user) {
      return res.status(404).json({ 
        error: 'No account found with this Google account. Please sign up first.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Link Google account if user exists but doesn't have googleId yet
    if (!user.googleId) {
      user.googleId = googleId;
      if (picture && !user.photoUrl) user.photoUrl = picture;
    }
    
    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    const token = signToken({ sub: user._id.toString(), email: user.email }, { expiresIn: '6h' });
    return res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, permissions: user.permissions || [], photoUrl: user.photoUrl },
      token,
    });
  } catch (err) {
    console.error('Google login error:', err);
    return res.status(500).json({ error: 'Failed to login with Google' });
  }
}

async function googleRegister(req, res) {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'idToken is required' });

    if (!googleClient) {
      return res.status(500).json({ error: 'Google client not configured on server' });
    }

    const ticket = await googleClient.verifyIdToken({ idToken, audience: googleClientId });
    const payload = ticket.getPayload();
    if (!payload) return res.status(401).json({ error: 'Invalid Google token' });

    const { sub: googleId, email, name, picture } = payload;
    if (!email) return res.status(400).json({ error: 'Google account missing email' });

    // Check if user already exists
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (user) {
      return res.status(409).json({ 
        error: 'An account with this email already exists. Please login instead.',
        code: 'USER_EXISTS'
      });
    }

    // Create new user with Google account
    const tempPassword = crypto.randomBytes(16).toString('hex');
    const passwordHash = await hashPassword(tempPassword);
    user = await User.create({ 
      name: name || email.split('@')[0], 
      email, 
      googleId, 
      password: passwordHash, 
      photoUrl: picture 
    });

    const token = signToken({ sub: user._id.toString(), email: user.email }, { expiresIn: '6h' });
    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, permissions: user.permissions || [], photoUrl: user.photoUrl },
      token,
    });
  } catch (err) {
    console.error('Google register error:', err);
    return res.status(500).json({ error: 'Failed to register with Google' });
  }
}

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  googleLogin,
  googleRegister
};
