const User = require('../Models/User');
const { hashPassword } = require('../Helpers/auth');

async function updateUser(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { role, client, phone, name } = req.body;
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (role !== undefined) user.role = role;
    if (client !== undefined) user.client = client || undefined;

    await user.save();
    return res.json({ id: user._id, name: user.name, email: user.email, role: user.role, client: user.client });
  } catch (err) {
    console.error('Update user error:', err);
    return res.status(500).json({ error: 'Failed to update user' });
  }
}

module.exports = { updateUser };
 
async function listUsers(req, res) {
  try {
    const { role, clientId, q } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (clientId) filter.client = clientId;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }
    const users = await User.find(filter).sort({ createdAt: -1 });
    return res.json(users.map(u => ({ 
      id: u._id, 
      name: u.name, 
      email: u.email, 
      role: u.role, 
      client: u.client,
      permissions: u.permissions || []
    })));
  } catch (err) {
    console.error('List users error:', err);
    return res.status(500).json({ error: 'Failed to list users' });
  }
}

async function createUser(req, res) {
  try {
    const { name, email, password, role, client } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, email, password: passwordHash, role: role || 'doctor', client });
    return res.status(201).json({ 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      client: user.client,
      permissions: user.permissions || []
    });
  } catch (err) {
    console.error('Create user error:', err);
    return res.status(500).json({ error: 'Failed to create user' });
  }
}

async function updatePermissions(req, res) {
  try {
    // Only super admin (role=admin) can update permissions
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { permissions } = req.body;
    if (!Array.isArray(permissions)) {
      return res.status(400).json({ error: 'permissions must be an array' });
    }

    user.permissions = permissions;
    await user.save();
    
    return res.json({ 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      permissions: user.permissions 
    });
  } catch (err) {
    console.error('Update permissions error:', err);
    return res.status(500).json({ error: 'Failed to update permissions' });
  }
}

async function getAvailableModules(req, res) {
  try {
    const modules = ['patients', 'appointments', 'users', 'clients', 'dashboard'];
    return res.json({ modules });
  } catch (err) {
    console.error('Get modules error:', err);
    return res.status(500).json({ error: 'Failed to get modules' });
  }
}

module.exports = { updateUser, listUsers, createUser, updatePermissions, getAvailableModules };
