const { Reminder } = require('./database');

async function addReminder(userId, channelId, message, delayMs) {
  const reminder = new Reminder({
    userId,
    channelId,
    message,
    timestamp: Date.now() + delayMs
  });
  await reminder.save();
}

async function checkReminders(client) {
  const now = Date.now();
  const dueReminders = await Reminder.find({ timestamp: { $lte: now } });

  for (const reminder of dueReminders) {
    try {
      const channel = await client.channels.fetch(reminder.channelId);
      if (channel) {
        channel.send(`⏰ <@${reminder.userId}>, here is your reminder: **${reminder.message}**`).catch(() => {});
      }
    } catch (err) {
      // Channel might have been deleted
    }
    // Delete the reminder after it triggers
    await Reminder.deleteOne({ _id: reminder._id });
  }
}

function initReminders(client) {
  setInterval(() => {
    checkReminders(client);
  }, 10000); // Check every 10 seconds
}

module.exports = {
  addReminder,
  initReminders
};
