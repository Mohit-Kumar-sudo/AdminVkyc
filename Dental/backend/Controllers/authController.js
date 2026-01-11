const User = require('../Models/User');
const { hashPassword, comparePassword, signToken } = require('../Helpers/auth');

async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    // Validate Indian phone number if provided
    if (phone) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: 'Please provide a valid 10-digit Indian mobile number starting with 6-9' });
      }
      
      // Check if phone number already exists
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
    const user = await User.create({ name, email, password: passwordHash, phone });

    const token = signToken({ sub: user._id.toString(), email: user.email });
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

    const token = signToken({ sub: user._id.toString(), email: user.email });
    return res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, permissions: user.permissions || [] },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to login' });
  }
}

module.exports = { register, login };
