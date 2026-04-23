const Item = require('../models/feed.model');
const { sendNotificationToAll } = require('../Helpers/notificationsHelper');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const WhatsappNumbers = require("../models/whatsapp.model");
const client = require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


module.exports = {
  create: async (req, res) => {
    try {
      const { title, isActive } = req.body;
      const image = req.file ? req.file.path : null; 
      
      const item = await Item.create({ title, image, isActive });
      
      const io = req.app.get('io');
      const connectedUsers = req.app.get('connectedUsers');

const users = await User.find({}, "_id");

const notificationsToInsert = users.map(u => ({
  userId: u._id,
  type: "new_feed",
  title: "New Post Added! 📢",
  message: title,
  feedId: item._id,
  feedImage: image
}));

await Notification.insertMany(notificationsToInsert);

if (isActive && io && connectedUsers) {
  users.forEach(u => {
    const socketId = connectedUsers[u._id];
    if (socketId) {
      io.to(socketId).emit("new_notification", {
        type: "new_feed",
        title: "New Post Added! 📢",
        message: title,
        feedId: item._id,
        feedImage: image
      });
    }
  });
}
try {
        const numbers = await WhatsappNumbers.find({}, "number");

        const today = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        for (const n of numbers) {
          if (!n.number.startsWith('+')) {  // must include country code
            console.log(`Invalid WhatsApp number: ${n.number}`);
            continue;
          }

          await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER,  // from .env
            to: `whatsapp:${n.number}`,
            body: `📢 New Post Added!\n\n📰 Title: ${title}\n Image:${image} 📅 Date: ${today}\n⏰ Time: ${time}`
          }).catch(err => console.log("WhatsApp Send Error ➜", err.message));
        }
      } catch (whatsappErr) {
        console.log("WhatsApp Processing Error ➜", whatsappErr.message);
      }

      
      res.status(201).json({
        success: true,
        message: 'Feed created successfully',
        data: item
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

 get: async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: items
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
},

  delete: async (req, res) => {
    try {
      const item = await Item.findByIdAndDelete(req.params.id);
      if (!item) {
        return res.status(404).json({ 
          success: false,
          message: 'Item not found' 
        });
      }

      await Notification.deleteMany({ feedId: req.params.id });

      res.json({ 
        success: true,
        message: 'Item deleted successfully' 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }
};
