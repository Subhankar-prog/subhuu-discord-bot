const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'reminders.json');

function loadReminders() {
  if (!fs.existsSync(DATA_PATH)) return [];
  try { return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')); } catch { return []; }
}

function saveReminders(data) {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function addReminder(userId, channelId, message, endTime) {
  const reminders = loadReminders();
  reminders.push({ userId, channelId, message, endTime });
  saveReminders(reminders);
}

function startReminderCheck(client) {
  setInterval(() => {
    const reminders = loadReminders();
    const now = Date.now();
    let changed = false;

    for (let i = reminders.length - 1; i >= 0; i--) {
      const r = reminders[i];
      if (now >= r.endTime) {
        // Send reminder
        const channel = client.channels.cache.get(r.channelId);
        if (channel) {
          channel.send(`⏰ <@${r.userId}> **Reminder:** ${r.message}`).catch(() => {});
        } else {
          // Fallback to DM if channel is gone
          client.users.fetch(r.userId).then(user => {
            user.send(`⏰ **Reminder:** ${r.message}`).catch(() => {});
          }).catch(() => {});
        }
        // Remove from list
        reminders.splice(i, 1);
        changed = true;
      }
    }

    if (changed) saveReminders(reminders);
  }, 15000); // Check every 15 seconds
}

module.exports = {
  addReminder,
  startReminderCheck
};
