const User = require('../Models/User');
const { hashPassword, comparePassword, signToken } = require('../Helpers/auth');

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, email, password: passwordHash });

    const token = signToken({ sub: user._id.toString(), email: user.email });
    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, permissions: user.permissions || [] },
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
