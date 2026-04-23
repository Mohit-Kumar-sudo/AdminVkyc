const cron = require("node-cron");
const mongoose = require("mongoose");
const Item = require("../models/feed.model");
const Notification = require("../models/notification.model");

// Run every night at 12:00 AM
cron.schedule("0 0 * * *", async () => {
  if (mongoose.connection.readyState !== 1) {
    console.error("[NODE-CRON] [ERROR] Skipping cron: MongoDB not connected");
    return;
  }
  try {
    const cutoff = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);

    const oldFeeds = await Item.find({ createdAt: { $lt: cutoff } });
    const oldFeedIds = oldFeeds.map(f => f._id);

    await Item.deleteMany({ _id: { $in: oldFeedIds } });
    await Notification.deleteMany({ feedId: { $in: oldFeedIds } });

    console.log(`Auto deleted ${oldFeedIds.length} old feeds`);
  } catch (err) {
    console.error('[NODE-CRON] [ERROR]', err.message);
  }
});
