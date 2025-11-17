const Notification = require('../models/notification.model');

module.exports = {
  // Get all notifications for a user
  getAll: async (req, res) => {
    try {
      const { userId } = req.query; // Pass userId as query param
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId is required'
        });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('feedId', 'title image isActive');

      const total = await Notification.countDocuments({ userId });
      const unreadCount = await Notification.countDocuments({ 
        userId, 
        isRead: false 
      });

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          },
          unreadCount
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Mark single notification as read
  markAsRead: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      const notification = await Notification.findOneAndUpdate(
        { _id: id, userId },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.json({
        success: true,
        data: notification
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId is required'
        });
      }

      const result = await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );

      res.json({
        success: true,
        message: 'All notifications marked as read',
        data: {
          modifiedCount: result.modifiedCount
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Delete notification
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      const notification = await Notification.findOneAndDelete({
        _id: id,
        userId
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get unread count
  getUnreadCount: async (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId is required'
        });
      }

      const count = await Notification.countDocuments({ 
        userId, 
        isRead: false 
      });

      res.json({
        success: true,
        data: {
          unreadCount: count
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};