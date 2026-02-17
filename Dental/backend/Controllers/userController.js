const User = require('../Models/User');
const { hashPassword, comparePassword, signToken } = require('../Helpers/auth');
const crypto = require('crypto');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

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

async function toggleUserStatus(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Toggle the isActive status
    user.isActive = !user.isActive;
    await user.save();

    return res.json({ 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      isActive: user.isActive,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (err) {
    console.error('Toggle user status error:', err);
    return res.status(500).json({ error: 'Failed to toggle user status' });
  }
}
 
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
      permissions: u.permissions || [],
      imageConversionLimit: u.imageConversionLimit,
      imageConversionsUsed: u.imageConversionsUsed,
      canShowImprovementPlans: u.canShowImprovementPlans,
      lastResetDate: u.lastResetDate,
      photoUrl: u.photoUrl || '',
      city: u.city || '',
      state: u.state || '',
      phone: u.phone || '',
      isActive: u.isActive !== undefined ? u.isActive : true,
      subscriptionPlan: u.subscriptionPlan || 'Free',
      subscriptionStatus: u.subscriptionStatus || 'active',
      createdAt: u.createdAt,
      lastLogin: u.lastLogin || null,
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

async function updateDoctorLimits(req, res) {
  try {
    // Only admin can update doctor limits
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { imageConversionLimit, canShowImprovementPlans } = req.body;
    
    if (imageConversionLimit !== undefined) {
      if (typeof imageConversionLimit !== 'number' || imageConversionLimit < 0) {
        return res.status(400).json({ error: 'imageConversionLimit must be a non-negative number' });
      }
      user.imageConversionLimit = imageConversionLimit;
    }
    
    if (canShowImprovementPlans !== undefined) {
      user.canShowImprovementPlans = Boolean(canShowImprovementPlans);
    }
    
    await user.save();
    
    return res.json({ 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role,
      imageConversionLimit: user.imageConversionLimit,
      imageConversionsUsed: user.imageConversionsUsed,
      canShowImprovementPlans: user.canShowImprovementPlans,
      lastResetDate: user.lastResetDate
    });
  } catch (err) {
    console.error('Update doctor limits error:', err);
    return res.status(500).json({ error: 'Failed to update doctor limits' });
  }
}

async function resetDoctorUsage(req, res) {
  try {
    // Only admin can reset usage
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.imageConversionsUsed = 0;
    user.lastResetDate = new Date();
    await user.save();
    
    return res.json({ 
      id: user._id, 
      name: user.name,
      imageConversionsUsed: user.imageConversionsUsed,
      lastResetDate: user.lastResetDate,
      message: 'Usage reset successfully'
    });
  } catch (err) {
    console.error('Reset doctor usage error:', err);
    return res.status(500).json({ error: 'Failed to reset usage' });
  }
}

async function getDoctorUsageStats(req, res) {
  try {
    const userId = req.params.id || req.user.id;
    
    // Doctors can view their own stats, admins can view anyone's
    if (req.user.role !== 'admin' && userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      imageConversionLimit: user.imageConversionLimit,
      imageConversionsUsed: user.imageConversionsUsed,
      remainingConversions: Math.max(0, user.imageConversionLimit - user.imageConversionsUsed),
      canShowImprovementPlans: user.canShowImprovementPlans,
      lastResetDate: user.lastResetDate
    });
  } catch (err) {
    console.error('Get doctor usage stats error:', err);
    return res.status(500).json({ error: 'Failed to get usage stats' });
  }
}

async function updateUserPassword(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordHash = await hashPassword(newPassword);
    user.password = passwordHash;
    await user.save();

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      message: 'Password updated successfully'
    });
  } catch (err) {
    console.error('Update user password error:', err);
    return res.status(500).json({ error: 'Failed to update password' });
  }
}

module.exports = { 
  updateUser, 
  listUsers, 
  createUser, 
  updatePermissions, 
  getAvailableModules,
  updateDoctorLimits,
  resetDoctorUsage,
  getDoctorUsageStats,
  toggleUserStatus,
  updateUserPassword
};

// Self-service endpoints
async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
      phone: user.phone,
      city: user.city,
      state: user.state,
      pincode: user.pincode,
      photoUrl: user.photoUrl,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
    });
  } catch (err) {
    console.error('Get me error:', err);
    return res.status(500).json({ error: 'Failed to get profile' });
  }
}

// Combined user details endpoint: profile + subscription + usage limits
async function getMyDetails(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
      phone: user.phone,
      city: user.city,
      state: user.state,
      pincode: user.pincode,
      photoUrl: user.photoUrl,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
      // usage/limits
      imageConversionLimit: user.imageConversionLimit,
      imageConversionsUsed: user.imageConversionsUsed,
      canShowImprovementPlans: user.canShowImprovementPlans,
      lastResetDate: user.lastResetDate,
      client: user.client,
    });
  } catch (err) {
    console.error('Get my details error:', err);
    return res.status(500).json({ error: 'Failed to get details' });
  }
}

async function updateMe(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { name, phone, city, state, pincode, photoUrl } = req.body;
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (pincode !== undefined) user.pincode = pincode;
    if (photoUrl !== undefined) user.photoUrl = photoUrl;
    await user.save();
    return res.json({ success: true });
  } catch (err) {
    console.error('Update me error:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}

async function changeMyPassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const ok = await comparePassword(currentPassword, user.password);
    if (!ok) return res.status(400).json({ error: 'Current password is incorrect' });
    user.password = await hashPassword(newPassword);
    await user.save();
    return res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'Failed to change password' });
  }
}

async function getMyPlan(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ plan: user.subscriptionPlan, status: user.subscriptionStatus });
  } catch (err) {
    console.error('Get plan error:', err);
    return res.status(500).json({ error: 'Failed to get plan' });
  }
}

async function updateMyPlan(req, res) {
  try {
    const { plan } = req.body;
    if (!['Free', 'Pro', 'Enterprise'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.subscriptionPlan = plan;
    user.subscriptionStatus = 'active';
    await user.save();
    return res.json({ plan: user.subscriptionPlan, status: user.subscriptionStatus });
  } catch (err) {
    console.error('Update plan error:', err);
    return res.status(500).json({ error: 'Failed to update plan' });
  }
}

async function adminResetUserPassword(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    return res.json({ message: 'Reset link generated', resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined });
  } catch (err) {
    console.error('Admin reset password error:', err);
    return res.status(500).json({ error: 'Failed to generate reset' });
  }
}

async function deleteUser(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await User.deleteOne({ _id: user._id });
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
}

async function uploadMyPhoto(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const baseDir = path.join(process.cwd(), 'public', 'uploads', 'users', user._id.toString());
    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
    const ts = Date.now();
    const outName = `${ts}.jpg`;
    const outPath = path.join(baseDir, outName);
    const pipeline = sharp(req.file.buffer).rotate().resize({ width: 512, height: 512, fit: 'cover' }).jpeg({ quality: 85 });
    await pipeline.toFile(outPath);
    const relPath = `uploads/users/${user._id.toString()}/${outName}`;
    user.photoUrl = `/${relPath}`;
    await user.save();
    return res.json({ photoUrl: user.photoUrl });
  } catch (err) {
    console.error('Upload photo error:', err);
    return res.status(500).json({ error: 'Failed to upload photo' });
  }
}

module.exports.getMe = getMe;
module.exports.getMyDetails = getMyDetails;
module.exports.updateMe = updateMe;
module.exports.changeMyPassword = changeMyPassword;
module.exports.getMyPlan = getMyPlan;
module.exports.updateMyPlan = updateMyPlan;
module.exports.adminResetUserPassword = adminResetUserPassword;
module.exports.deleteUser = deleteUser;
module.exports.uploadMyPhoto = uploadMyPhoto;
